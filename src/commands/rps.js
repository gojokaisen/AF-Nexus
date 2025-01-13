export default {
config: {
name: 'rps',
description: 'Play Rock, Paper, Scissors',
usage: '(prefix)rps',
permission: 0,
category: 'Games',
author: "Frank * asta"
},
run: async ({ api, message, args, config, nexusMessage }) => {
nexusMessage.replyWithCallback('Rock, Paper, Scissors! Reply with "rock," "paper," or "scissors" to play.', async (reply) => {
const userChoice = reply.body.toLowerCase();
const choices = ['rock', 'paper', 'scissors'];
const botChoice = choices[Math.floor(Math.random() * choices.length)];

 let result;
  if (userChoice === botChoice) {
    result = 'It\'s a tie!';
  } else if ((userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')) {
    result = 'You win!';
  } else {
    result = 'Bot wins!';
  }

  api.sendMessage(`You chose ${userChoice}, bot chose ${botChoice}. ${result}`, reply.threadID, reply.messageID);
});

}
};