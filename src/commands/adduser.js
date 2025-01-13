import { get } from 'https';

export default {
  config: {
    name: "adduser",
    aliases: ['au'],
    author: "Your Name",
    cooldown: 5,
    permission: 2,
    description: "Add user to group by UID or profile link",
    category: "Admin",
    usage: "prefix adduser <uid/link>"
  },
  onStart: async ({ event, api, args, nexusMessage, message }) => {
    if (message.threadID === message.senderID) {
      return nexusMessage.reply('This command only works in groups.');
    }
    const [uidOrLink] = args;
    let uid;
    if (uidOrLink.startsWith('https://www.facebook.com/') || uidOrLink.startsWith('https://fb.com/')) {
      const urlParts = uidOrLink.split('?id=');
      uid = urlParts[urlParts.length - 1];
    } else {
      uid = uidOrLink;
    }
    try {
      const groupMembers = await api.getThreadInfo(message.threadID, ['participantIDs']);
      if (groupMembers.participantIDs.includes(uid)) {
        return nexusMessage.reply(`User ${uid} is already in this group.`);
      }
      await api.addUserToGroup(uid, message.threadID);
      nexusMessage.reply(`User ${uid} added to this group.`);
    } catch (error) {
      nexusMessage.reply(`Error adding user ${uid} to this group: ${error.message}`);
    }
  }
};