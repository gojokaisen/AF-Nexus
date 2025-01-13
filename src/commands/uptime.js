export default {
  config: {
    name: 'uptime',
    usage: '/uptime',
    category: 'system'
  },

  formatTime(n) {
    return n < 10 ? `0${n}` : n;
  },

  run: async ({ nexusMessage }) => {
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor(uptime % 86400 / 3600);
    const m = Math.floor(uptime % 3600 / 60);
    const s = Math.floor(uptime % 60);

    const msg = `╭━━━BOT UPTIME━━━╮
┃
┃ ⏰ ${d}d ${this.formatTime(h)}h ${this.formatTime(m)}m ${this.formatTime(s)}s
┃
╰━━ＮＥＸＵＳ ＢＯＴ━━╯`;

    return nexusMessage.reply(msg);
  }
};