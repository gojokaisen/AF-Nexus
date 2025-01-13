export default {

    config: {

        name: "bio",

        description: "Change bot bio",

        usage: "(prefix)bio (text)",

        category: "owner",

        aliases: [],

        permission: 2,

        author: "Frank and asta"

    },

    Nexus: async ({ args, message, api, nexusMessage }) => {

        api.changeBio(args.join(" "));

        nexusMessage.reply("✅change bot bio to:" + args.join(" "));

    }

};