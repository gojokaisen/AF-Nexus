import { exec } from 'child_process';

export default {

  config: {

    name: 'shell',

    description: 'Execute a shell command',

    usage: '.shell [command]',

    permission: 1,// only admins can use this command
     
     category: "utility"

  },

  onStart: async ({ api, message, args, nexusMessage }) => {

    if (args.length === 0) {

      return nexusMessage.reply('Please provide a command to execute.');

    }

    const command = args.join(' ');

    exec(command, (error, stdout, stderr) => {

      if (error) {

        return nexusMessage.reply(`Error: ${error.message}`);

      }

      if (stderr) {

        return nexusMessage.reply(`Error: ${stderr}`);

      }

      nexusMessage.reply(`Output:\n${stdout}`);

    });

  }

};