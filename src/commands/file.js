import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);

const __dirname = dirname(_filename);

export default {

  config: {

    name: 'file',

    description: 'Get the code of a command',

    usage: '!file (file name.js)',

    permission: 1, // only admins can use this command

    category: 'utility'
  },

  run: async ({ api, message, args }) => {

    const commandFolder = path.join(__dirname, '..', 'commands');

    const fileName = args[0];

    if (!fileName) {

      return api.sendMessage('Please provide a file name.', message.threadID, message.messageID);

    }

    if (!fileName.endsWith('.js')) {

      return api.sendMessage('File must be a JavaScript file (.js).', message.threadID, message.messageID);

    }

    const filePath = path.join(commandFolder, fileName);

    if (!fs.existsSync(filePath)) {

      return api.sendMessage(`File ${fileName} not found.`, message.threadID, message.messageID);

    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    api.sendMessage(`cmd install ${fileName} ${fileContent}`, message.threadID, message.messageID);

  }

};