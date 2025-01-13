export default {
config: {
name: 'guess',
description: 'Guess My Number',
usage: '(prefix)guess',
permission: 0,
category: 'Games',
author: "frank * asta"
},
run: async ({ api, message, args, config, nexusMessage }) => {
const numberToGuess = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

nexusMessage.replyWithCallback(`I'm thinking of a number between 1 and 100. Try to guess it!`, async (reply) => {
const userGuess = parseInt(reply.body);

attempts++;

if (isNaN(userGuess)) {
api.sendMessage(`Invalid input! Please enter a number.`, reply.threadID, reply.messageID);
} else if (userGuess < numberToGuess) {
api.sendMessage(`Too low! Try again. (Attempt ${attempts})`, reply.threadID, reply.messageID);
} else if (userGuess > numberToGuess) {
api.sendMessage(`Too high! Try again. (Attempt ${attempts})`, reply.threadID, reply.messageID);
} else {
api.sendMessage(`Congratulations! You guessed the number in ${attempts} attempts.`, reply.threadID, reply.messageID);
}
});
}
};