
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
        const funding = 38 / 0.24 * 1000

        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');

        let cost;

        if (elevenUsage.charactersUsed >= elevenUsage.characterLimit+funding) {

          const amountOver = elevenUsage.charactersUsed - elevenUsage.characterLimit + funding;

                    
          cost = costOverInDollars = amountOver * 0.00024;
        }

      res.json({
      characterLimit: Math.ceil(elevenUsage.characterLimit + funding),
      charactersUsed: elevenUsage.charactersUsed,
      overage: costOverInDollars
    });
      
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred.' });
    }
  };


