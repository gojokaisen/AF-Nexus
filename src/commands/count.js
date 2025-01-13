export default {

    config: {

        name: "count",

        description: "View the number of messages of members or yourself",

        usage: "(prefix)count [@tag/all]",

        category: "box chat",

        aliases: [],

        permission: 0,

        author: "Frank x asta"

    },

    Nexus: async ({ args, threadsData, message, event, api }) => {

        const { threadID, senderID } = message;

        const threadData = await threadsData.get(threadID);

        const { members } = threadData;

        const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;

        let arraySort = [];

        for (const user of members) {

            if (!usersInGroup.includes(user.userID)) continue;

            const charac = "️️️️️️️️️️️️️️️️"; // Banned character from facebook chat

            arraySort.push({

                name: user.name.includes(charac) ? `Uid: ${user.userID}` : user.name,

                count: user.count,

                uid: user.userID

            });

        }

        let stt = 1;

        arraySort.sort((a, b) => b.count - a.count);

        arraySort.map(item => item.stt = stt++);

        if (args[0]) {

            if (args[0].toLowerCase() == "all") {

                let msg = "Number of messages of members:";

                for (const item of arraySort) {

                    if (item.count > 0)

                        msg += `\n${item.stt}/ ${item.name}: ${item.count}`;

                }

                nexusMessage.reply(msg);

            }

            else if (event.mentions) {

                let msg = "";

                for (const id in event.mentions) {

                    const findUser = arraySort.find(item => item.uid == id);

                    msg += `\n${findUser.name} rank ${findUser.stt} with ${findUser.count} messages`;

                }

                nexusMessage.reply(msg);

            }

        }

        else {

            const findUser = arraySort.find(item => item.uid == senderID);

            return nexusMessage.reply(`You are ranked ${findUser.stt} and have sent ${findUser.count} messages in this group`);

        }

    }

};