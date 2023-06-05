import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import animationData from './src/intro.json';
import lottie from 'lottie-web';
import { kaclCamRandomzier } from './cams.js';
import { fadeIn, fadeOut, monologue, monologueLength, themeSong, credLength, setRenderer, titleFade } from './functions.js';



//  ------------- [ DOM ELEMENTS ] -----------------
const firstTime = document.getElementById('first-time');
const canvas = document.querySelector('#player');
const creditsDiv = document.querySelector('#credits');
const creditsText = creditsDiv.querySelector('p')
const titleDiv = document.querySelector('#title');
const video = document.getElementById( 'video' );
const  question = document.getElementById('question');
const waitingDiv = document.getElementById("waiting");
const modWarning = document.getElementById('mod');
const chars = document.getElementById('chars');
const blocker = document.getElementById('blocker');
const xButton = document.getElementById('x-button');
const statsDiv = document.getElementById('stats')

let canvasWidth = window.innerWidth * 0.5
let canvasHeight = window.innerHeight * 0.6

//  ------------- [ GLOBAL VARS ] -----------------
let firstRun = true;
let delta;

let userInfo = {
  user: null,
  question: null
}


//  ------------- [ GLOBAL OBJS ] -----------------
const audioLoader = new THREE.AudioLoader();
let clock = new THREE.Clock();


//  ------------- [ CAMERAS ] -----------------
//const controls = new OrbitControls(camera, canvas);


//  ------------- [ AUDIO ] -----------------
const listenerKacl = new THREE.AudioListener();
const soundKacl = new THREE.Audio( listenerKacl );


//  ------------- [ TIMELINES ] -----------------

// Create credits timeline
const ctl = gsap.timeline();

// Create kacl timeline
const ktl = gsap.timeline();


//  ------------- [ DIRECTORIES ] -----------------
const frazGlbUrl = 'https://muffinsaka.s3.amazonaws.com/3d/fraz.glb';
const frazSetGlbUrl = 'https://muffinsaka.s3.amazonaws.com/3d/kacl.glb';
const creditsFallUrl = 'https://muffinsaka.s3.amazonaws.com/3d/creditsFall.glb';
const creditsDanceUrl = 'https://muffinsaka.s3.amazonaws.com/3d/creditsDance.glb';

//  ------------- [ RENDERERS ] -----------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

let current = {
  scene: null,
  camera: null,
  mixer: null,
  texture: null,
  cone: null,
  sceneName: null
};

let kacl = {
  scene: null,
  camera: null,
  mixer: null,
  sceneName: 'kacl'
};

let creditsFall = {
  scene: null,
  camera: null,
  mixer: null,
  texture: null,
  cone: null,
  sceneName: 'creditsFall'
};

let creditsDance = {
  scene: null,
  camera: null,
  mixer: null,
  sceneName: 'creditsDance'
};

function switchScene(newScene, newCamera, newMixer, sceneName, texture, cone) {
  
  console.log(`[ SWITCHING ] => : ${sceneName} from ${current.sceneName}`);

  current.scene = newScene;
  current.camera = newCamera;
  current.mixer = newMixer;
  current.sceneName = sceneName;
  current.texture = texture;
  current.cone = cone;

  console.log(` ---[ SWITCHING INFO ]---`)
  console.dir(`< Switched Scene > ${newScene}`);
  console.dir(`< Switched Camera >: ${newCamera}`);
  console.dir(`< Switched Mixer >: ${newMixer}`);
  console.log(`< Switched Name >: ${sceneName}`);

  console.log(` ---[ CURRENT INFO ]---`)
  console.dir(`[ Current Scene ]: ${current.scene}`);
  console.dir(`[ Current Camera ]: ${current.camera}`);
  console.dir(`[ Current Mixer ]: ${current.mixer}`);
  console.log(`[ Current Name ]: ${current.sceneName}`);


}

xButton.addEventListener('click', () => {
  statsDiv.style.opacity =  0;
});

const usageStats = {
  async getStats() {
    const apiUrl = 'https://dr-sane-git-testing-muffins.vercel.app/api/usage'
    const response = await fetch(apiUrl);
    const stats = await response.json();

    stats.characterLimit = stats.characterLimit.toLocaleString();
    stats.charactersUsed = stats.charactersUsed.toLocaleString();

    chars.textContent = `${stats.charactersUsed} / ${stats.characterLimit}`;

  }
}

