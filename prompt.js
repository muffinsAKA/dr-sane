import Handlebars from 'handlebars';
import fs from 'fs';

const tokens = 300
const charLimit = tokens * 2.25

const nounFile = fs.readFileSync('./res/nounlist.txt', 'utf-8');
const subjectList = nounFile.split('\n');

// let subjectList = [
//     'gamers',
//     'dogs',
//     'retired pizza delivery guys'
// ];


let personList = [
    ['frasier', 'Dr. Frasier Crane'],
    ['niles', 'Dr. Niles Crane, Frasier\'s brother,'],
    ['lillith', 'Lilith, Frasier\'s ex-wife,'],
    ['martin', 'Martin Crane, Frasier\'s father,']
];

// let whileAlsoList = [
//     'running from a giant boulder',
//     'discovering a lost mine',
//     'playing World of Warcraft',
//     'transforming into a supernova',
//     'auditioning to replace Vanessa Carlton',
//     'barbecueing a dinosaur from the Flintstones',
//     'changing his own diaper',
//     'downloading an illegal copy of minecraft',
//     'burning a candle at both ends',
//     'taking the SATs',
//     'rebuilding the pyramids',

// ];

export async function randomArray(array) {

  let selection;
  let npc;

  const randomEntry = Math.floor(Math.random() * array.length);

  const frasierWeight = Math.floor(Math.random() * 10);

  if (array === personList) {

    selection = array[randomEntry][1];  
    npc = array[randomEntry][0];  
  
  } else {

    selection = array[randomEntry];

  }

  
  // if the array is personList, check the frasierWeight variable to decide if a non-Frasier character will appear
  if (array === personList) {

    if (frasierWeight >= 7) {
        
        return { selection, npc }
    
    } else {
    
        selection = array[0][1];
        npc = array[0][0];

        return { selection, npc };

    }

  } else {

    return selection;

    }
  
};

export async function promptGen() {
    const subject = await randomArray(subjectList);
    const person = await randomArray(personList);

    const defaultStr = Handlebars.compile(
        'Pretend to be {{{person}}} on his radio show giving a monologue to his audience about {{{subject}}}. \
End the monologue with "This is Dr. Frasier Crane signing off and wishing you good mental health." \
Separate the title and script in your response into two sections, named respectively Title and Script. \
Keep your total response under {{charLimit}} characters.');

    const prompt = defaultStr({ 
        person: `${person.selection}`,
        subject: `${subject}`,
        charLimit: charLimit
    });

    console.log('charLimit:' + charLimit)

    const npc = person.npc;

    return {npc, prompt, tokens}
    
}

