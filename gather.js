import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';

import mysql from 'mysql2';

// GPT env vars
const gptKey = process.env.gptKey;
const orgID = process.env.orgID;
const gptReqUrl = "https://api.openai.com/v1/chat/completions";


// Audio env vars
const elevenKey = process.env.elevenKey;
const elevenReqUrl = "https://api.elevenlabs.io/v1/text-to-speech/H5aHUmStO77lPjqMLSLT";

// SQL env keys
const sqlhost = process.env.sqlhost;
const sqldb = process.env.sqldb;
const sqluser = process.env.sqluser;
const sqlpass = process.env.sqlpass;


// Fake test vars
let prompt = 'Pretend to be Dr. Frasier Crane on his radio show giving a monologue to his audience about he thinks he is being stalked by the pizza guy and format your reply two different entries called Title and Script. Title is the name of the episode and Script is where the monologue goes. Please keep the monologue less than 180 characters';


const connection = mysql.createConnection({
  host: sqlhost,
  user: sqluser,
  password: sqlpass,
  database: sqldb
});


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

// Set chatgpt request + settings
const data = {
  messages: [{ role: "user", content: `${prompt}`}],
  max_tokens: 250,
  model: "gpt-3.5-turbo",
  temperature: 1,
  top_p: 1,
  stream: false
};


const elevenHeader = {
    'accept': 'audio/mpeg',
    'xi-api-key': elevenKey,
    'Content-Type': 'application/json'
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


getScript(data)
    .then(({ gptTitle, gptScript }) => {
    console.log("---GPT TITLE---")
    console.log(gptTitle)
    console.log('---GPT SCRIPT---')
    console.log(gptScript)
    const gptHandoff = {
      "text": `${gptScript}`,
      "voice_settings": {
        "stability": 0.12,
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

async function getVoice(gptTitle, gptHandoff, gptScript) {
  try {
    const response = await fetch(elevenReqUrl, {
      method: 'POST',
      headers: elevenHeader,
      body: JSON.stringify(gptHandoff)
    });

    const audioData = await response.arrayBuffer();
    const filename = `./audio/${gptTitle}.mp3`.replace(/"/g, '').replace(/\s/g,'_');
    fs.writeFile(filename, Buffer.from(audioData), (err) =>  {
      if (err) throw err;
      console.log(`File ${filename} has been saved.`);
    });

    dbWrite(gptTitle, gptScript, filename);

  } catch (error) {
    console.error(error);
  }
}