usageStats.getStats()

const inputState = {
  count: 0,

  handleEnterKey(event) {
  
    if (event.key === 'Enter') {
      if (inputState.count === 0) {
  
        question.style.opacity = 0;
        inputState.count++;
        userInfo.user = question.value;
        question.placeholder = '';
  
        setTimeout(() => {
          question.maxLength = 100;
          question.style.opacity = 1;
          question.placeholder = `What's your question, ${userInfo.user}?`;
        }, 1500);
  
        question.value = '';
  
      } else if (inputState.count === 1) {
  
        userInfo.question  = question.value;
        inputState.count++;
        question.value = '';
        question.placeholder = '';
        question.style.opacity = 0;
        question.style.display = 'none';
  
        setTimeout(() => {
          waitingDiv.style.opacity = 1;
  
        }, 500);
        
        
        episode(userInfo.question, userInfo.user);
  
      }
    }
  },

  handleQuestionFocus() {

    canvas.style.border = '2px solid #111111';
    question.classList.add("fade");
  
    if (inputState.count === 0) {
      setTimeout(() => {
        question.placeholder = "What's your name, caller?";
        question.classList.remove("fade");
      }, 1000);
    } else if (inputState.count === 1) {
      setTimeout(() => {
        question.placeholder = `What's your question, ${userInfo.user}?`;
        question.classList.remove("fade");
      }, 1000);
    } else {
      question.placeholder = '';
      question.classList.add("fade");
      question.style.opacity = 0;
    }
  },

  handleFocusOut() {
    question.classList.add('fade');
    canvas.style.border = 'none';
  
    if (inputState.count <= 1) {
      setTimeout(() => {
        question.placeholder = "I'm listening.";
        question.classList.remove('fade');
      }, 1000);
    } else if (inputState.count > 1) {
      question.placeholder = '';
      question.style.opacity = 0;
      question.classList.add('fade');
    }
  },
  
  addQuestionEventListeners() {
    question.addEventListener('keydown', this.handleEnterKey);
    question.addEventListener('focus', this.handleQuestionFocus);
    question.addEventListener('blur', this.handleFocusOut);
  },
  
  removeQuestionEventListeners() {
    question.removeEventListener('keydown', this.handleEnterKey);
    question.removeEventListener('focus', this.handleQuestionFocus);
    question.removeEventListener('blur', this.handleFocusOut);
  }

}





//  ------------- [ MAIN INITIALIZATION ] -----------------
window.addEventListener('DOMContentLoaded', mainInit);
window.addEventListener('resize', adjustSize);

async function mainInit(flagged) {

  if (firstRun === true) {
  setRenderer(canvas, renderer, canvasWidth, canvasHeight);
  }



 if (firstRun === false || flagged === 'flagged') {
    

    await resetScene();

  }

  if (flagged === 'flagged') {
    
    waitingDiv.style.opacity = 0;
    modWarning.style.display = 'flex'
    modWarning.style.opacity = 1;
    

    setTimeout(() => {

      modWarning.style.opacity = 0;
      
      setTimeout(() => {
        modWarning.style.display = 'none'
      }, 10000)

    }, 8000)
    
    

  }

  // Hide player canvas initially
  canvas.style.display = 'block';

  
  // Add event listeners
  inputState.addQuestionEventListeners();
  
}

function resetScene() {
  return new Promise((resolve) => {
  
    inputState.removeQuestionEventListeners();

    // Clear timelines
    ctl.clear();
    ktl.clear();

      firstTime.style.opacity = 0;
      firstTime.style.display = 'flex';


    canvas.style.border = 'none';
    creditsDiv.style.opacity = 1;

    waitingDiv.style.opacity = 0;

    setTimeout(() => {


    inputState.count = 0;

    creditsText.innerHTML = '';
    titleDiv.innerHTML = ''

    question.style.display = 'inline-block';
    question.style.opacity = 1;
    question.placeholder = "I'm Listening.";
    question.classList.remove('fade');

    blocker.style.opacity = 1;
  
    clock = null;
    clock = new THREE.Clock();
    delta = null;

    console.log(`Current Scene (should be Credits): ${current.sceneName}`);

  resolve();
}, 1000)
  });
}


