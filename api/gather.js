import dotenv from 'dotenv';

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


async function defaultPrompt(questionText, userName) {

  const voice = process.env.frazID;
  const world = 'frasier';
  const name = 'Dr. Frasier Crane';
  const location = 'kacl';
  const model = 'fraz';
  const charLimit = 500;
  const tokens = 900;
  const subject = questionText;

  const prompt = `Pretend to be Dr. Frasier Crane on his radio show giving response to a caller named ${userName} asking this question/statement: "${subject}". \
Be creative and humorous with dialogue in the same way Dr. Frasier Crane often speaks. The goal is to be funny and not so much give great advice. \
End the monologue with 'This is Dr. Frasier Crane signing off & wishing you good mental health' \
Separate the title and script in your response. \
Keep your response under ${charLimit} characters. Reply in only json with no other text. The json just contain two parts: title and script.\
Make sure the title for the episode is a double entendre.`


  return {voice, world, prompt, subject, name, location, tokens, model}
}

export async function gather(questionText, userName) {

  const promptInfo = await defaultPrompt(questionText, userName);

  console.log(`promptInfo: ${promptInfo.prompt}`)

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

    console.log(`script check: ${gptScript}`)

    const gptHandoff = {
      "text": `${gptScript}`,
      "voice_settings": {
        "stability": 0.2,
        "similarity_boost": 1
      }
    }

    const voiceData = await getVoice(gptTitle, gptHandoff, gptScript, voice, world, subject, model, location, voiceUrl);

    return {
      gptTitle: voiceData.gptTitle,
      gptHandoff: voiceData.gptHandoff,
      gptScript: voiceData.gptScript,
      voice: voiceData.voice,
      world: voiceData.world,
      subject: voiceData.subject,
      model: voiceData.model,
      location: voiceData.location,
      audioBase64: voiceData.audioBase64
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
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

export default async (req, res) => {
  try {
    const { questionText, userName } = req.query;

      const result = await gather(questionText, userName);
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      console.log(result);
      res.json(result);
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred.' });
  }
};