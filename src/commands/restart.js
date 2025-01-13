import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const _filename = fileURLToPath(import.meta.url);
const __dirname = dirname(_filename);

export default {
  config: {
    name: 'restart',
    description: 'Restart the bot',
    usage: '!restart',
    category: 'utility',
    permission: 1 // only admins can use this command
  },
  onLoad: async ({ api, message }) => {
  const pathFile = `${__dirname}/restart.txt`;
  if (fs.existsSync(pathFile)) {
    setTimeout(async () => {
      const time = fs.readFileSync(pathFile, 'utf-8').split(' ');
      const restartTime = (Date.now() - time[1]) / 1000;
      api.sendMessage(`Bot restarted\nTime: ${restartTime}s`, message.threadID);
      fs.unlinkSync(pathFile);
    }, 5000); // wait 5 seconds before sending the "Bot restarted" message
  }
},
  run: async ({ api, message, nexusMessage }) => {
  const pathFile = `${__dirname}/restart.txt`;
  fs.writeFileSync(pathFile, `${message.threadID} ${Date.now()}`);
  await nexusMessage.reply('Restarting...');
  setTimeout(() => {
    process.exit(2);
  }, 1000);
}
};