const intro = {

  lottieOptions: {
      container: firstTime,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      transparent: true,
      animationData: animationData
    },

    introLottie: null,
    

  initIntroLottie() {

    this.introLottie = lottie.loadAnimation(this.lottieOptions)

    firstTime.style.opacity = 1;
    firstTime.style.display = 'flex';
  
  },

  initIntroTheme(theme) {
    const audioData = `data:audio/mpeg;base64,${theme}`;
  
    // Load and play theme
    audioLoader.load(audioData, function (buffer) {
      soundKacl.setBuffer(buffer);
      soundKacl.setLoop(false);
      soundKacl.setVolume(1);
      soundKacl.play();
    });
  }
}



//  ------------- [ RESIZE ] -----------------
async function adjustSize() {


  canvasWidth = window.innerWidth * 0.5;
  canvasHeight = window.innerHeight * 0.6;

  renderer.setSize(canvasWidth, canvasHeight);
  
  current.camera.aspect = canvasWidth / canvasHeight;
  current.camera.updateProjectionMatrix();

}

async function credTextGen(line1, line2, line3, line4) {
    creditsText.innerHTML = `${line1}       ${line2}<br>${line3}       ${line4}`;
  }

async function titleCard(epTitle) {
    titleDiv.innerHTML = `${epTitle}`;
}


//  ------------- [ GET LATEST EP ] -----------------

async function fetchEpisode(questionText, userName) {
  const apiUrl = `https://frasier.muffins.zone/api/gather?questionText=${encodeURIComponent(questionText)}&userName=${encodeURIComponent(userName)}`;
  const themeUrl = `https://frasier.muffins.zone/api/retrieve-audio`;
  
  if (firstRun === false) {
    console.log(`fetchEpisode() round 2 starting - Line 396`);
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log(`data in fetchEpisode: ${data}`)

    switch (data) {
      case 'flagged':
      
      return 'flagged'

      default:
        const responseTheme = await fetch(themeUrl);
        const themeData = await responseTheme.text();

        if (firstRun === false) {
          console.log(`fetchEpisode() successfully API'd Round 2 - Line 404`);
        }

        return {
          title: data.gptTitle,
          script: data.gptScript,
          audio: data.audioBase64,
          theme: themeData,
          voice: data.voice,
          world: 'fraz',
          model: data.model,
          location: data.location,
        };
    }
  } catch (error) {
    console.error(`fetch error: ${error}`);
  }
}


//  ------------- [ KACL ANIMATE ] -----------------
function animate() {

    setTimeout(function () {
      requestAnimationFrame(animate);
      
      delta = clock.getDelta();
      
      current.mixer.update(delta);

      if (current.cone) {
        current.cone.rotation.y += 0.01;
      }
  
      if (current.texture) {
        current.texture.needsUpdate = true;
      }

      renderer.render(current.scene, current.camera);
      current.camera.updateMatrixWorld();
    }, 1000 / 60);
  }
//  ------------- [ EPISODE LOOP ] -----------------

