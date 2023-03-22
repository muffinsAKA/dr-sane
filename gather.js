import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import mysql from 'mysql2';
import { promptGen } from './prompt.js';

dotenv.config();

// GPT env vars
const gptKey = process.env.gptKey;
const gptReqUrl = "https://api.openai.com/v1/chat/completions";

// Audio env vars
const elevenKey = process.env.elevenKey;
const elevenReqUrl = "https://api.elevenlabs.io/v1/text-to-speech/R6QrvpufMyjzGOOnlWdY";

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

    
    const gptHandoff = {
      "text": `${gptScript}`,
      "voice_settings": {
        "stability": 0.25,
        "similarity_boost": 1
      }
    }
    
    return getVoice(gptTitle, gptHandoff, gptScript);

      })

    .then(() => {
        console.log("Audio file saved");
    })
    .catch((error) => {
    console.error(error);
    });

}



function dbWrite(gptTitle, gptScript, filename) {
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
  });

  const newEntry = {
    title: gptTitle,
    script: gptScript,
    audio: filename  
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
  const content = message.content;
  
  console.log(content)
  const titleIndex = content.indexOf("Title:");
  const scriptIndex = content.indexOf("Script:");

  const gptTitle = content.slice(titleIndex + 7, scriptIndex).trim();
  const gptScript = content.slice(scriptIndex + 7).trim();

  return { gptTitle, gptScript };
}




async function getVoice(gptTitle, gptHandoff, gptScript) {
  
  try {
    const response = await fetch(elevenReqUrl, {
      method: 'POST',
      headers: elevenHeader,
      body: JSON.stringify(gptHandoff)
    });

    const audioData = await response.arrayBuffer();
    const filenameRaw = await gptTitle.replace(/"/g, '').replace(/\s/g,'_');
    const filename = `./audio/${filenameRaw}.mp3`

    fs.writeFile(filename, Buffer.from(audioData), (err) =>  {
      if (err) throw err;
      console.log(`File ${filename} has been saved.`);
    });

    dbWrite(gptTitle, gptScript, filename);

  } catch (error) {
    console.error(error);
  }
}

gather()