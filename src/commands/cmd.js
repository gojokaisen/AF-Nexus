import fs from 'fs';

import path from 'path';

import axios from 'axios';

import { parse } from 'acorn';

import { fileURLToPath } from 'url';

import { dirname } from 'path';

import { mkdir, writeFile } from 'fs/promises';

const _filename = fileURLToPath(import.meta.url);

const __dirname = dirname(_filename);

const loadedcommands = {};

export default {

 config: {

 name: 'cmd',

 description: 'manage command files',

 usage: '.cmd [install|delete|load|unload|loadall] [command name]',

 category: 'utility',

 permission: 1, // only admins can use this command

 },

 run: async ({ api, message, args, nexusMessage }) => {

if (args.length === 0) {
    api.sendMessage('❌invalid action haha. please use install, delete, load, unload, or loadall.', message.threadID, message.messageID);
    return;
  }

 const commandfolder = path.join(__dirname, '..', 'commands');

 switch (args[0].toLowerCase()) {

case 'install':
  const commandname = args[1];
  let commandcode;

  // Check if the input is a link
  const linkRegex = /^(https?:\/\/[^\s]+)/;
  if (linkRegex.test(args[2])) {
    try {
      const response = await axios.get(args[2]);
      commandcode = response.data;
    } catch (error) {
      api.sendMessage(`❌Error fetching code from URL: ${error.message}`, message.threadID, message.messageID);
      return;
    }
  } else {
    commandcode = message.body.substring(message.body.indexOf(args[1]) + args[1].length + 1);
  }

  // Perform validation and installation
  try {
    const requiredProperties = ['name', 'description', 'usage', 'category', 'permission'];
    const configRegex = /config:\s*({[^}]+})/g;
    const configMatch = commandcode.match(configRegex);

    if (configMatch) {
      const config = configMatch[0].replace('config: ', '');
      const missingProperties = requiredProperties.filter((property) => !config.includes(property));

      const hasRunFunction = /run\s*:\s*async\s*\(/.test(commandcode);
      const hasNexusFunction = /Nexus\s*:\s*async\s*\(/.test(commandcode);
      const hasOnChatFunction = /onChat\s*:\s*async\s*\(/.test(commandcode);
      const hasOnStartFunction = /onStart\s*:\s*async\s*\(/.test(commandcode);
      const hasAsyncFunction = hasRunFunction || hasNexusFunction || hasOnChatFunction || hasOnStartFunction;

      if (missingProperties.length > 0) {
        api.sendMessage(`‼️Invalid command format. Missing required properties: ${missingProperties.join(', ')}.`, message.threadID, message.messageID);
      } else if (!hasAsyncFunction) {
        api.sendMessage(`❌Invalid command format. Missing async function (run, Nexus, onChat, or onStart).`, message.threadID, message.messageID);
      } else {
        // Check if the command already exists
        const commandfolder = path.join(__dirname, '..', 'commands');
        if (!commandname.endsWith('.js')) {
          api.sendMessage(`‼️Invalid command name. Please include the ".js" extension.`, message.threadID, message.messageID);
          return;
        }

        if (fs.existsSync(path.join(commandfolder, commandname))) {
          nexusMessage.replyWithCallback(`⚠️ Command "${commandname}" already exists. Do you want to overwrite it? (yes/no)`, async (reply) => {
            if (reply.body.toLowerCase() !== 'yes') {
              api.sendMessage('❌Installation cancelled.', message.threadID, message.messageID);
              return;
            }

            // Overwrite the existing command
            fs.writeFileSync(path.join(commandfolder, commandname), commandcode);
            api.sendMessage(`✅Command ${commandname} installed successfully.`, message.threadID, message.messageID);
          });
        } else {
          // Install the new command
          fs.writeFileSync(path.join(commandfolder, commandname), commandcode);
          api.sendMessage(`✅Command ${commandname} installed successfully.`, message.threadID, message.messageID);
        }
      }
    } else {
      api.sendMessage(`‼️Invalid command format.`, message.threadID, message.messageID);
    }
  } catch (error) {
    console.error('❌Error installing command:', error);
    api.sendMessage(`‼️Invalid command format: ${error.message}`, message.threadID, message.messageID);
  }
  break;

case 'delete':
  const deletecommandname = args[1];
  if (!deletecommandname.endsWith('.js')) {
    api.sendMessage(`Invalid command name. Please include the ".js" extension.`, message.threadID, message.messageID);
    return;
  }
  try {
    fs.unlinkSync(path.join(commandfolder, deletecommandname));
    api.sendMessage(`☑️Command ${deletecommandname} deleted successfully.`, message.threadID, message.messageID);
  } catch (error) {
    api.sendMessage(`🙅Unable to delete command ${deletecommandname}: ${error.message}`, message.threadID, message.messageID);
  }
  break;

case 'load':
  const loadcommandname = args[1];
  if (!loadcommandname.endsWith('.js')) {
    api.sendMessage(`‼️Invalid command name. Please include the ".js" extension.`, message.threadID, message.messageID);
    return;
  }
  try {
    const commandcode = fs.readFileSync(path.join(commandfolder, loadcommandname), 'utf8');
    const command = await import(path.join(commandfolder, loadcommandname));
    loadedcommands[loadcommandname.replace('.js', '')] = command;
    api.sendMessage(`Loaded command ${loadcommandname}.`, message.threadID, message.messageID);
  } catch (error) {
    api.sendMessage(`Unable to load command ${loadcommandname}: ${error.message}`, message.threadID, message.messageID);
  }
  break;

case 'unload':
  const unloadcommandname = args[1];
  if (!unloadcommandname.endsWith('.js')) {
    api.sendMessage(`⚠️Invalid command name. Please include the ".js" extension.`, message.threadID, message.messageID);
    return;
  }
  const commandnam = unloadcommandname.replace('.js', '');
  if (loadedcommands[commandnam]) {
    delete loadedcommands[commandnam];
    api.sendMessage(`🍄Unloaded command ${unloadcommandname}.`, message.threadID, message.messageID);
  } else {
    api.sendMessage(`Command ${unloadcommandname} is not loaded.`, message.threadID, message.messageID);
  }
  break;

case 'loadall':
  const files = fs.readdirSync(commandfolder);
  let loadedcommandscount = 0;
  let failedcommands = '';
  for (const file of files) {
    if (file.endsWith('.js')) {
      try {
        const commandcode = fs.readFileSync(path.join(commandfolder, file), 'utf8');
        const command = await import(path.join(commandfolder, file));
        loadedcommands[file.replace('.js', '')] = command;
        loadedcommandscount++;
      } catch (error) {
        failedcommands += `${file} - ${error.message}\n`;
      }
    }
  }
  let failed = `✅Successfully loaded ${loadedcommandscount} commands.`;
  if (failedcommands) {
    failed += `\n\n❌Failed to load:\n${failedcommands}`;
  }
  api.sendMessage(failed, message.threadID, message.messageID);
  break;
  
 default:

 api.sendMessage('❌invalid action haha. please use install, delete, load, unload, or loadall.', message.threadID, message.messageID);

 }

 }

};