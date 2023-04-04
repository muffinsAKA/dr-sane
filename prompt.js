import Handlebars from 'handlebars';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const tokens = 200
const charLimit = tokens * 2.25

const nounFile = fs.readFileSync('./res/lists/nounlist.txt', 'utf-8');
const subjectList = nounFile.split('\n');

const worldsJson = fs.readFileSync('./res/worlds.json');
const worlds = JSON.parse(worldsJson);

// voice ids
const frazID = process.env.frazID;

const personList = [
    [`${frazID}`, 'Dr. Frasier Crane']
    // ['niles', 'Dr. Niles Crane, Frasier\'s brother,'],
    // ['lillith', 'Lilith, Frasier\'s ex-wife,'],
    // ['martin', 'Martin Crane, Frasier\'s father,']
];


function randInt(min, max) {
    
    return Math.floor(Math.random() * (max - min + 1)) + min;

}
  

export async function randomArray(array) {

  let selection;
  let voice;

  const randomEntry = randInt(0, array.length - 1);

  const frasierWeight = randInt(1,10)

  if (array === personList) {

    selection = array[randomEntry][1];  
    voice = array[randomEntry][0];  
  
  } else {

    selection = array[randomEntry];

  }

  
  // if the array is personList, check the frasierWeight variable to decide if a non-Frasier character will appear
  if (array === personList) {

    if (frasierWeight >= 11) {
        
        return { selection, npc }
    
    } else {
    
        selection = array[0][1];
        voice = array[0][0];

        return { selection, voice };

    }

  } else {

    return selection;

    }
  
};

export async function promptGen() {

    const locWeight = randInt(1,25);

    let result;

    if (locWeight > 20) {
        
        result = await locPrompt();
        return result;
    
    } else {

        result = await defaultPrompt();
        return result;

    }
};

export async function defaultPrompt() {


    const subject = await randomArray(subjectList);
    const person = await randomArray(personList);

    const voice = person.voice;
    const world = 'frasier'
    const name = 'Dr. Frasier Crane'
    const location = 'kacl'
    const model = 'fraz'

    const defaultStr = Handlebars.compile(
        "Pretend to be {{{person}}} on his radio show giving a monologue to his audience about {{{subject}}}. \
End the monologue with 'This is Dr. Frasier Crane signing off and wishing you good mental health' \
Separate the title, which should be creative, and script in your response. \
Keep your total response under {{charLimit}} characters. Reply in only json with no other text");

    const prompt = defaultStr({ 
        person: `${person.selection}`,
        subject: `${subject}`,
        charLimit: charLimit
    });

    console.log('charLimit:' + charLimit)



    return {voice, world, prompt, subject, name, location, tokens, model}
}

export async function locPrompt() {
    
    const worldsList = Object.keys(worlds)
    const worldsLength = Object.keys(worlds).length;

    const randomWorldIndex = randInt(0, worldsLength - 1);

    const world = worldsList[randomWorldIndex];
    
    const subjectLength = worlds[`${world}`]["subject"].length;
    const randomSubjectIndex = randInt(0, subjectLength -1);

    const subject = worlds[`${world}`]["subject"][randomSubjectIndex];


    const npcLength = worlds[`${world}`]["npc"].length;
    const randomNpcIndex = randInt(0, npcLength -1);
    
    const npc = worlds[`${world}`]["npc"][randomNpcIndex];

    const voice = npc[0];
    const name = npc[1];
    const model = npc[2];

    const locLength = worlds[`${world}`]["location"].length;
    const randomLocIndex = randInt(0, locLength -1);

    const location = worlds[`${world}`]["location"][randomLocIndex];

    const locStr = Handlebars.compile(
        "Pretend to be {{{name}}} filling in for Dr. Frasier Crane on his radio show, giving a monologue to his audience about {{{subject}}}. \
End the monologue with 'This is {{{name}}} signing off and wishing you good mental health' \
Separate the title, which should be creative, and script in your response. \
Keep your total response under {{charLimit}} characters. Reply in only json with no other text");

    const prompt = locStr({ 
        name: `${name}`,
        subject: `${subject}`,
        charLimit: charLimit
    });


    return { prompt, world, subject, name, voice, location, tokens, model }
}