async function episode(questionText, userName) {


  if (firstRun === false) {
    console.log(`episode() Successfully Started - Line 458`);

  }

  if (firstRun === true) {

    createKacl()
    .then((kaclTemp) => {
      current.scene = kaclTemp.scene;
      current.camera = kaclTemp.camera;
      current.mixer = kaclTemp.mixer;
      current.sceneName = 'kacl';
      
      kacl.scene = kaclTemp.scene;
      kacl.camera = kaclTemp.camera;
      kacl.mixer = kaclTemp.mixer;

      kaclCamRandomzier(current.camera);
      animate();
    });
    
  
    createCreditsWorld('creditsFall')
    .then((creditsFallTemp) => {
      creditsFall.scene = creditsFallTemp.scene;
      creditsFall.camera = creditsFallTemp.camera;
      creditsFall.mixer = creditsFallTemp.mixer;
      creditsFall.texture = creditsFallTemp.texture;
      creditsFall.cone = creditsFallTemp.cone;
    });
      
    createCreditsWorld('creditsDance')
    .then((creditsDanceTemp) => {
      creditsDance.scene = creditsDanceTemp.scene;
      creditsDance.camera = creditsDanceTemp.camera;
      creditsDance.mixer = creditsDanceTemp.mixer;
    });

  } else if (firstRun === false) {
   
    console.log(`First Run = False -> Switching to kacl`);

    switchScene(kacl.scene, kacl.camera, kacl.mixer, 'kacl', null, null);
    //kaclCamRandomzier(kacl.camera);
        
    console.log(`Is this kacl?`);

  }

  if (firstRun === false) {
    console.log(`Starting episode() Round 2 - Line 210`);
  }

   // Get the latest episode
  const episodeData = await fetchEpisode(questionText, userName);

  if (episodeData === 'flagged') {
    console.log(`episodeData in if episodeData: ${episodeData}`)
    mainInit('flagged');
    return;
  }

  waitingDiv.style.opacity = 0;

  // Show player canvas
  firstTime.style.opacity = 1;
  canvas.style.display = 'flex';
 
  

  // Get theme song length
  let themeLength = Math.ceil(await themeSong(episodeData.theme, soundKacl, audioLoader));
  if (firstRun === false) {
    console.log(`themelength round 2 - Line 474: ${themeLength}`);
  }
  
    // Get monologue length
  let monoLength = Math.ceil(await monologueLength(episodeData.audio)) -0.5;

  if (firstRun === false) {
    console.log(`monoLength round 2 - Line 481: ${monoLength}`);
  }
  

  canvas.style.border = '2px solid #111111';

  if (firstRun === true) {
    
    console.log(`---[ FIRST RUN KACL ]---`)

    console.log(`Current Scene: ${current.scene}`);
    console.log(`Current Camera: ${current.camera}`);
    console.log(`Current Mixer: ${current.mixer}`);
  }

  ktl.add(() => {

    intro.initIntroTheme(episodeData.theme);

  }, 0);

  if (firstRun === true) {
  
    ktl.add(() => {
      intro.initIntroLottie();
    },'+=0.1');

} else if (firstRun === false) {

  ktl.add(() => {
    intro.introLottie.goToAndPlay(0, true);
  }, '+=0.1')
}

  // fade out intro
  ktl.add(() => fadeOut(firstTime), `+=${themeLength - 1}` );
  
  // create title card
  ktl.add(() => titleCard(episodeData.title), "+=0.5");

   // fade in title card
  ktl.add(() => titleFade(titleDiv), "+=2");


   // fade in to kacl studio
   ktl.add(() => fadeOut(blocker), "+=5");

  // start monologue
  ktl.add(() => monologue(audioLoader, episodeData.audio, soundKacl), "+=0");

 
  // fade out post-monologue
  ktl.add(() => fadeIn(blocker), `+=${monoLength}`);

  // Play timeline and call credits 2.55s seconds after its over (2.5s on fadeout so cant do it right away)
  ktl.play().eventCallback("onComplete", () => {

      setTimeout(() => {

        createCredits();

      }, 2550); 

  });
}




//  ------------- [ CREDITS SEQUENCE ] -----------------

