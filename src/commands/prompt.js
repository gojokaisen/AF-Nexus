import axios from 'axios';
import FormData from 'form-data';
import fetch from 'node-fetch';

export default {
    config: {
        name: "prompt",
        version: "1.6",
        author: "Asta X Frank",
        cooldown: 5,
        permission: 1,
        description: "prompt3",
        category: "owner",
        usage: "{pn} reply"
    },
    onStart: async ({ message, args,nexusMessage }) => {
        const imageUrl = message?.messageReply?.attachments?.[0]?.url;
        if (!imageUrl) return;
        
        const ImgBB = await uploadToImgbb(imageUrl);
        
        const URL = ImgBB.url;
        const prompt = await getImagePrompt(imageUrl);
        nexusMessage.reply(prompt);
    }
};

const API_URL = "https://cococlip.ai/api/v1";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
  Referer: "https://cococlip.ai/features/image-to-prompt",
};
const TIMEOUT = 12e4;
const POLL_INTERVAL = 2e3;

async function getImagePrompt(imageUrl) {
  try {
    const response1 = await fetch(
      `${API_URL}/imagetoprompt/imageclip?image=${encodeURIComponent(imageUrl)}`,
      {
        method: "GET",
        headers: HEADERS,
      },
    );
    const { id: promptId } = await response1.json();
    if (!promptId) throw new Error("Failed to retrieve promptId");
    const startTime = Date.now();
    while (Date.now() - startTime < TIMEOUT) {
      const response2 = await fetch(
        `${API_URL}/checkqueue?promptId=${promptId}`,
        {
          method: "GET",
          headers: HEADERS,
        },
      );
      const { nums } = await response2.json();
      if (nums === 0) {
        const response3 = await fetch(
          `${API_URL}/imagetoprompt/imageclippoll?promptId=${promptId}`,
          {
            method: "GET",
            headers: HEADERS,
          },
        );
        const { prompt } = await response3.json();
        if (prompt) return prompt;
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
    throw new Error("Polling timed out for final result");
  } catch (error) {
    console.error("Error install getImagePrompt:", error);
    throw error;
  }
}

async function uploadToImgbb(url) {
    try {
        const res_ = await axios({
            method: 'GET',
            url: 'https://imgbb.com',
        });

        const auth_token = res_.data.match(/auth_token="([^"]+)"/)[1];
        const timestamp = Date.now();

        const res = await axios({
            method: 'POST',
            url: 'https://imgbb.com/json',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: {
                source: url,
                type: 'url',
                filename:'image.png',
                action: 'upload',
                timestamp: timestamp,
                auth_token: auth_token,
            },
        });

        return {
            url: res.data.image.url,
            url_viewer: res.data.image.url_viewer,
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}