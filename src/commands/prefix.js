import config from '../../config.js';

import db from '../../db.js';

export default {

  config: {

    name: 'prefix',

    aliases: ['setprefix'],

    description: 'View or change the bot prefix',

    usage: 'prefix | {p} setprefix <new prefix>',

    permission: 0,

   category: 'utility'

  },

  onChat: async ({ api, message, config }) => {

    const groupPrefix = db.getGroupPrefix(message.threadID) || config.prefix;

    api.sendMessage(`𝙱𝙾𝚃 𝙿𝚁𝙴𝙵𝙸𝚇: ${config.prefix}\n𝚃𝙷𝚁𝙴𝙰𝙳 𝙿𝚁𝙴𝙵𝙸𝚇: ${groupPrefix}`, message.threadID, message.messageID);

  },

  run: async ({ api, message, args, nexusMessage }) => {

    if (args.length < 1) {

      nexusMessage.reply('⚠️Please provide a new prefix!');

      return;

    }

    const newPrefix = args[0];

    nexusMessage.replyWithCallback(`Are you sure you want to change the prefix to "${newPrefix}"? Reply "yes" to confirm.`, async (reply) => {

      if (reply.senderID === message.senderID && reply.body.toLowerCase() === 'yes') {

        db.setGroupPrefix(message.threadID, newPrefix);

        nexusMessage.reply(`✅Prefix changed to "${newPrefix}"`);

      } else if (reply.senderID !== message.senderID) {

        nexusMessage.reply('🚫 Only the person who called the command can confirm the prefix change.');

      } else {

        nexusMessage.reply('🚫 Prefix change cancelled.');

      }

    });

  },

};