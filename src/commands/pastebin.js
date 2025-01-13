import PastebinAPI from 'pastebin-js';

import fs from 'fs';

import path from 'path';

import { parse } from 'acorn';

import { fileURLToPath } from 'url';

import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);

const __dirname = dirname(_filename);

export default {

  config: {

    name: "bin",

    author: "SANDIP",

    cooldown: 0,

    permission: 0,

    description: "Upload files to pastebin and sends link",

    usage: "Type !pastebin <filename>. The file must be located in the 'cmds' folder.",

    category: "owner"

  },

  run: async ({ api, event, args, nexusMessage }) => {

    const pastebin = new PastebinAPI({

      api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',

      api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',

    });

    const fileName = args[0];

    const filePathWithoutExtension = path.join(__dirname, '..', 'commands', fileName);

    const filePathWithExtension = path.join(__dirname, '..', 'commands', fileName + '.js');

    if (!fs.existsSync(filePathWithoutExtension) && !fs.existsSync(filePathWithExtension)) {

      return nexusMessage.reply('File not found!');

    }

    const filePath = fs.existsSync(filePathWithoutExtension) ? filePathWithoutExtension : filePathWithExtension;

    const data = await fs.promises.readFile(filePath, 'utf8');

    const paste = await pastebin.createPaste({

      text: data,

      title: fileName,

      format: null,

      privacy: 1,

    }).catch((error) => {

      console.error(error);

    });

    const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");

    nexusMessage.reply(`${rawPaste}`);

  },

};