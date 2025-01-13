import os from 'os';
import si from 'systeminformation';
import db from '../../db.js';

export default {
  config: {
    name: 'stats',
    description: 'Check bot response time',
category: 'system',
    usage: '.stats',
    permission: 0
  },
  Nexus: async ({ api, message, args, nexusMessage }) => {
    const start = Date.now();
    const latency = Date.now() - start;
    const sysInfo = await si.system();
    const cpuInfo = await si.cpu();
    const memInfo = await si.mem();
    const nodeInfo = process.versions.node;
    const v8Info = process.versions.v8;
    const users = Object.keys(db.readDB().users).length;
    const groups = Object.keys(db.readDB().groups).length;

    const report = ` ╭━━━〔 Bot Status 〕━━━╮ 
│
 • 🛜Latency: ${latency}ms 
 • 🕦Uptime: ${formatUptime(process.uptime() * 1000)} 
 • 🌑CPU Cores: ${os.cpus().length} 
 • 📳CPU Model: ${cpuInfo.model} 
 • ⚡CPU Speed: ${cpuInfo.speed} GHz 
│
╰━━━〔 Bot Status 〕━━╯ 
╭━━〔 Memory Usage 〕━━╮ 
│ 
 • Total: ${formatBytes(memInfo.total)} 
 • 🌊Used: ${formatBytes(memInfo.active)} 
 • ❄️Free: ${formatBytes(memInfo.free)} 
│
╰━━━〔 Memory Usage 〕━╯ 
╭━━━〔 System Info 〕━━━╮ 
│
 • Platform: ${os.platform()} (${os.arch()}) 
 • 🍄Hostname: ${os.hostname()} 
 • 🌟Node.js: ${nodeInfo} 
 • 🚖V8 Engine: ${v8Info} 
 • 🎾OS: ${getOSInfo()} 
│ 
╰━━━〔 System Info 〕━━━╯ 
╭━━━〔 Bot Information 〕━╮ 
│ 
 • Bot Name: ${global.botName} 
 • 🍪Prefix: ${global.prefix} 
 • 🧛Admins: ${global.adminBot.join(', ')} 
 • 🧑‍🤝‍🧑Total Users: ${users} 
 • 👫Total Groups: ${groups} 
│
╰━━━〔 Bot Information〕━╯`;

    await nexusMessage.reply(report);
  }
};

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}

function formatUptime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}

function getOSInfo() {
  return `${os.type()} ${os.release()} ${os.arch()}`;
}