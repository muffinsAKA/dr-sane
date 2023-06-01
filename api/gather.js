import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import fetch from 'node-fetch';

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

AWS.config.update({
  accessKeyId: process.env.s3access,
  secretAccessKey: process.env.s3secret,
});


async function defaultPrompt(questionText) {

  const voice = process.env.frazID;
  const world = 'frasier';
  const name = 'Dr. Frasier Crane';
  const location = 'kacl';
  const model = 'fraz';
  const charLimit = 400;
  const tokens = 900;
  const subject = questionText;

  const defaultStr = Handlebars.compile(
      "Pretend to be Dr. Frasier Crane on his radio show giving response to a calller asking about {{{subject}}}. \
End the monologue with 'This is Dr. Frasier Crane signing off and wishing you good mental health' \
Separate the title, which should be creative, and script in your response. \
Keep your response under {{charLimit}} characters. Reply in only json with no other text");

  const prompt = defaultStr({ 
      subject: `${subject}`,
      charLimit: charLimit
  });


  return {voice, world, prompt, subject, name, location, tokens, model}
}

export async function gather(questionText) {

  const promptInfo = await defaultPrompt(questionText);

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

    return {
      gptTitle,
      gptHandoff,
      gptScript,
      voice,
      world,
      subject,
      model,
      location,
      audioBase64: voiceData.audioBase64
    };
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

    // Store the audio data in a variable or process it further as needed
    const audioBase64 = Buffer.from(audioData).toString('base64');

    return { gptTitle, gptHandoff, gptScript, voice, world, subject, model, location, voiceUrl, audioBase64 };
  } catch (error) {
    console.error(error);
  }
}

export async function retrieveAudio() {
  try {
    const bucketName = 'muffinsaka';
    const audioFiles = [
      'theme1.mp3',
      'theme2.mp3',
      'theme3.mp3',
      'theme4.mp3',
      'theme5.mp3',
      'theme6.mp3',
      'theme7.mp3',
      'theme8.mp3',
      'theme9.mp3',
      'theme10.mp3',
      'theme11.mp3',
      'theme12.mp3',
      'theme13.mp3',
      'theme14.mp3',
      'theme15.mp3',
      'theme16.mp3',
      'theme17.mp3',
      'theme18.mp3',
      'theme19.mp3',
      'theme20.mp3',
      'theme21.mp3'
    ];

    // Select a random audio file
    const randomIndex = Math.floor(Math.random() * audioFiles.length);
    const selectedAudioFile = audioFiles[randomIndex];

    // Set the appropriate S3 bucket name and file key
    const fileKey = selectedAudioFile;

    // Get the object from S3
    const s3Params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    const s3Object = await s3.getObject(s3Params).promise();

    // Retrieve the audio data as a base64 string
    const audioData = s3Object.Body.toString('base64');

    return audioData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default async (req, res) => {
  try {
    const { endpoint } = req.query;

    if (endpoint === 'gather') {
      const result = await gather(questionText);
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json(result);

    } else if (endpoint === 'retrieve-audio') {
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      const audioData = await retrieveAudio();
      res.send(audioData);

    } else {

      res.status(404).json({ error: 'Invalid endpoint' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred.' });
  }
};