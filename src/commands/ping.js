import chalk from 'chalk';

export default {
  config: {
    name: 'ping',
    aliases: ['p', 'latency'],
    description: "Check the bot's latency",
author: 'frank x asta',
    usage: 'ping',
permission: 0,
    cooldown: 5,
    category: 'system'
  },

  onStart: async ({ api, message }) => {
    const startTime = Date.now();
    
    await api.sendMessage('🏓 Pinging...', message.threadID);
    
    const latency = Date.now() - startTime;
    
    const barLength = 10;
    const filledBars = Math.min(Math.floor(latency / 30), barLength);
    const emptyBars = barLength - filledBars;
    const bar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
    
    let quality;
    if (latency < 100) quality = '🟢 Excellent';
    else if (latency < 200) quality = '🟡 Good';
    else if (latency < 300) quality = '🟠 Moderate';
    else quality = '🔴 Poor';

    const response = `📊 PING STATISTICS 📊\n\n` +
                    `🕒 Response Time: ${latency}ms\n` +
                    `📶 Connection: [${bar}]\n` +
                    `✨ Status: ${quality}`;

    await api.sendMessage(response, message.threadID);

    console.log(chalk.cyan('[PING]'), 
                chalk.yellow(`Latency: ${latency}ms`), 
                chalk.green(`Status: ${quality}`));
  }
};