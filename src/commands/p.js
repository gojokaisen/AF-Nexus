export default {
 config: {
 name: 'p',
 description: 'Says hello!',
 permission: 1,
 category: 'normal',
 usage: '.hello',
 },
 run: async ({ api, message }) => {
 api.sendMessage('Hello!', message.threadID, message.messageID);
 }
};