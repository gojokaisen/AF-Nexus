import chalk from 'chalk';
import config from '../config.js';
import { commands, generateRandomDelay } from '../index.js';
import db from '../db.js';

class ReplyManager {
    constructor() {
        this.replyListeners = new Map();
    }

    registerReplyListener(messageId, callback, options = {}) {
        const { timeout = 5 * 60 * 1000, oneTime = true, filter = () => true } = options;
        const listener = {
            callback,
            createdAt: Date.now(),
            timeout,
            oneTime,
            filter,
        };
        this.replyListeners.set(messageId, listener);
        setTimeout(() => {
            this.removeReplyListener(messageId);
        }, timeout);
    }

    async handleReply(api, message) {
        const replyListener = this.replyListeners.get(message.messageReply.messageID);
        if (!replyListener) return false;
        if (!replyListener.filter(message)) return false;
        try {
            await replyListener.callback(message);
            if (replyListener.oneTime) {
                this.removeReplyListener(message.messageReply.messageID);
            }
            return true;
        } catch (error) {
            console.error(chalk.red('Error in reply listener:'), error);
            this.removeReplyListener(message.messageReply.messageID);
            return false;
        }
    }

    removeReplyListener(messageId) {
        this.replyListeners.delete(messageId);
    }

    cleanupExpiredListeners() {
        const now = Date.now();
        for (const [messageId, listener] of this.replyListeners.entries()) {
            if (now - listener.createdAt > listener.timeout) {
                this.replyListeners.delete(messageId);
            }
        }
    }
}

const replyManager = new ReplyManager();
const commandCache = new Map();

const formatTechMessage = (text) => {
    return `[𝗔𝗙 𝗡𝗘𝗫𝗨𝗦 v2.0 ]━━━━━━━\n${text}\n━━━━━━━━[ ⚡ END ]━━━`;
};

async function loadCommand(commandName) {
    try {
        const commandPath = `../commands/${commandName}.js`;
        const module = await import(commandPath + '?t=' + Date.now());
        commandCache.set(commandName, module.default);
        return module.default;
    } catch (error) {
        console.error(chalk.red(`Failed to load command ${commandName}:`, error));
        return null;
    }
}

