
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();


const elevenState = {
    elevenKey: process.env.elevenKey,
    elevenReqUrl: "https://api.elevenlabs.io/v1/user",
    async check() {
      const elevenHeader = {
        'accept': 'application/json',
        'xi-api-key': this.elevenKey,
        'Content-Type': 'application/json'
      };
  
      const response = await fetch(this.elevenReqUrl, {
        method: 'GET',
        headers: elevenHeader,
      });
  
      const responseJson = await response.json();
  
      const characterLimit = responseJson.subscription.character_limit;
      const charactersUsed = responseJson.subscription.character_count;

      return { characterLimit, charactersUsed };
    }
  };


export default async (req, res) => {
    try {
  
        const elevenUsage  = await elevenState.check();


        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');

        res.json({
      characterLimit: elevenUsage.characterLimit,
      charactersUsed: elevenUsage.charactersUsed
    });
      
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred.' });
    }
  };

  elevenState.check();

