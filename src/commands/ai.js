import axios from 'axios';

const UPoLPrefix = [
  'nexus',
  'ai',
  'bot'
]; 

  export default {
  config: {
    name: 'ai',
    permission: 0,
    category: 'AI',
    author: 'Raphael scholar',
    description: "lol",
    usage: "hehe"
  },
  
  onChat: async ({ message, args, api, nexusMessage }) => {
      
      const ahprefix = UPoLPrefix.find((p) => message.body && message.body.toLowerCase().startsWith(p));
      if (!ahprefix) {
        return; 
      } 
      
     const upol = message.body.substring(ahprefix.length).trim();
   if (!upol) {
        await nexusMessage.reply('Enter a question.? ');
        return;
      }
      
    const encodedPrompt = encodeURIComponent(args.join(" "));

   await nexusMessage.reply('thinking..');
  
    const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodedPrompt}`);
 
     const UPoL = response.data.answer; 

      const upolres = `${UPoL}`;
      
        nexusMessage.reply(upolres);
  }
};