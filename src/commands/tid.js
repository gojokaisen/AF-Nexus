export default {
config: {
name: 'tid',
description: 'Sends the group ID',
permission: 0,
category: 'utility',
usage: '{p}tid',
},
run: async ({ api, message, args, config, nexusMessage }) => {
if (message.threadID === message.senderID) {
nexusMessage.reply('This command only works in groups.');
return;
}
nexusMessage.reply(`Group ID: ${message.threadID}`);
},
};