async function createCredits() {

  let creditsLength = await credLength(audioLoader, soundKacl);

  if (firstRun === false) {
    console.log(`creditsLength round 2 - Line 553: ${creditsLength}`);
  }
  

  console.log(creditsLength);
  
  // tbh not sure if this is needed but why fuck with it
  creditsDiv.style.display = "flex";
  creditsDiv.style.opacity = 1;


  const creditsData = [
    ['Executiver Gamer', 'Executive Producer', 'Assistant Boy', 'Ball Grip', 'Mayo Catering', 'Deviant Scholar', 'Elder Council',
    'Dashing Charmer', 'Cramp Guy', 'Little Baby', 'Grinch', 'Glass Blower', 'Knower', 'Last Guy', 'First Being', 'Fake Friend', 'Defiant One',
    'Shamed Outcast', 'Defias Pillager', 'Script Eater', 'Code Sucker', "Director's Nephew", 'Ford F150', 'Terrible', 'Major Problem', 'Cutie Patootie',
    "Friend of Daryl", 'Sound Hearer', 'Voice of Reason', 'Fact Ignorer', 'Hair But Not Makeup', 'Wardrobe Malfuncter', 'Haunting Spectre', 'Communist',
    "Hideo Kojima", "Food Finder", "Tantrum Haver", "Favorite Daughter", "Bestest Boy", "Relisher of Fools", "Knob Turner", "Mop", "Assistant Associate",
    "Feral Hog", "Tome Scribe", "Executive Grump", "Disappointed Father", "Therapist's Therapist", "Popup Closer", "Crypto Jester", "Salt of the Earth",
    "Security Baton", "Second Hand", "Wife's Mistress", "Resident Bisexual", "Premiere Crasher", "Plugin Downloader", "Imaginary Friend", "Passing Thought",
    "Master Unlocker", "Movie Buff", "Scam Artist", "Belaborer", "Loverboy", "Head Shrimp", "Gone & Forgotten"  ],

    ['MR. MARBLES', 'GELSEY KRAMMER', 'BIG JERRY', 'MARK', 'MY FATHER-IN-LAW', 'DRACULA', "BLINK-182", "NVIDIA", "VYVANSE", "PHOEBE BRIDGERS", "QUESTLOVE",
    'GEOFF KEIGHLEY', 'DR. HOMEWORK', 'MYSTERY MAN (GREG)', 'JIMMY CHEAPSKATES', 'TREE BEING', 'MRS. GRIMBLE', 'ERICA HORSE', 'COMPUTER #2', "GUMBY",
    "RACECAR STEVENS", "JOHN?", "KARDASHIAN #772", "TERRY TUESDAY", "JEFF GERSTMANN", "SWIFTIES", "LOUIS COLE", "YVETTE YOUNG", "MAGNUS", "JACK BLACK",
    "SOMEHOW MARKIPLIER", "JOE PERA", "TIM ROBINSON", "CONNOR O'MALLEY", "THE REAL GRINCH", "ELUNE", "THE BOYS", "THE GIRLS", "THE POPE", "THE PRESIDENT",
    "JERRY FINN", "/R/FRASIER", "JACK SHEPARD", "JOHN LOCKE", "BRITTANY/BRITNEY", "CALL OF DUTY", "THE DARK TRAVELER", "PARK RANGER ED", "RED GREEN", "NYC SUBWAY",
    "KIRBY", "ZELDA", "EMILY HAINES", "MY RHEUMATOLOGIST", "ECHOES OF THE PAST", "Q", "MELISSA SHORTJEANS", "LIMP BIZKIT", "THE THIRD DIMENSION",
    "THE SUN", "LOUD NEIGHBORS", "BLENDER", "LEORGE GUCAS", "THE LAST STRAW", "MCDONALDS BIG MAC", "MY HATERS", "GAMERS", "BATHTUB GERALT", "WARIO64",
    "FURRIES", "MOUNTAIN DEW", "JEFF OVERWATCH", "GOBLIN BOY"]
  ];

  function getRandomCredit(type) {
           
    if (type === 'title') {
      
      const randomTitle = Math.floor(Math.random() * (creditsData[0].length - 1));
      return creditsData[0][randomTitle];

    } else if (type === 'person') {

      const randomName = Math.floor(Math.random() * (creditsData[1].length - 1));      
      return creditsData[1][randomName];
    }
  }
  // add credits to timeline

  const numberOfCredits = Math.floor(creditsLength/2.5 - 1)

  for (let i = 0.5; i <= numberOfCredits; i++) {

   const ctlTime = i * 2.5;

   ctl.add(() => {

    const title1 = getRandomCredit('title');
    const name1 = getRandomCredit('person');
    const title2 = getRandomCredit('title');
    const name2 = getRandomCredit('person');
    
    credTextGen(title1, name1, title2, name2); 
  
  }, ctlTime)

  }
  
  const creditsOptions = ['creditsDance', 'creditsFall'];

  const creditsChoice = creditsOptions[Math.floor(Math.random() * creditsOptions.length)];

  ctl.add(() => fadeOut(blocker), 0.5);

  // fade out after credits
  ctl.add(() => fadeIn(blocker), creditsLength - 3);
  
  // hide credits after final credits have shown
  ctl.add(() => creditsDiv.style.display = "none", creditsLength - 2 );

  // start next episode
  ctl.add(mainInit, creditsLength + 2);

  
  // Play timline
  ctl.play();
  
  firstRun = false;

  // create credits world
  createCreditsWorld(creditsChoice)
  .then((credits) => {

    if (creditsChoice === 'creditsDance') {
      switchScene(credits.scene, credits.camera, credits.mixer, 'creditsDance', null, null);

    } else if (creditsChoice === 'creditsFall') {
      switchScene(credits.scene, credits.camera, credits.mixer, 'creditsFall', credits.texture, credits.cone);

    }
  })
  .catch((error) => {
    console.error(error);
  });

}


