import db from '../../db.js'

export default {
  config: {
    name: 'filteruser',
    description: 'Filter group members',
    usage: '(prefix)filteruser [die|number]',
    category: 'utility',
    permission: 2, // Only group admins can use this command
  },
  run: async ({ api, message, args, config }) => {
    if (message.threadID === message.senderID) {
      api.sendMessage('This command only works in groups.', message.threadID, message.messageID);
      return;
    }

    const isAdmin = await api.getThreadInfo(message.threadID);
    const botID = await api.getCurrentUserID();

    if (!isAdmin.adminIDs.some(admin => admin.id === botID)) {
      api.sendMessage('The bot needs to be an admin in the group to use this command.', message.threadID, message.messageID);
      return;
    }

    if (args.length < 1) {
      api.sendMessage('Please specify the action (die or number).', message.threadID, message.messageID);
      return;
    }

    const action = args[0];

    if (action === 'die') {
      // Remove all unavailable accounts (locked, suspended, banned)
      const threadInfo = await api.getThreadInfo(message.threadID);
      const participantIDs = threadInfo.participantIDs;

      for (const participantID of participantIDs) {
        try {
          await api.getUserInfo(participantID);
        } catch (error) {
          // If getUserInfo fails, assume it's a locked or unavailable account
          await api.removeUserFromGroup(message.threadID, participantID);
          api.sendMessage(`Removed ${participantID}`, message.threadID, message.messageID);
        }
      }
    } else if (!isNaN(action)) {
      // Remove members who haven't sent at least the specified number of words
      const threadInfo = await api.getThreadInfo(message.threadID);
      const participantIDs = threadInfo.participantIDs;

      for (const participantID of participantIDs) {
        try {
          const userInfo = await api.getUserInfo(participantID);
          if (userInfo.messageCount < parseInt(action)) {
            await api.removeUserFromGroup(message.threadID, participantID);
            api.sendMessage(`Removed ${participantID}`, message.threadID, message.messageID);
          }
        } catch (error) {
          // If getUserInfo fails, assume it's a locked or unavailable account
          await api.removeUserFromGroup(message.threadID, participantID);
          api.sendMessage(`Removed ${participantID}`, message.threadID, message.messageID);
        }
      }
    } else {
      api.sendMessage('Invalid action', message.threadID, message.messageID);
    }
  },
};