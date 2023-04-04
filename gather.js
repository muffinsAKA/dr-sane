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

// SQL env keys
const sqlhost = process.env.sqlhost;
const sqldb = process.env.sqldb;
const sqluser = process.env.sqluser;
const sqlpass = process.env.sqlpass;


// SQL connection cmd
const connection = mysql.createConnection({
  host: sqlhost,
  user: sqluser,
  password: sqlpass,
  database: sqldb
});

const elevenHeader = {
  'accept': 'audio/mpeg',
  'xi-api-key': elevenKey,
  'Content-Type': 'application/json'
};

async function gather() {
  
  const promptInfo = await promptGen();

  const voice = promptInfo.voice;
  const subject = promptInfo.subject;
  const world = promptInfo.world;
  const location = promptInfo.location;
  const model = promptInfo.model;

  const voiceUrl = elevenReqUrl + voice;
  
  
  // Set chatgpt request + settings
  const data = {
  messages: [{ role: "user", content: `${promptInfo.prompt}`}],
  max_tokens: promptInfo.tokens,
  model: "gpt-3.5-turbo",
  temperature: 1,
  top_p: 1,
  stream: false

  };

  getScript(data)
      .then(({ gptTitle, gptScript }) => {

        console.log('Title: ' + gptTitle )
        console.log('Script: ' + gptScript )

      const gptHandoff = {
        "text": `${gptScript}`,
        "voice_settings": {
          "stability": 0.2,
          "similarity_boost": 1
        }
      }
      console.log(voice)
      return getVoice(gptTitle, gptHandoff, gptScript, voice, world, subject, model, location, voiceUrl);
        })

      .then(() => {
          console.log("Audio file saved");
      })
      .catch((error) => {
      console.error(error);
      });

}





function dbWrite(gptTitle, gptScript, filename, voice, world, subject, model, location ) {
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
  });

  const newEntry = {
    title: gptTitle,
    script: gptScript,
    audio: filename,
    voice: voice,
    world: world,
    subject: subject,
    model: model,
    location: location

};

  const sql = 'INSERT INTO sanedb SET ?';

  connection.query(sql, newEntry, (err, result) => {
    if (err) throw err;
    console.log('New entry added:', result);

  });

  connection.end((err) => {
    if (err) throw err;
    console.log('Disconnected from Sane database')
  })
  };




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

    console.log(voice)
    dbWrite(gptTitle, gptScript, filename, voice, world, subject, model, location);

  } catch (error) {
    console.error(error);
  }
}

gather()