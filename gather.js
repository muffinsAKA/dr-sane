import dotenv from 'dotenv';
import fs from 'fs';
import mysql from 'mysql2';
import { promptGen } from './prompt.js';

dotenv.config();

// GPT env vars
const gptKey = process.env.gptKey;
const gptReqUrl = "https://api.openai.com/v1/chat/completions";

// Audio env vars
const elevenKey = process.env.elevenKey;
const elevenReqUrl = "https://api.elevenlabs.io/v1/text-to-speech/";

const elevenHeader = {
  'accept': 'audio/mpeg',
  'xi-api-key': elevenKey,
  'Content-Type': 'application/json'
};

export async function gather() {
  const promptInfo = await promptGen();

  console.log(`promptInfo: ${promptInfo}`)

  const voice = promptInfo.voice;
  const subject = promptInfo.subject;
  const world = promptInfo.world;
  const location = promptInfo.location;
  const model = promptInfo.model;

  const voiceUrl = elevenReqUrl + voice;
  
  const data = {
    messages: [{ role: "user", content: `${promptInfo.prompt}`}],
    max_tokens: promptInfo.tokens,
    model: "gpt-3.5-turbo",
    temperature: 1,
    top_p: 1,
    stream: false
  };

  try {
    const { gptTitle, gptScript } = await getScript(data);

    const gptHandoff = {
      "text": `${gptScript}`,
      "voice_settings": {
        "stability": 0.2,
        "similarity_boost": 1
      }
    }

    const voiceData = await getVoice(gptTitle, gptHandoff, gptScript, voice, world, subject, model, location, voiceUrl);


    return { gptTitle, gptHandoff, gptScript, voice, world, subject, model, location, filename: voiceData.filename };

  } catch (error) {
    console.error(error);
    throw error;
  }
}


async function getScript(data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${gptKey}`,
  };

  const response = await fetch(gptReqUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  });
  const result = await response.json();

  const message = result.choices[0].message;

  const content = JSON.parse(message.content);

  const gptTitle = content.title;
  const gptScript = content.script;

  console.log(`title: ${gptTitle}, script: ${gptScript}`)

  return { gptTitle, gptScript };
}




async function getVoice(gptTitle, gptHandoff, gptScript, voice, world, subject, model, location, voiceUrl) {
  
  try {
    const response = await fetch(voiceUrl, {
      method: 'POST',
      headers: elevenHeader,
      body: JSON.stringify(gptHandoff)
    });

    const audioData = await response.arrayBuffer();
    const filenameRaw = gptTitle.replace(/"/g, '').replace(/\s/g,'_');
    const filename = `./audio/${world}/${filenameRaw}.mp3`

    fs.writeFile(filename, Buffer.from(audioData), (err) =>  {
      if (err) throw err;
      console.log(`File ${filename} has been saved.`);
    });

    return { gptTitle,gptHandoff, gptScript, voice, world, subject, model, location, voiceUrl, filename }

  } catch (error) {
    console.error(error);
  }
}
