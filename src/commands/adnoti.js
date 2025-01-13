export default {
  config: {
    name: 'adminnotify',
    aliases: ['adnoti'],
    description: 'Send a notification to all admins',
    category: 'admin',
    permission: 1,
   usage: '{p}notify <message>',
  },
  run: async ({ api, message, args, config, nexusMessage }) => {
    if (args.length === 0) {
      nexusMessage.reply('Please provide a message to send to admins.');
      return;
    }

    const notificationMessage = args.join(' ');
    const admins = global.adminBot;
    const senderID = message.senderID;

    let resultMessage = '';

    for (const admin of admins) {
      if (admin !== senderID) {
        try {
          await api.sendMessage(`${senderID} sent a notification: ${notificationMessage}`, admin);
          resultMessage += `Successfully sent message to admin ${admin}\n`;
        } catch (error) {
          resultMessage += `Failed to send message to admin ${admin}\n`;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second before sending the next message
      }
    }

    nexusMessage.reply(resultMessage);
  },
};