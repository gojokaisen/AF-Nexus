import { commands } from '../../index.js';

export default {
  config: {
    name: 'help',
    version: '2.3',
    author: 'Frank X Asta',
    cooldown: 5,
    permission: 0,
    category: 'Menu',
    description: 'View command usage'
  },

  run: async ({ nexusMessage, args, prefix, config }) => {
    try {
      if (!args.length) {
        const categories = new Map();
        let output = `┏━━❮𝐀𝐅 𝐍𝐄𝐗𝐔𝐒 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒  ❯━━┓\n┃\n`;

        commands.forEach((cmd, name) => {
          const category = (cmd.config?.category || '𝐆𝐄𝐍𝐄𝐑𝐀𝐋').toString();
          if (!categories.has(category)) {
            categories.set(category, []);
          }
          categories.get(category).push(name);
        });

        [...categories].sort().forEach(([category, cmdList]) => {
          output += `┣━━❮ ${safeStyleBold(category)} ❯${getEmoji(category)}\n┃  `;
          output += cmdList.sort().join(' • ');
          output += '\n┃\n';
        });

        output += '┃\n';
        output += `┣━━❮ 📊 𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐬 ❯\n`;
        output += `┃  • Total Commands: ${safeStyleBold(commands.size.toString())}\n`;
        output += `┃  • Prefix: ${global.prefix}\n`;
        output += `┃  • Bot Name: ${safeStyleBold(config?.botName || 'Nexus Bot')}\n`;
        output += `┗━━❮ Type ${prefix}help <command> for details ❯━━┛`;

        return nexusMessage.reply(output);
      }

      const command = commands.get(args[0].toLowerCase());
      if (!command) {
        return nexusMessage.reply(`┏━❮ ❌ 𝐄𝐫𝐫𝐨𝐫 ❯━┓\n┃ Command not found\n┗━━━━━━━━━┛`);
      }

      const info = `┏━━❮ ${safeStyleBold(command.config?.name?.toUpperCase() || 'COMMAND')} ❯━━┓
┃
┣━━❮ 📑 Details ❯
┃  • Category: ${command.config?.category ? safeStyleBold(command.config.category) : 'None'}
┃  • Version: ${safeStyleBold(command.config?.version?.toString() || '1.0')}
┃  • Role: ${safeStyleBold(command.config?.role?.toString() || '0')}
┃  • Cooldown: ${safeStyleBold((command.config?.cooldown || 0) + 's')}
┃
┣━━❮ 📖 Usage ❯
┃  ${command.config?.usage || `${prefix}${command.config?.name || 'command'}`}
┃
┗━━━━━━━━━━┛`;

      return nexusMessage.reply(info);
    } catch (error) {
      console.error('Help command error:', error);
      return nexusMessage.reply(`┏━━❮ ❌ 𝐄𝐫𝐫𝐨𝐫 ❯━━┓\n┃ ${error.message || 'An unknown error occurred'}\n┃\n┃ Please report this to the developer\n┗━━━━━━━━━━┛`);
    }
  }
};

function safeStyleBold(text) {
  if (text === undefined || text === null) return '';
  try {
    return styleBold(text.toString());
  } catch (error) {
    console.error('Error in safeStyleBold:', error);
    return text?.toString() || '';
  }
}

function styleBold(text) {
  const boldMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
    'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
    'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
    ' ': ' '
  };
  
  return text.split('').map(char => boldMap[char.toUpperCase()] || char).join('');
}

function getEmoji(category) {
  const emojiMap = {
    'MENU': ' 📜',
    'GENERAL': ' 🌐',
    'ADMIN': ' 👑',
    'FUN': ' 🎮',
    'UTILITY': ' 🛠️',
    'MUSIC': ' 🎵',
    'MODERATION': ' 🛡️',
    'ECONOMY': ' 💰',
    'GAMES': ' 🎲',
    'SOCIAL': ' 🤝'
  };
  
  return emojiMap[category.toUpperCase()] || ' ℹ️';
}