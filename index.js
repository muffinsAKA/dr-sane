import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import animationData from './src/intro.json';
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
const container = document.getElementById('first-time');
const waitingDiv = document.getElementById("waiting");
const border = document.getElementById('border')
const questionDiv = document.getElementById('questionDiv');


let canvasWidth = window.innerWidth * 0.5
let canvasHeight = window.innerHeight * 0.6

//  ------------- [ API GRAB ] -----------------
let episodeData;

//  ------------- [ ANIM TRIGGERS ] -----------------
let animateActive = true;
let creditsAnimateActive = false;

//  ------------- [ GLOBAL VARS ] -----------------
let firstRun = true;
let lottieIntroInstance = null;
let inputCount = 0;
let userName;



//  ------------- [ GLOBAL OBJS ] -----------------
const audioLoader = new THREE.AudioLoader();
const clock = new THREE.Clock();


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
const creditsFall = 'https://muffinsaka.s3.amazonaws.com/3d/creditsFall.glb';
const creditsDance = 'https://muffinsaka.s3.amazonaws.com/3d/creditsDance.glb';


//  ------------- [ RENDERERS ] -----------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });


//  ------------- [ MAIN INITIALIZATION ] -----------------
window.addEventListener('DOMContentLoaded', mainInit);

async function mainInit() {

  setRenderer(canvas, renderer, canvasWidth, canvasHeight);

// Set variables if not first run
if (firstRun) {
  const kaclPromise = createKacl();
  kaclPromise.then((kacl) => {
    animate(kacl.scene, kacl.camera, kacl.mixer, kaclPromise);
    window.addEventListener('resize', () => adjustSize(kacl.camera));
  });
} else if (firstRun === false) {
  await resetScene();
}

  // Hide player canvas initially
  canvas.style.display = 'none';

  // Add event listeners
  

  function handleEnterKey(event) {
    if (event.key === 'Enter') {
      if (inputCount === 0) {
        question.style.opacity = 0;
        inputCount++;
        userName = question.value;
        question.placeholder = '';
  
        setTimeout(() => {
          question.maxLength = 100;
          question.style.opacity = 1;
          question.placeholder = `What's your question, ${userName}?`;
        }, 1500);
  
        question.value = '';
      } else if (inputCount === 1) {
        const questionText = question.value;
        inputCount++;
        question.value = '';
        question.placeholder = '';
        question.style.opacity = 0;
  
        setTimeout(() => {
          waitingDiv.style.opacity = 1;
        }, 500);
  
        episode(questionText);
      }
    }
  }
  
  const handleQuestionFocus = () => {
    console.log('Question focused');
  
    border.style.opacity = 1;
    question.classList.add("fade");
  
    if (inputCount === 0) {
      setTimeout(() => {
        question.placeholder = "What's your name, caller?";
        question.classList.remove("fade");
      }, 1000);
    } else if (inputCount === 1) {
      setTimeout(() => {
        question.placeholder = `What's your question, ${userName}?`;
        question.classList.remove("fade");
      }, 1000);
    } else {
      question.placeholder = '';
      question.classList.add("fade");
      question.style.opacity = 0;
    }
  };
  
  function handleFocusOut() {
    question.classList.add('fade');
    border.style.opacity = 0;
  
    if (inputCount <= 1) {
      setTimeout(() => {
        question.placeholder = "I'm listening.";
        question.classList.remove('fade');
      }, 1000);
    } else if (inputCount > 1) {
      question.placeholder = '';
      question.style.opacity = 0;
      question.classList.add('fade');
    }
  }
  
  function addQuestionEventListeners() {
    question.addEventListener('keydown', handleEnterKey);
    question.addEventListener('focus', handleQuestionFocus);
    question.addEventListener('blur', handleFocusOut);
  }

  addQuestionEventListeners();
  
}

async function resetScene() {
  // Clear timelines
  ctl.clear();
  ktl.clear();

  if (firstTime) {
    firstTime.style.opacity = 0;
    firstTime.style.display = 'none';
  }

  canvas.style.opacity = 0;
  border.style.opacity = 0;
  creditsDiv.style.opacity = 1;
  waitingDiv.style.opacity = 0;

  animateActive = true;
  creditsAnimateActive = false;

  inputCount = 0;
  userName = null;
  episodeData = null;

  creditsText.innerHTML = '';
  titleDiv.innerHTML = ''
  credits = null;
  lottieIntroInstance.destroy();
  lottieIntroInstance = null;
  
  question.style.opacity = 1;
  question.placeholder = "I'm Listening."
  question.blur();
}



function initIntro(theme) {

  const options = {
    container: container,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    transparent: true,
    animationData: animationData
  };

  lottieIntroInstance = lottie.loadAnimation(options);

  firstTime.style.opacity = 1;
  firstTime.style.display = 'flex';

  const audioData = `data:audio/mpeg;base64,${theme}`;

  // Load and play theme
  audioLoader.load(audioData, function (buffer) {
    soundKacl.setBuffer(buffer);
    soundKacl.setLoop(false);
    soundKacl.setVolume(1);
    soundKacl.play();
  });
}

//  ------------- [ RESIZE ] -----------------
async function adjustSize(camera) {


  canvasWidth = window.innerWidth * 0.5;
  canvasHeight = window.innerHeight * 0.6;
  
  renderer.setSize(canvasWidth, canvasHeight);
  
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();

}

async function credTextGen(line1, line2, line3, line4) {
    creditsText.innerHTML = `${line1}       ${line2}<br>${line3}       ${line4}`;
  }

