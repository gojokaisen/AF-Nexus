import db from '../../db.js';

export default {
  config: {
    name: 'ban',
    description: 'Ban or unban a user from using the bot',
    usage: '(prefix)ban <ban/unban> <@tag/uid>',
    permission: 1,
    author: "Frank kaumba x Asta"
  },

  Nexus: async ({ api, message, args, config, nexusMessage, onReply, sendMessage }) => {
    if (args.length < 2) {
      return nexusMessage.reply('Please specify the action (ban/unban) and mention the user or provide their ID.');
    }

    const action = args[0].toLowerCase();
    let userID;

    if (message.mentions && Object.keys(message.mentions).length > 0) {
      userID = Object.keys(message.mentions)[0];
    } else {
      userID = args[1];
    }

    if (!userID) {
      return nexusMessage.reply('Please mention a user or provide their ID.');
    }

    try {
      const userInfo = await api.getUserInfo(userID);
      const userName = userInfo[userID].name || userID;

      if (action === 'ban') {
        const reason = args.slice(2).join(' ') || 'No reason provided';
        await db.setBannedUser(userID, reason);
        nexusMessage.reply(`User ${userName} (${userID}) has been banned.\nReason: ${reason}`);
      } 
      else if (action === 'unban') {
        await db.removeBannedUser(userID);
        nexusMessage.reply(`User ${userName} (${userID}) has been unbanned.`);
      } 
      else {
        nexusMessage.reply('Invalid action. Please use "ban" or "unban".');
      }
    } catch (error) {
      nexusMessage.reply('An error occurred while processing the command.');
    }
  }
};