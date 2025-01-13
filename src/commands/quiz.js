import axios from 'axios';

export default {
  config: {
    name: 'quiz',
    version: '1.0',
    author: 'Frank kaumba X Asta',
    cooldown: 10,
    permission: 0,
    category: 'GAMES',
    description: 'Start a quiz game',
    usage: '{prefix}quiz'
  },

  run: async ({ nexusMessage }) => {
    const API_URL = 'http://103.162.185.24:2424/api/games/quiz';
    const API_KEY = 'r-04c7b1e52df1d8adb30aaa9d';

    try {
      const response = await axios.get(`${API_URL}?apikey=${API_KEY}`);
      const quizData = response.data;

      if (!quizData || !quizData.question) {
        return nexusMessage.reply("╭─────⭓\n│ ❌ Failed to fetch quiz question\n╰────⭓");
      }

      let quizMessage = `╭─⭓ 𝐐𝐔𝐈𝐙 𝐓𝐈𝐌𝐄 ⭓────\n│\n`;
      quizMessage += `├─⭓ ${styleBold('QUESTION')}:\n`;
      quizMessage += `│  ${quizData.question}\n│\n`;
      quizMessage += `├─⭓ ${styleBold('CHOICES')}:\n`;
      
      if (quizData.answers) {
        quizData.answers.forEach((answer, index) => {
          quizMessage += `│  ${String.fromCharCode(65 + index)}. ${answer}\n`;
        });
      }
      
      quizMessage += `│\n├─⭓ Reply with the letter of your answer (A, B, C, or D)\n`;
      quizMessage += `╰─⭓ You have 30 seconds to answer`;

      nexusMessage.replyWithCallback(quizMessage, async (reply) => {
        const userAnswer = reply.body.trim().toUpperCase();
        const correctAnswer = quizData.correct.toUpperCase();

        if (!/^[A-D]$/.test(userAnswer)) {
          return nexusMessage.reply(`╭─────⭓\n│ ❌ Invalid answer! Please use A, B, C, or D\n╰────⭓`);
        }

        if (userAnswer === correctAnswer) {
          return nexusMessage.reply(`╭─────⭓\n│ ✅ Correct answer!\n╰────⭓`);
        } else {
          return nexusMessage.reply(`╭─────⭓\n│ ❌ Wrong answer! The correct answer was ${correctAnswer}\n╰────⭓`);
        }
      }, 30000, () => {
        nexusMessage.reply(`╭─────⭓\n│ ⏰ Time's up! The correct answer was ${quizData.correct}\n╰────⭓`);
      });

    } catch (error) {
      console.error('Quiz command error:', error);
      return nexusMessage.reply(`╭─────⭓\n│ ❌ An error occurred while fetching the quiz\n╰────⭓`);
    }
  }
};

function styleBold(text) {
  const boldMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
    'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
    'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    ' ': ' '
  };
  return text.split('').map(char => boldMap[char.toUpperCase()] || char).join('');
}