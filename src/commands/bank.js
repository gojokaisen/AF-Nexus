import db from '../../db.js';
import { commands } from '../../index.js';

export default {
  config: {
    name: 'bank',
    version: '1.0',
    author: 'Frank Kaumba',
    cooldown: 5,
    permission: 0,
    category: 'Fun',
    description: 'Virtual banking system',
    usage: '(prefix)bank [check/deposit/withdraw/transfer/loan/gamble/daily/help]'
  },

  run: async ({ nexusMessage, args, prefix }) => {
    const userID = nexusMessage.senderID;
    const command = args[0]?.toLowerCase();
    const amount = parseFloat(args[1]);
    const recipientID = args[2];

    let userData = await db.get(`bank_${userID}`);
    if (!userData) {
      userData = {
        balance: 1000,
        savings: 0,
        loan: 0,
        lastDaily: null,
        lastRobbery: null,
        transactions: [],
        robberyProtection: false
      };
      await db.set(`bank_${userID}`, userData);
    }

    const updateUser = async (newData) => {
      await db.set(`bank_${userID}`, { ...userData, ...newData });
    };

    const addTransaction = async (type, amount, details = {}) => {
      const transaction = {
        type,
        amount,
        timestamp: new Date().toISOString(),
        ...details
      };
      userData.transactions = [...userData.transactions.slice(-19), transaction];
      await updateUser({ transactions: userData.transactions });
    };

    if (!command || command === 'help') {
      return nexusMessage.reply(
        `╭─⭓ 𝐁𝐀𝐍𝐊 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 ⭓─╮
│
├─⭓ 𝐁𝐚𝐬𝐢𝐜 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬:
│ • ${config.prefix}bank check - View balance
│ • ${config.prefix}bank deposit [amount]
│ • ${config.prefix}bank withdraw [amount]
│ • ${config.prefix}bank transfer [amount] [userID]
│
├─⭓ 𝐒𝐚𝐯𝐢𝐧𝐠𝐬 (3% 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭):
│ • ${config.prefix}bank savings deposit [amount]
│ • ${config.prefix}bank savings withdraw [amount]
│
├─⭓ 𝐋𝐨𝐚𝐧𝐬 & 𝐆𝐚𝐦𝐛𝐥𝐢𝐧𝐠:
│ • ${config.prefix}bank loan [amount] - Max $5000
│ • ${config.prefix}bank pay [amount] - Pay loan
│ • ${config.prefix}bank gamble [amount] - 50% chance
│
├─⭓ 𝐃𝐚𝐢𝐥𝐲 & 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲:
│ • ${config.prefix}bank daily - Get bonus
│ • ${config.prefix}bank protect - Buy protection
│ • ${config.prefix}bank history - View transactions
╰──────⭓`
      );
    }

    if (command === 'check') {
      const loanText = userData.loan > 0 ? `\n├─⭓ 𝐋𝐨𝐚𝐧: $${userData.loan.toFixed(2)}` : '';
      const protectionText = userData.robberyProtection ? '\n├─⭓ 𝐏𝐫𝐨𝐭𝐞𝐜𝐭𝐢𝐨𝐧: Active' : '';
      
      return nexusMessage.reply(
        `╭─⭓ 𝐁𝐀𝐍𝐊 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 ⭓─╮
├─⭓ 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: $${userData.balance.toFixed(2)}
├─⭓ 𝐒𝐚𝐯𝐢𝐧𝐠𝐬: $${userData.savings.toFixed(2)}${loanText}${protectionText}
╰──────⭓`
      );
    }

    if (command === 'deposit') {
      if (!amount || amount <= 0) return nexusMessage.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭");
      
      await updateUser({ balance: userData.balance + amount });
      await addTransaction('deposit', amount);
      
      return nexusMessage.reply(
        `╭─⭓ 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 ⭓─╮
├─⭓ 𝐀𝐦𝐨𝐮𝐧𝐭: $${amount.toFixed(2)}
├─⭓ 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${(userData.balance + amount).toFixed(2)}
╰──────⭓`
      );
    }

    if (command === 'withdraw') {
      if (!amount || amount <= 0) return nexusMessage.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭");
      if (amount > userData.balance) return nexusMessage.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐟𝐮𝐧𝐝𝐬");
      
      await updateUser({ balance: userData.balance - amount });
      await addTransaction('withdraw', amount);
      
      return nexusMessage.reply(
        `╭─⭓ 𝐖𝐈𝐓𝐇𝐃𝐑𝐀𝐖 ⭓─╮
├─⭓ 𝐀𝐦𝐨𝐮𝐧𝐭: $${amount.toFixed(2)}
├─⭓ 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${(userData.balance - amount).toFixed(2)}
╰──────⭓`
      );
    }

    if (command === 'daily') {
      const now = new Date();
      const lastDaily = userData.lastDaily ? new Date(userData.lastDaily) : null;
      
      if (lastDaily && now - lastDaily < 86400000) {
        const timeLeft = 86400000 - (now - lastDaily);
        const hoursLeft = Math.floor(timeLeft / 3600000);
        const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);
        
        return nexusMessage.reply(
          `╭─⭓ 𝐃𝐀𝐈𝐋𝐘 𝐁𝐎𝐍𝐔𝐒 ⭓─╮
├─⭓ 𝐒𝐭𝐚𝐭𝐮𝐬: On cooldown
├─⭓ 𝐓𝐢𝐦𝐞 𝐥𝐞𝐟𝐭: ${hoursLeft}h ${minutesLeft}m
╰──────⭓`
        );
      }

      const bonus = 100;
      const savingsInterest = Math.floor(userData.savings * 0.03);
      
      await updateUser({
        balance: userData.balance + bonus + savingsInterest,
        lastDaily: now.toISOString()
      });
      await addTransaction('daily_bonus', bonus + savingsInterest);

      return nexusMessage.reply(
        `╭─⭓ 𝐃𝐀𝐈𝐋𝐘 𝐁𝐎𝐍𝐔𝐒 ⭓─╮
├─⭓ 𝐁𝐨𝐧𝐮𝐬: $${bonus}
├─⭓ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭: $${savingsInterest}
├─⭓ 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${(userData.balance + bonus + savingsInterest).toFixed(2)}
╰──────⭓`
      );
    }

    if (command === 'gamble') {
      if (!amount || amount <= 0) return nexusMessage.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭");
      if (amount > userData.balance) return nexusMessage.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐟𝐮𝐧𝐝𝐬");

      const win = Math.random() >= 0.5;
      const newBalance = userData.balance + (win ? amount : -amount);
      
      await updateUser({ balance: newBalance });
      await addTransaction('gamble', amount, { won: win });

      return nexusMessage.reply(
        `╭─⭓ 𝐆𝐀𝐌𝐁𝐋𝐄 ⭓─╮
├─⭓ 𝐑𝐞𝐬𝐮𝐥𝐭: ${win ? '𝐖𝐈𝐍! 🎉' : '𝐋𝐎𝐒𝐓! 😢'}
├─⭓ 𝐀𝐦𝐨𝐮𝐧𝐭: $${amount.toFixed(2)}
├─⭓ 𝐍𝐞𝐰 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: $${newBalance.toFixed(2)}
╰──────⭓`
      );
    }

    return nexusMessage.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐛𝐚𝐧𝐤 𝐜𝐨𝐦𝐦𝐚𝐧𝐝. 𝐔𝐬𝐞 'bank help' 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬.");
  }
};