async function createKacl() {
  return new Promise((resolve, reject) => {
    // Adds audio listener to camera
    const kaclCamera = new THREE.PerspectiveCamera(50, canvasWidth / canvasHeight, 0.01, 5000);

    const kaclGLloader = new GLTFLoader();

    const kaclScene = new THREE.Scene();

    // Load Set
    kaclGLloader.load(
      `${frazSetGlbUrl}`,
      (gltf) => {
        kaclScene.add(gltf.scene);

        const worldSet = gltf.scene;

        worldSet.position.set(0, 0, 0);

        worldSet.traverse(function (child) {
          if (child.isMesh) {
            child.material.roughness = 1;
          }
        });

        worldSet.traverse(function (obj) {
          obj.frustumCulled = false;
        });

        // Add hero model
        kaclGLloader.load(
          `${frazGlbUrl}`,
          (gltf) => {
            kaclScene.add(gltf.scene);

            gltf.scene.position.set(0.061, 0, -0.127);
            gltf.scene.scale.set(1, 1, 1);
            gltf.scene.rotation.set(0, -180 * Math.PI / 180, 0);

            const model = gltf.scene;

            model.traverse(function (child) {
              if (child.isMesh) {
                child.material.roughness = 1;
              }
            });

            model.traverse(function (obj) {
              obj.frustumCulled = false;
            });

            const mixer = new THREE.AnimationMixer(gltf.scene);
            let clip = gltf.animations[1]; // talk animation
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            action.play();

            resolve({
              scene: kaclScene,
              camera: kaclCamera,
              mixer: mixer,
            });
          },
          undefined,
          function (error) {
            console.error(error);
            reject(error);
          }
        );
      },
      undefined,
      function (error) {
        console.error(error);
        reject(error);
      }
    );
  });
}


async function createCreditsWorld(location) {

  return new Promise((resolve, reject) => {

  const creditsCamera = new THREE.PerspectiveCamera(50, canvasWidth / canvasHeight, 0.01, 5000);
  
  const creditsGLloader = new GLTFLoader();

  const creditsScene = new THREE.Scene();

// Load Set
switch (location) {
  case 'creditsFall':

    video.play();
    video.loop = true;
    video.muted = true;

    creditsGLloader.load(`${creditsFallUrl}`, (gltf) => {
    creditsScene.add(gltf.scene);

      let clip = gltf.animations[0];

      const mixer = new THREE.AnimationMixer(gltf.scene);

      const action = mixer.clipAction(clip);

      action.setLoop(THREE.LoopRepeat);

      action.play();

      const cone = gltf.scene.children[0].children[0];

      const texture = new THREE.VideoTexture(video);

      texture.repeat.y = -1;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0x5E1327,
        emissive: texture,
        emissiveMap: texture,
      });

      cone.material = material;

      cone.material.emissiveIntensity = 3;

      creditsCamera.position.set(0, 6.25, 0.5);
      creditsCamera.rotation.x = -1.5;

      resolve({
        scene: creditsScene,
        camera: creditsCamera,
        mixer: mixer,
        texture: texture,
        cone: cone
      });
    },
    undefined,
    (error) => {
      console.error(error);
      reject(error);
    });

    break;

    case 'creditsDance':

       creditsGLloader.load(
        `${creditsDanceUrl}`,
        (creditsDanceGltf) => {
        
        creditsScene.add(creditsDanceGltf.scene);
  
        let clip = creditsDanceGltf.animations[33]
  
        const mixer = new THREE.AnimationMixer(creditsDanceGltf.scene);
  
        const action = mixer.clipAction(clip);
        
        action.setLoop(THREE.LoopRepeat);
  
        action.play();

        creditsCamera.position.set(-3.1, 0.89 , 1.94);
        creditsCamera.rotation.set(
          18.74 * Math.PI / 180,
          -67.87 * Math.PI / 180,
          17.45 * Math.PI / 180)

          creditsDanceGltf.scene.traverse(function (child) {
            if (child.isMesh) {
              child.material.roughness = 1;
            }
          });
  
          creditsDanceGltf.scene.traverse(function (obj) {
            obj.frustumCulled = false;
          });

          resolve({
            scene: creditsScene,
            camera: creditsCamera,
            mixer: mixer
          });
        },
        undefined,
        (error) => {
          console.error(error);
          reject(error);
        }
      );
        break;
      }
    });
  }