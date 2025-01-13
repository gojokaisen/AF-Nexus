export default {

    config: {

        name: "google",

        description: "Searches Google for a given query",

        usage: "(prefix)google <query>",

        category: "utility",

        aliases: ["search", "g"],

        permission: 0,

        author: "Frank x asta"

    },

    Nexus: async ({ api, message, args }) => {

        const query = args.join(' ');

        if (!query) {

            api.sendMessage("Please provide a search query.", message.threadID, message.messageID);

            return;

        }

        

        const cx = "7514b16a62add47ae";

        const apiKey = "AIzaSyAqBaaYWktE14aDwDE8prVIbCH88zni12E";

        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}`;

        

        try {

            const response = await axios.get(url);

            const searchResults = response.data.items.slice(0, 5);

            let mesS = `Top 5 results for '${query}':\n`;

            searchResults.forEach((result, index) => {

                mess += `${index + 1}. ${result.title}\n${result.link}\n`;

            });

            api.sendMessage(mess, message.threadID, message.messageID);

        } catch (error) {

            console.error(error);

            api.sendMessage("An error occurred while searching Google.", message.threadID, message.messageID);

        }

    }

};