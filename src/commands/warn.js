import db from '../../db.js'

export default {
  config: {
    name: 'warn',
    description: 'Warn a user in the group',
    usage: '(prefix)warn <userID/tag> <reason>',
    permission: 2, // Only group admins can use this command
  },
  run: async ({ api, message, args, config, nexusMessage }) => {
    if (message.threadID === message.senderID) {
      nexusMessage.reply('This command only works in groups.');
      return;
    }

    const isAdmin = await api.getThreadInfo(message.threadID);
    const botID = await api.getCurrentUserID();
if (!isAdmin.adminIDs.some(admin => admin.id === botID)) {
  nexusMessage.reply('The bot needs to be an admin in the group to use this command.');
  return;
}

    if (args.length < 2) {
      nexusMessage.reply('Please specify the user ID/tag and the reason.');
      return;
    }

    let userID;
    if (args[0].startsWith('@')) {
  if (message.mentions) {
    userID = Object.keys(message.mentions)[0];
  } else {
    nexusMessage.reply('Invalid mention format.');
    return;
  }
} else {
  userID = args[0];
}
    const reason = args.slice(1).join(' ');
    const warnings = db.getWarnings(message.threadID, userID) || 0;
    const newWarnings = warnings + 1;
    db.setWarnings(message.threadID, userID, newWarnings);

    if (newWarnings >= 3) {
      await api.removeUserFromGroup(userID, message.threadID);
      nexusMessage.reply(`User ${userID} has been kicked from the group for receiving 3 warnings. Reason: ${reason}`);
    } else {
      nexusMessage.reply(`User ${userID} has been warned. They have ${newWarnings} warnings. Reason: ${reason}`);
    }
  },
};