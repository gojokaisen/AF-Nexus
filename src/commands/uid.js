export default {
config: {
name: 'uid',
aliases: [],
description: 'Get user ID',
usage: '(prefix)uid [tag]',
permission: 0,
},
run: async ({ api, message, args, config, nexusMessage }) => {
let uid;
if (message.messageReply) {
uid = message.messageReply.senderID;
} else if (args[0] && args[0].startsWith('@')) {
if (message.mentions) {
uid = Object.keys(message.mentions)[0];
} else {
nexusMessage.reply('Invalid mention format.');
return;
}
} else {
uid = message.senderID;
}
return nexusMessage.reply(`${uid}`);
},
};