export default async function commandHandler(api, message) {
    const nexusMessage = {
        reply: async (response) => {
            api.sendMessage(formatTechMessage(response), message.threadID, message.messageID);
        },
        replyWithCallback: async (response, callback) => {
            const sentMessage = await api.sendMessage(formatTechMessage(response), message.threadID, message.messageID);
            replyManager.registerReplyListener(sentMessage.messageID, callback);
        },
    };

    api.getUserInfo(message.senderID, async (err, userInfo) => {
        if (err) {
            console.error(err);
            return;
        }
        const user = userInfo[message.senderID];
        const existingUser = db.getUser(message.senderID) || {};
        db.setUser(message.senderID, {
            ...existingUser,
            name: user.name,
            coins: existingUser.coins || 0,
            lastActive: Date.now()
        });
    });

    api.getThreadInfo(message.threadID, async (err, threadInfo) => {
        if (err) {
            console.error(err);
            return;
        }
        const existingGroup = db.getGroup(message.threadID) || {};
        const groupPrefix = db.getGroupPrefix(message.threadID) || config.prefix;
        db.setGroup(message.threadID, {
            ...existingGroup,
            name: threadInfo.name,
            prefix: groupPrefix,
            lastActive: Date.now()
        });
    });

    const groupPrefix = db.getGroupPrefix(message.threadID) || config.prefix;
    const messageBody = message.body ? message.body.trim() : '';

    if (config.logging.messageObjects) {
        console.log('Message object:', message);
    }

    if (message.type === 'message_reply') {
        const originalMessageID = message.messageReply.messageID;
        const replyListener = replyManager.replyListeners.get(originalMessageID);
        if (replyListener) {
            await replyListener.callback(message);
            delete replyManager.replyListeners[originalMessageID];
            return;
        }
    }

    if (message.type === 'typ' || message.type === 'presence') {
        return;
    }

    const handleBannedUser = () => {
        if (db.isBannedUser(message.senderID)) {
            const reason = db.readDB().bannedUsers[message.senderID];
            api.sendMessage(formatTechMessage(`⛔ ACCESS DENIED\n\n👤 User Status: Banned\n📝 Reason: ${reason}`), message.threadID, message.messageID);
            return true;
        }
        return false;
    };

    const handleBannedThread = () => {
        if (db.isBannedThread(message.threadID)) {
            const reason = db.readDB().bannedThreads[message.threadID];
            api.sendMessage(formatTechMessage(`⛔ GROUP ACCESS DENIED\n\n👥 Group Status: Banned\n📝 Reason: ${reason}`), message.threadID, message.messageID);
            return true;
        }
        return false;
    };

    const handleAdminOnly = () => {
        if (global.adminOnlyMode && !global.adminBot.includes(message.senderID)) {
            nexusMessage.reply("🔒 ADMIN MODE ACTIVE\n\n⚠️ Only system administrators can access commands at this time.");
            return true;
        }
        return false;
    };

    if (!messageBody.startsWith(groupPrefix)) {
        for (const [cmdName, command] of commands.entries()) {
            if (command.onChat && typeof command.onChat === 'function') {
                if (messageBody.toLowerCase().startsWith(command.config.name.toLowerCase() + ' ') || 
                    messageBody.toLowerCase() === command.config.name.toLowerCase()) {
                    if (handleBannedUser() || handleBannedThread() || handleAdminOnly()) return;
                    
                    const freshCommand = await loadCommand(cmdName);
                    if (freshCommand) {
                        const args = messageBody.toLowerCase() === command.config.name.toLowerCase() ? 
                            [] : messageBody.trim().split(' ').slice(1);
                        
                        freshCommand.onChat({
                            api,
                            message,
                            args,
                            config,
                            nexusMessage,
                            db,
                            onReply: async (reply) => {
                                await freshCommand.onReply?.({
                                    api,
                                    message,
                                    reply,
                                    config,
                                    nexusMessage,
                                    db
                                });
                            },
                            sendMessage: async (text) => {
                                const sentMessage = await api.sendMessage(formatTechMessage(text), message.threadID);
                                return sentMessage;
                            },
                        });
                    }
                }
            }
        }
        return;
    }

    const args = messageBody.slice(groupPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    let command = commands.get(commandName);
    if (!command) {
        command = Array.from(commands.values()).find((cmd) => 
            cmd.config.aliases && cmd.config.aliases.includes(commandName)
        );
    }

    if (handleBannedUser() || handleBannedThread() || handleAdminOnly()) return;

    if (!command) {
        nexusMessage.reply(`❌ COMMAND NOT FOUND\n\n📋 Command: "${commandName}"\n💡 Type !help to view available commands`);
        return;
    }

    const freshCommand = await loadCommand(command.config.name);
    if (!freshCommand) {
        nexusMessage.reply(`⚠️ COMMAND LOAD ERROR\n\n📋 Command: "${commandName}"\n🔄 Please try again`);
        return;
    }

    try {
        if (freshCommand.config && freshCommand.config.cooldown) {
            const cooldownTime = freshCommand.config.cooldown * 1000;
            const cooldownKey = `cooldown_${freshCommand.config.name}_${message.senderID}`;
            const lastUsedTimestamp = await db.get(cooldownKey);
            
            if (lastUsedTimestamp) {
                const timeRemaining = cooldownTime - (Date.now() - lastUsedTimestamp);
                if (timeRemaining > 0) {
                    nexusMessage.reply(`⏳ COOLDOWN ACTIVE\n\n⌛ Time remaining: ${Math.ceil(timeRemaining / 1000)}s\n📋 Command: ${commandName}`);
                    return;
                }
            }
            await db.set(cooldownKey, Date.now());
        }

        setTimeout(async () => {
            try {
                const enhancedSendMessage = async (text, options = {}) => {
                    const sentMessage = await api.sendMessage(formatTechMessage(text), message.threadID);
                    if (options.onReply) {
                        replyManager.registerReplyListener(
                            sentMessage.messageID,
                            async (reply) => {
                                if (freshCommand.onReply) {
                                    await freshCommand.onReply({
                                        api,
                                        message,
                                        reply,
                                        config,
                                        nexusMessage,
                                        db,
                                        sendMessage: enhancedSendMessage
                                    });
                                }
                                if (options.onReply) {
                                    await options.onReply(reply);
                                }
                            },
                            {
                                timeout: options.replyTimeout || 5 * 60 * 1000,
                                oneTime: options.oneTimeReply ?? true,
                                filter: (message) => message.body !== ''
                            }
                        );
                    }
                    return { ...sentMessage, replyMessageID: sentMessage.messageID };
                };

                const commandParams = {
                    api,
                    message,
                    args,
                    config,
                    nexusMessage,
                    replyManager,
                    db,
                    onReply: async (reply) => {
                        await freshCommand.onReply?.({
                            api,
                            message,
                            reply,
                            config,
                            nexusMessage,
                            db
                        });
                    },
                    sendMessage: enhancedSendMessage
                };

                if (freshCommand.run) {
                    await freshCommand.run(commandParams);
                } else if (freshCommand.onStart) {
                    await freshCommand.onStart(commandParams);
                } else if (freshCommand.Nexus) {
                    await freshCommand.Nexus(commandParams);
                }
            } catch (error) {
                console.error(chalk.red(`Error in command "${commandName}":`), error);
                nexusMessage.reply(`🔥 SYSTEM ERROR\n\n📋 Command: "${commandName}"\n⚠️ Error: ${error.message}\n\n📞 Please report this to the system administrator`);
            }
        }, generateRandomDelay(1000, 3000));
    } catch (error) {
        nexusMessage.reply(`🔥 SYSTEM ERROR\n\n📋 Command: "${commandName}"\n⚠️ Error: ${error.message}\n\n📞 Please report this to the system administrator`);
    }
}

setInterval(() => {
    replyManager.cleanupExpiredListeners();
}, 10 * 60 * 1000);
