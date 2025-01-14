import chalk from 'chalk';
import config from '../config.js';
import { commands, generateRandomDelay } from '../index.js';
import db from '../db.js';
import { pathToFileURL } from 'url';
import path from 'path';

class ReplyManager {
    constructor() {
        this.replyListeners = new Map();
    }

    registerReplyListener(messageId, callback, options = {}) {
        const { timeout = 5 * 60 * 1000, oneTime = true, filter = () => true } = options;
        const listener = { callback, createdAt: Date.now(), timeout, oneTime, filter };
        this.replyListeners.set(messageId, listener);
        setTimeout(() => { this.removeReplyListener(messageId); }, timeout);
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

async function loadCommand(commandName) {
    try {
        const commandPath = path.join(process.cwd(), 'commands', `${commandName}.js`);
        const fileUrl = pathToFileURL(commandPath).href;
        delete require.cache[require.resolve(commandPath)];
        const command = (await import(`${fileUrl}?update=${Date.now()}`)).default;
        return command;
    } catch (error) {
        console.error(chalk.red(`Failed to load command ${commandName}:`, error));
        return null;
    }
}

export default async function commandHandler(api, message) {
    const nexusMessage = {
        reply: async (response) => {
            api.sendMessage(response, message.threadID, message.messageID);
        },
        replyWithCallback: async (response, callback) => {
            const sentMessage = await api.sendMessage(response, message.threadID, message.messageID);
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
        db.setUser(message.senderID, { ...existingUser, name: user.name, coins: existingUser.coins || 0, lastActive: Date.now() });
    });

    api.getThreadInfo(message.threadID, async (err, threadInfo) => {
        if (err) {
            console.error(err);
            return;
        }
        const existingGroup = db.getGroup(message.threadID) || {};
        const groupPrefix = db.getGroupPrefix(message.threadID) || config.prefix;
        db.setGroup(message.threadID, { ...existingGroup, name: threadInfo.name, prefix: groupPrefix, lastActive: Date.now() });
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
            api.sendMessage(`─━━═════⊰⊱ ⬛ ⊰⊱═════━━─\nYou have been banned from using this bot. Reason: ${reason}\n─━━═════⊰⊱ ⬛ ⊰⊱═════━━─`, message.threadID, message.messageID);
            return true;
        }
        return false;
    };

    const handleBannedThread = () => {
        if (db.isBannedThread(message.threadID)) {
            const reason = db.readDB().bannedThreads[message.threadID];
            api.sendMessage(`─━━═════⊰⊱ ⬛ ⊰⊱═════━━─\nYour group have been banned from using this bot. Reason: ${reason}\n─━━═════⊰⊱ ⬛ ⊰⊱═════━━─`, message.threadID, message.messageID);
            return true;
        }
        return false;
    };

    const handleAdminOnly = () => {
        if (global.adminOnlyMode && !global.adminBot.includes(message.senderID)) {
            nexusMessage.reply("sorry bruh Only admins can use the bot.");
            return true;
        }
        return false;
    };

    for (const command of commands.values()) {
        if (command.onChat && typeof command.onChat === 'function') {
            if (messageBody.toLowerCase().startsWith(command.config.name.toLowerCase() + ' ') || messageBody.toLowerCase() === command.config.name.toLowerCase()) {
                if (handleBannedUser() || handleBannedThread() || handleAdminOnly()) return;
                const args = messageBody.toLowerCase() === command.config.name.toLowerCase() ? [] : messageBody.trim().split(' ').slice(1);
                command.onChat({ api, message, args, config, nexusMessage, db,
                    onReply: async (reply) => {
                        await command.onReply?.({ api, message, reply, config, nexusMessage, db });
                    },
                    sendMessage: async (text) => {
                        const sentMessage = await api.sendMessage(text, message.threadID);
                        return sentMessage;
                    },
                });
            }
        }
    }

    if (messageBody === groupPrefix) {
        if (handleBannedUser() || handleBannedThread() || handleAdminOnly()) return;
        nexusMessage.reply(`✨That is the bot prefix. Type !help to see all commands.`);
        return;
    }

    if (!messageBody.startsWith(groupPrefix)) {
        return;
    }

    const args = messageBody.slice(groupPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    let command = Array.from(commands.values()).find((command) => {
        return command.config.name.toLowerCase() === commandName || (command.config.aliases && command.config.aliases.includes(commandName));
    });

    if (handleBannedUser() || handleBannedThread() || handleAdminOnly()) return;

    if (command && command.onLoad) {
        await command.onLoad({ api, message, db });
    }

    if (!command) {
        nexusMessage.reply(`🚫Command "${commandName}" not found. Type !help to see all commands.`);
        return;
    }

    const commandWithOnChat = Array.from(commands.values()).find((cmd) => cmd.config.name.toLowerCase() === commandName && cmd.onChat);
    if (commandWithOnChat && !command.run && !command.onStart && !command.Nexus) {
        nexusMessage.reply(`🚫The command "${commandName}" works without a prefix. You can use it by typing "${commandName}" followed by your query without prefix.`);
        return;
    }

    if (command.config && command.config.permission === 1 && !config.adminIds.includes(message.senderID)) {
        nexusMessage.reply(`╭───────────────✎\n│❌You do not have permission to │use this command.\n╰───────────────`);
        return;
    }

    if (command.config && command.config.permission === 2) {
        const isAdmin = await api.getThreadInfo(message.threadID);
        const isAdminVar = isAdmin.participantIDs.includes(message.senderID) && isAdmin.adminIDs.some(admin => admin.id === message.senderID);
        if (!isAdminVar) {
            nexusMessage.reply(`╭───────────────✎\n│You need to be a group admin to\n│use this command.\n╰───────────────`);
            return;
        }
    }

    try {
        const freshCommand = await loadCommand(commandName) || command;

        if (freshCommand.config && freshCommand.config.cooldown) {
            const cooldownTime = freshCommand.config.cooldown * 1000;
            const cooldownKey = `cooldown_${freshCommand.config.name}_${message.senderID}`;
            const lastUsedTimestamp = await db.get(cooldownKey);
            if (lastUsedTimestamp) {
                const timeRemaining = cooldownTime - (Date.now() - lastUsedTimestamp);
                if (timeRemaining > 0) {
                    nexusMessage.reply(`You need to wait ${Math.ceil(timeRemaining / 1000)} seconds before using this command again.`);
                    return;
                }
            }
            await db.set(cooldownKey, Date.now());
        }

        setTimeout(async () => {
            try {
                const enhancedSendMessage = async (text, options = {}) => {
                    const sentMessage = await api.sendMessage(text, message.threadID);
                    if (options.onReply) {
                        replyManager.registerReplyListener(sentMessage.messageID, async (reply) => {
                            if (freshCommand.onReply) {
                                await freshCommand.onReply({ api, message, reply, config, nexusMessage, db, sendMessage: enhancedSendMessage });
                            }
                            if (options.onReply) {
                                await options.onReply(reply);
                            }
                        }, {
                            timeout: options.replyTimeout || 5 * 60 * 1000,
                            oneTime: options.oneTimeReply ?? true,
                            filter: (message) => message.body !== ''
                        });
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
                        await freshCommand.onReply?.({ api, message, reply, config, nexusMessage, db });
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
                nexusMessage.reply(`❌Error in command "${commandName}": ${error.message}\nPlease report this error to the bot developer.`);
            }
        }, generateRandomDelay(1000, 3000));
    } catch (error) {
        nexusMessage.reply(`❌Error in command "${commandName}": ${error.message}\nPlease report this error to the bot developer.`);
    }
}

setInterval(() => {
    replyManager.cleanupExpiredListeners();
}, 10 * 60 * 1000);
