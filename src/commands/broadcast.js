import db from '../../db.js';

export default {
  config: {
    name: "broadcast",
    author: "Your Name",
    permission: 1,
    category: "Admin",
    description: "Send notifications to all groups with advanced options",
    usage: "prefix broadcast <message> [-p] [-d <delay>]",
    cooldown: 300
  },

  run: async ({ api, args, message, nexusMessage }) => {
    try {
      const options = {
        preview: args.includes('-p'),
        delay: 0
      };

      const delayIndex = args.indexOf('-d');
      if (delayIndex !== -1 && args[delayIndex + 1]) {
        options.delay = parseInt(args[delayIndex + 1]) || 0;
        args.splice(delayIndex, 2);
      }

      const messageContent = args
        .filter(arg => arg !== '-p')
        .join(" ")
        .trim();

      if (!messageContent) {
        return nexusMessage.reply({
          body: "❌ Please provide a message to broadcast\n\nUsage examples:\n- broadcast Hello everyone\n- broadcast Hello -p (preview mode)\n- broadcast Hello -d 2 (2s delay between messages)"
        });
      }

      const broadcastMessage = `📢 ADMIN BROADCAST\n━━━━━━━━━\n\n${messageContent}\n\n━━━━━━━━━━\n⏰ ${new Date().toLocaleString()}\n❗Do not reply to this message`;

      const groups = Object.keys(db.readDB().groups);

      if (options.preview) {
        return nexusMessage.reply({
          body: `📝 Preview Mode\n\nMessage will be sent to ${groups.length} groups:\n${broadcastMessage}\n\nRemove -p flag to send for real.`
        });
      }

      const successful = [];
      const failed = [];

      for (const groupId of groups) {
        try {
          if (options.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, options.delay * 1000));
          }

          await api.sendMessage(broadcastMessage, groupId);
          successful.push(groupId);

          if (successful.length % 5 === 0) {
            await nexusMessage.reply({
              body: `📤 Progress: ${successful.length}/${groups.length} messages sent...`
            });
          }
        } catch (error) {
          failed.push(groupId);
          console.error(`Failed to send to group ${groupId}:`, error.message);
        }
      }

      const report = [
        `📊 Broadcast Complete`,
        `━━━━━━━━━━`,
        `✅ Successfully sent: ${successful.length}`,
        `❌ Failed: ${failed.length}`,
        `📝 Message length: ${messageContent.length} chars`,
        `⏱️ Time taken: ${(options.delay * successful.length).toFixed(1)}s`
      ].join('\n');

      console.log({
        timestamp: new Date().toISOString(),
        successful: successful.length,
        failed: failed.length,
        message: messageContent
      });

      return nexusMessage.reply({ body: report });
    } catch (error) {
      console.error('Broadcast command error:', error);
      return nexusMessage.reply({
        body: `❌ An error occurred while broadcasting: ${error.message}`
      });
    }
  }
};