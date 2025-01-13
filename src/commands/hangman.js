export default {
config: {
name: 'hangman',
description: 'Play Hangman',
usage: '(prefix)hangman',
permission: 0,
category: 'Games',
author: "Your Name"
},
run: async ({ api, message, args, config, nexusMessage }) => {
const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
const chosenWord = words[Math.floor(Math.random() * words.length)];
const blankSpaces = Array(chosenWord.length).fill('_');
let attempts = 6;

nexusMessage.replyWithCallback(`Let's play Hangman! I'm thinking of a word: ${blankSpaces.join(' ')}`, async (reply) => {
const userGuess = reply.body.toLowerCase();

if (chosenWord.includes(userGuess)) {
for (let i = 0; i < chosenWord.length; i++) {
if (chosenWord[i] === userGuess) {
blankSpaces[i] = userGuess;
}
}
} else {
attempts--;
}

if (blankSpaces.join('') === chosenWord) {
api.sendMessage(`Congratulations! You guessed the word: ${chosenWord}`, reply.threadID, reply.messageID);
} else if (attempts === 0) {
api.sendMessage(`Game over! The word was: ${chosenWord}`, reply.threadID, reply.messageID);
} else {
api.sendMessage(`You have ${attempts} attempts left. Guess another letter! ${blankSpaces.join(' ')}`, reply.threadID, reply.messageID);
}
});
}
};