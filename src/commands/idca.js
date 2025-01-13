export default {
  config: {
    name: 'idca',
    description: 'IDCA command with admin notifications',
  category: "system",
    usage: '(prefix)idca',
    permission: 0,
    author: "Frank kaumba x Asta",
    adminIds: ["61557780285734", "admin2"]
  },

  Nexus: async ({ api, message, args, config, nexusMessage, onReply, sendMessage }) => {
    try {
      const response = await nexusMessage.reply('Processing IDCA command...');

      if (!response) {
        throw new Error('Failed to send initial message');
      }

      const notifyAdmins = async (errorMessage) => {
        for (const adminId of config.adminIds) {
          await api.sendMessage(
            `Error in IDCA command:\n${errorMessage}\nThread: ${message.threadID}`,
            adminId
          );
        }
      };

      try {
        const result = await someAsyncOperation();
        return nexusMessage.reply(`Operation completed: ${result}`);
      } catch (error) {
        await notifyAdmins(error.message);
        return nexusMessage.reply('An error occurred. Admins have been notified.');
      }
    } catch (error) {
      for (const adminId of config.adminIds) {
        api.sendMessage(
          `Critical error in IDCA command:\n${error.message}\nThread: ${message.threadID}`,
          adminId
        );
      }
      return 'A critical error occurred. Admins have been notified.';
    }
  }
};