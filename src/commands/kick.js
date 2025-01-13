export default {
  config: {
    name: 'kick',
    description: 'Kick a user by replying or mentioning',
    usage: '(prefix)kick [@mention] or reply to message',
    permission: 1,
    author: "Frank X Asta"
  },
  
  onStart: async ({ api, message, nexusMessage }) => {
    const { threadID, messageReply, mentions, senderID } = message;
    let targetID;
    
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
      
      if (!isAdmin) {
        return nexusMessage.reply("❌ You must be a group admin to use this command");
      }
      
      if (messageReply) {
        targetID = messageReply.senderID;
      } else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      } else {
        return nexusMessage.reply("❌ Please mention someone or reply to their message");
      }
      
      if (targetID === api.getCurrentUserID()) {
        return nexusMessage.reply("❌ Cannot kick the bot");
      }
      
      if (threadInfo.adminIDs.some(admin => admin.id === targetID)) {
        return nexusMessage.reply("❌ Cannot kick an admin");
      }
      
      await api.removeUserFromGroup(targetID, threadID);
      return nexusMessage.reply("✅ User has been kicked from the group");
      
    } catch (error) {
      return nexusMessage.reply("❌ Failed to kick user: " + error.message);
    }
  }
};