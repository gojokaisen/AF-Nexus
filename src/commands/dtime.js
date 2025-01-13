export default {

    config: {

        name: "dtime",

        description: "Display the current date and time of some countries and Uptime",

        usage: "(prefix)dtime",

        category: "date-system",

        aliases: [],

        permission: 0,

        author: "Frank x asta"

    },

    Nexus: async ({ api, event, message, nexusMessage }) => {

        const loadingMessage = await nexusMessage.reply({

            body: "Please wait",

        });

        const frog = await global.utils.getStreamFromURL("https://i.ibb.co/cFhc1my/4x9cfdbdpth81.gif");

        

        const now = moment();

        const os = require("os");

        // Setting timezone

        moment.tz.setDefault('Asia/Dhaka');

        

        const times = {

            Bangladesh: moment(),

            India: moment.tz("Asia/Kolkata"),

            Nepal: moment.tz("Asia/Kathmandu"),

            Pakistan: moment.tz("Asia/Karachi"),

            Myanmar: moment.tz("Asia/Yangon"),

            Europe: moment.tz("Asia/Rome"),

            Qatar: moment.tz("Asia/Qatar"),

            Germany: moment.tz("Europe/Berlin"),

            Bhutan: moment.tz("Asia/Thimphu"),

            Brazil: moment.tz("America/Araguaina"),

            Australia: moment.tz("Antarctica/Macquarie"),

            Barbados: moment.tz("America/Barbados"),

            Afghanistan: moment.tz("Asia/Kabul"),

            Argentina: moment.tz("America/Argentina/Buenos_Aires"),

            France: moment.tz("Europe/Paris"),

            Hong_Kong: moment.tz("Asia/Hong_Kong"),

            Indonesia: moment.tz("Asia/Jakarta")

        };

        const uptime = process.uptime();

        const seconds = Math.floor(uptime % 60);

        const minutes = Math.floor((uptime / 60) % 60);

        const hours = Math.floor((uptime / (60 * 60)) % 24);

        const days = Math.floor(uptime / (60 * 60 * 24));

        const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

        let Body = "\n\n";

        for (const [country, time] of Object.entries(times)) {

            Body += `*______________________________\n${country} Time: ${time.format('hh:mm:ss A')}\n${country} Date: ${time.format('dddd, DD MMMM')}\n*______________________________\n\n`;

        }

        Body += `ㅤㅤㅤㅤㅤㅤㅤ[Uptime]ㅤㅤㅤㅤㅤㅤㅤ\n\nUp: ${uptimeString}\nRam: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;

        nexusMessage.reply({ body: Body, attachment: frog }, event.threadID);

        

        setTimeout(() => {

            api.unsendMessage(loadingMessage.messageID);

        }, 2000);

    }

};