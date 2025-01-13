export default {
  config: {
    name: 'admincall',
    description: 'Contact admins with message',
    usage: '(prefix)admincall [message]',
    permission: 0,
    category: 'general'
  },
Nexus: async ({ api, message, args, nexusMessage, replyManager }) => {
  try {
    if (!args[0]) return nexusMessage.reply("🤔 Please provide a message for the admins.");
    const userMessage = args.join(" ");
    const userID = message.senderID;
    const userName = await api.getUserInfo(userID);
    const userFullName = userName[userID].name;
    const originalThreadID = message.threadID;
    const threadInfo = await api.getThreadInfo(originalThreadID);
    const isAdmin = global.adminBot.includes(userID);

    let sentMessages = [];

    for (const adminId of global.adminBot) {
      const isAdminMsg = isAdmin ? 'Admin' : 'User';
         const adminMsg = `📩 Message from ${isAdminMsg}\nUser name: ${userFullName}\nUser ID: ${userID}\nThread ID: ${originalThreadID}\nThread name: (${threadInfo.threadName})\n\nMessage: ${userMessage}`;
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
      const response = await api.sendMessage(adminMsg, adminId);
      if (response) {
        sentMessages.push(`📨 Sent message to admin ${adminId} successfully.`);
        await api.sendMessage(`📨 Sent message to admin ${adminId} successfully.`, originalThreadID, message.messageID);
        const replyListener = async (msg) => {
          try {
            if (msg.senderID === adminId && msg.body) {
              const adminResponse = msg.body;
              const responseMsg = `📬 Admin Response:\n\n${adminResponse}`;
              const userReply = await api.sendMessage(responseMsg, originalThreadID);
              await api.sendMessage(`📨 Sent reply to user ${userID} successfully.`, adminId, msg.messageID);
              const userReplyListener = async (reply) => {
                try {
                  if (reply.senderID === userID && reply.body) {
                    const userMsg = reply.body;
                    const responseToAdmin = await api.sendMessage(`📩 Reply from ${userFullName}:\n\n${userMsg}`, adminId);
                    await api.sendMessage(`📨 Sent reply to admin ${adminId} successfully.`, originalThreadID, reply.messageID);
                    replyManager.registerReplyListener(responseToAdmin.messageID, replyListener);
                  } else if (reply.senderID !== userID) {
                    await api.sendMessage('🚫 Only the person who called the command can reply.', reply.threadID, reply.messageID);
                  }
                } catch (error) {
                  console.error(error);
                }
              };
              replyManager.registerReplyListener(userReply.messageID, userReplyListener);
            } else if (msg.senderID !== adminId) {
              await api.sendMessage('🚫 Only admins can reply.', msg.threadID, msg.messageID);
            }
          } catch (error) {
            console.error(error);
          }
        };
        replyManager.registerReplyListener(response.messageID, replyListener);
      }
    }
    return nexusMessage.reply(sentMessages.join('\n'));
  } catch (error) {
    console.error(error);
  }
}
}