async function titleCard(epTitle) {
    titleDiv.innerHTML = `${epTitle}`;
}


//  ------------- [ CREDITS SEQUENCE ] -----------------

async function createCredits() {

  let creditsLength = await credLength(audioLoader, soundKacl);
  console.log(`creds length: ${creditsLength}`)
  
  // tbh not sure if this is needed but why fuck with it
  creditsDiv.style.display = "flex";
  creditsDiv.style.opacity = 1;


  const creditsData = [
    ['Executiver Gamer', 'Executive Producer', 'Assistant Boy', 'Ball Grip', 'Mayo Catering', 'Deviant Scholar', 'Elder Council', 'Dashing Charmer', 'Cramp Guy', 'Little Baby', 'Grinch', 'Glass Blower'],
    ['MR. MARBLES', 'JOE BIDEN', 'GELSEY KRAMMER', 'MARK', 'MY FATHER-IN-LAW', 'DRACULA', 'TIM APPLE', 'DR. HOMEWORK', 'MYSTERY MAN (GREG)'],
  ]

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
  

  ctl.add(() => fadeIn(canvas), 0.5);

  // fade out after credits
  ctl.add(() => fadeOut(canvas), creditsLength - 3);
  
  // hide credits after final credits have shown
  ctl.add(() => creditsDiv.style.display = "none", creditsLength - 2 );

  // start next episode
  ctl.add(mainInit, creditsLength + 2);
  
  // Play timline
  ctl.play();
  
  const creditsOptions = ['creditsDance', 'creditsFall'];

  // create credits world
  const creditsChoice = Math.floor(Math.random() * (creditsOptions.length));
  const creditsPromise = createCreditsWorld(creditsChoice);
  creditsPromise.then((credits) => {
    animateActive = false;
    creditsAnimateActive = true;
    window.addEventListener('resize', () => adjustSize(credits.camera));
    animateCreds(credits.scene, credits.camera, credits.mixer, credits.texture, credits.cone, creditsPromise);
  });

}


//  ------------- [ GET LATEST EP ] -----------------

async function fetchEpisode(questionText, userName) {
  const apiUrl = `https://frasier.muffins.zone/api/gather?questionText=${encodeURIComponent(questionText)}&userName=${encodeURIComponent(userName)}`;
  const themeUrl = `https://frasier.muffins.zone/api/retrieve-audio`;
  try {
    const response = await fetch(apiUrl);
    const responseTheme = await fetch(themeUrl);

    const data = await response.json();
    const themeData = await responseTheme.text();

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
  } catch (error) {
    console.error(`fetch error:${error}`);
    // Handle error case
  }
}


//  ------------- [ KACL ANIMATE ] -----------------
function animate(scene, camera, mixer, promise) {
  promise.then(() => {
    if (animateActive) {
      setTimeout( function() {
        requestAnimationFrame(() => animate(scene, camera, mixer, promise));
        const delta = clock.getDelta();
        mixer.update( delta );
        renderer.render(scene, camera);
        camera.updateMatrixWorld();
      }, 1000 / 24 ); 
    }
  })
}

//  ------------- [ EPISODE LOOP ] -----------------

async function episode(questionText) {


  // Get the latest episode
  episodeData = await fetchEpisode(questionText, userName);

  waitingDiv.style.opacity = 0;

  // Set first run as complete
  firstRun = false;

  // Show player canvas
  firstTime.style.opacity = 1;
  canvas.style.display = 'flex';
  

  // Get theme song length
  let themeLength = Math.ceil(await themeSong(episodeData.theme, soundKacl, audioLoader));
  console.log(`theme length: ${themeLength}`);
  
    // Get monologue length
  let monoLength = Math.ceil(await monologueLength(episodeData.audio)) -0.5;
  console.log(`monologue length: ${monoLength}`);

  border.style.opacity = 1;

  ktl.add(() => {
    initIntro(episodeData.theme);
  }, 0.5);

  // fade out intro
  ktl.add(() => fadeOut(firstTime), `+=${themeLength - 1}` );
  
  // create title card
  ktl.add(() => titleCard(episodeData.title), "+=0.5");

   // fade in title card
  ktl.add(() => titleFade(titleDiv), "+=2");

  // begin animation
  ktl.add(() => animate(kacl.scene, kacl.camera, kacl.mixer), "+=5");

   // fade in to kacl studio
   ktl.add(() => fadeIn(canvas), "+=0");

  // start monologue
  ktl.add(() => monologue(audioLoader, episodeData.audio, soundKacl), "+=0");

 
  // fade out post-monologue
  ktl.add(() => fadeOut(canvas), `+=${monoLength}`);

  // Play timeline and call credits 2.55s seconds after its over (2.5s on fadeout so cant do it right away)
  ktl.play().eventCallback("onComplete", () => {

      setTimeout(() => {

        createCredits();

      }, 2550); 

  });
}

function animateCreds(scene, camera, mixer, texture, cone, creditsPromise) {
  if (creditsAnimateActive === true) {
    creditsPromise.then(() => {
    requestAnimationFrame(animateCreds);

    const delta = clock.getDelta();
    
    mixer.update(delta);

    if (cone) {
      cone.rotation.y += 0.01;
    }

    if (texture) {
      texture.needsUpdate = true;
    }

    renderer.render(scene, camera);
    })
  }
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
        kaclCamRandomzier(kaclCamera, animateActive);

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

            window.addEventListener('resize', () => adjustSize(kaclCamera));

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

    creditsGLloader.load(`${creditsFall}`, (gltf) => {
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
        `${creditsDance}`,
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
  };