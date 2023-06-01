import * as THREE from 'three';
import { gsap } from 'gsap';
import { LottieLoader } from 'three/addons/loaders/LottieLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import animationData from './public/intro.json';
import { camBlackTemple, kaclCamRandomzier } from './cams.js';
import { fadeIn, fadeOut, monologue, monologueLength, themeSong, credLength, initIntro, setRenderer, titleFade } from './functions.js';

//  ------------- [ DOM ELEMENTS ] -----------------
const startScreen = document.getElementById('start-screen');
const firstTime = document.getElementById('first-time');
const canvas = document.querySelector('#player');
const creditsDiv = document.querySelector('#credits');
const creditsText = creditsDiv.querySelector('p')
const titleDiv = document.querySelector('#title');
const video = document.getElementById( 'video' );
const question = document.getElementById('question');


let canvasWidth = window.innerWidth * 0.5
let canvasHeight = window.innerHeight * 0.6



//  ------------- [ API GRAB ] -----------------
let episodeData;
let world;

//  ------------- [ ANIM TRIGGERS ] -----------------
let animateActive = true;
let creditsAnimateActive = false;
let animateIntro = true;
let mixer;

//  ------------- [ GLOBAL VARS ] -----------------
let firstRun = true;


//  ------------- [ GLOBAL OBJS ] -----------------
const audioLoader = new THREE.AudioLoader();
const lottieLoader = new LottieLoader();
const clock = new THREE.Clock();



//  ------------- [ SCENES ] -----------------
let intro = new THREE.Scene();
let credits = new THREE.Scene();




//  ------------- [ CAMERAS ] -----------------
const camCredits = new THREE.PerspectiveCamera(50, canvasWidth/canvasHeight, 0.01, 1000);
const camIntro = new THREE.PerspectiveCamera( 50, canvasWidth / canvasHeight, 0.01, 10 );
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
const rendererIntro = new THREE.WebGLRenderer({ canvas:startScreen, antialias: true});
let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
let rendererCredits = new THREE.WebGLRenderer({canvas, antialias: true});


//  ------------- [ MAIN INITIALIZATION ] -----------------

window.addEventListener('DOMContentLoaded', () => {
  mainInit();
});


function mainInit() {
  // ------------- [ INTRO LOTTIE ] ----------------
  const container = document.getElementById('first-time');

  const options = {
    container: container,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    transparent: true,
    animationData: animationData
  };
  lottie.loadAnimation(options);

  setRenderer(canvas, renderer, rendererCredits, canvasWidth, canvasHeight);

  // ------------- [ FIRST RUN CHECK ] -----------------

  
  // Hide player canvas initially
  canvas.style.display = 'none';
  
  question.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      // Hide start screen
      const firstTime = document.getElementById('first-time');
      firstTime.style.display = 'none';
      firstTime.style.opacity = 0;
      question.style.opacity = 0;
      const questionText = question.value;
      question.value = '';
      episode(questionText);
    }
  });
}

  // Add listener for window resizing to adjust size/camera
  window.addEventListener('resize', adjustSize);


//  ------------- [ KACL ANIMATE ] -----------------
function animate() {
    setTimeout( function() {

     requestAnimationFrame(animate);

    const delta = clock.getDelta();
    world.mixer.update( delta );
        
    // depending on the scene, adjust camera behavior for things that need updates (e.g. zooms)
    
    renderer.render(world.scene, world.camera);
    world.camera.updateMatrixWorld();

    }, 1000 / 24 ); 
  };



//  ------------- [ RESIZE ] -----------------
async function adjustSize() {


  canvasWidth = window.innerWidth * 0.5;
  canvasHeight = window.innerHeight * 0.6;
  
  world.camera.aspect = canvasWidth / canvasHeight;
  world.camera.updateProjectionMatrix();
  renderer.setSize(canvasWidth, canvasHeight);
  
  camCredits.aspect = canvasWidth / canvasHeight;
  camCredits.updateProjectionMatrix();
  rendererCredits.setSize(canvasWidth, canvasHeight);
  
  camIntro.aspect = canvasWidth / canvasHeight;
  camIntro.updateProjectionMatrix();
  rendererIntro.setSize( canvasWidth , canvasHeight );

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
  console.log(creditsLength)
  
  // animateActive = false;  //this was previously used to flag the credits had started in order to stop the main animate function, since the credits scene used to use a different canvas/renderer
  
  // tbh not sure if this is needed but why fuck with it
  creditsDiv.style.display = "flex";
  creditsDiv.style.opacity = 1;


  const creditsData = [
    ['Executiver Gamer', 'Executive Producer', 'Assistant Boy', 'Ball Grip', 'Mayo Catering', 'Deviant Scholar', 'Elder Council', 'Dashing Charmer'],
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
  ctl.add(episode, creditsLength + 2);
  
  // Play timline
  ctl.play();
  
  async function chooseCredits(worldType) {
    switch (worldType) {
      case 'creditsDance':
        return new World('credits', 'creditsDance', 'creditsDance');
      case 'creditsFall':
        return new World('credits', 'creditsFall', 'creditsFall');
      default:
        throw new Error(`Unknown world type: ${worldType}`);
    }
  }

  const creditsOptions = ['creditsDance', 'creditsFall'];

  // create credits world
  const creditsChoice = Math.floor(Math.random() * (creditsOptions.length));
  world = await chooseCredits(creditsOptions[creditsChoice]);
  world.createCreditsWorld();
  
}






//  ------------- [ INTRO ANIMATE ] -----------------
async function animLogo() {

    setTimeout( function() {

      requestAnimationFrame( animLogo );

  }, 1000 / 24 );

  rendererIntro.render( intro, camIntro);
  }




//  ------------- [ GET LATEST EP ] -----------------

async function fetchEpisode(questionText) {
  const apiUrl = `https://frasier.muffins.zone/api/gather?questionText=${encodeURIComponent(questionText)}`;
  const themeUrl = `https://frasier.muffins.zone/api/retrieve-audio`;
  console.log(questionText);
  try {
    const response = await fetch(apiUrl, {mode: 'cors'});
    const responseTheme = await fetch(themeUrl, {mode: 'cors'});

    const data = await response.json();
    const themeData = await responseTheme.text();

    console.log(`gptScript: ${data.gptScript}`)
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

//  ------------- [ CLEAR SCENE ] -----------------

async function resetScene() {
  
    // clear Timelines
    ctl.clear();
    ktl.clear();

    startScreen.style.opacity = 1;
    canvas.style.opacity = 0;

    animateActive = true;
    creditsAnimateActive = false;
    animateIntro = true;

    // dispose of scene and recreate
     intro = null;
     world = null;

     intro = new THREE.Scene();
  }


//  ------------- [ EPISODE LOOP ] -----------------

async function episode(questionText) {

  // Set variables if not first run
  // if (firstRun === false) {

  //  await resetScene();

  // };
  
  // Get the latest episode
  episodeData = await fetchEpisode(questionText);

  console.log(`episode data: ${episodeData.script}`);
  

  //world = new World();
  //await world.createWorld();

  // Intro creation
  //wait initIntro(camIntro, lottieLoader, rendererIntro, canvasWidth, canvasHeight, canvas, intro);
  
  //console.log(world)
  // Set first run as complete

  // Show player canvas
  startScreen.style.opacity = 1;
  canvas.style.display = 'flex';
  
  // Get theme song lengt
  //let themeLength = Math.ceil(await themeSong(episodeData.theme, soundKacl, audioLoader));
    //console.log(`theme length: ${themeLength}`);
  
    // Get monologue length
  //let monoLength = Math.ceil(await monologueLength(episodeData.audioBase64)) -0.5;
    //console.log(`monologue length: ${monoLength}`);


  // start intro logo
  //ktl.add(animLogo(), 0.5);

  // fade out intro
  //ktl.add(() => fadeOut(startScreen), `+=${themeLength}` );
  
  // create title card
  ktl.add(() => titleCard(episodeData.title), "+=0");

   // fade in title card
  ktl.add(() => titleFade(titleDiv), "+=2");

  // begin animation
  //ktl.add(() => animate(), "+=6");

   // fade in to kacl studio
   ktl.add(() => fadeIn(canvas), "+=0");

  // start monologue
  //ktl.add(() => monologue(audioLoader, episodeData.audioBase64, soundKacl), "+=0");

 






  // fade out post-monologue
  //ktl.add(() => fadeOut(canvas), `+=${monoLength}`);

  // Play timeline and call credits 2.55s seconds after its over (2.5s on fadeout so cant do it right away)
  // ktl.play().eventCallback("onComplete", () => {

  //     setTimeout(() => {

  //         createCredits();

  //     }, 2650); 

  // });
}


// class World {
//   constructor() {
 
//     this.camera = new THREE.PerspectiveCamera(50, canvasWidth / canvasHeight, 0.01, 5000);

//     this.glLoader = new GLTFLoader();
    
//     this.scene = new THREE.Scene();
    
//     this.mixer = null;
//   }

  // async createCreditsWorld() {

  //   // Load Set
  //   switch (world.location) {
      
  //     case 'creditsFall':
  //       fetch(creditsFall)
  //           .then(response => response.arrayBuffer())
  //           .then(arrayBuffer => {
  //             const glbData = new Uint8Array(arrayBuffer);
  //             this.glLoader.parse(glbData, '', (gltf) => {
          
  //         video.play()
  //         video.loop = true;
  //         video.muted = true;

  //         console.log(gltf.scene)
  //         this.scene.add(gltf.scene);
    
  //         let clip, cone, texture;
    
  //         clip = gltf.animations[0]
    
  //         this.mixer = new THREE.AnimationMixer(gltf.scene);
    
  //         const action = this.mixer.clipAction(clip);
          
  //         action.setLoop(THREE.LoopRepeat);
    
  //         action.play();
    
  //         cone = gltf.scene.children[0].children[0]
    
  //         texture = new THREE.VideoTexture(video);
    
  //         texture.repeat.y = -1;
    
  //         const material = new THREE.MeshStandardMaterial({ map: texture, color: 0x5E1327, emissive: texture, emissiveMap: texture });
          
  //         cone.material = material;
    
  //         cone.material.emissiveIntensity = 3;

  //         this.camera.position.set(0, 6.25 , 0.5);
  //         this.camera.rotation.x = -1.5;

  //         function animateCreds(scene, camera, mixer) {
  //           if (creditsAnimateActive === true) {
  //             requestAnimationFrame(animate)
            
  //             const delta = clock.getDelta();
            
  //             mixer.update( delta );
  //             cone.rotation.y += 0.01;
  //             texture.needsUpdate = true;
  //             renderer.render(scene, camera)
            
  //           } else {

  //             return;

  //           }
          
            
  //         }
          
  //         animateCreds(this.scene, this.camera, this.mixer);
        
  //        });
  //       });

  //         break;

  //        case 'creditsDance':

  //           fetch(creditsDance)
  //           .then(response => response.arrayBuffer())
  //           .then(arrayBuffer => {
  //             const glbData = new Uint8Array(arrayBuffer);
  //             this.glLoader.parse(glbData, '', (creditsDanceGltf) => {
          
  //         this.scene.add(creditsDanceGltf.scene);
  //         console.log(creditsDanceGltf)
    
  //         let clip
    
  //         clip = creditsDanceGltf.animations[33]
    
  //         this.mixer = new THREE.AnimationMixer(creditsDanceGltf.scene);
    
  //         const action = this.mixer.clipAction(clip);
          
  //         action.setLoop(THREE.LoopRepeat);
    
  //         action.play();

  //         this.camera.position.set(-3.1, 0.89 , 1.94);
  //         this.camera.rotation.set(
  //           18.74 * Math.PI / 180,
  //           -67.87 * Math.PI / 180,
  //           17.45 * Math.PI / 180)

  //           creditsDanceGltf.scene.traverse(function (child) {
  //             if (child.isMesh) {
  //               child.material.roughness = 1;
  //             }
  //           });
    
  //           creditsDanceGltf.scene.traverse(function (obj) {
  //             obj.frustumCulled = false;
  //           });

  //         function animateCreds(scene, camera, mixer) {
  //           if (creditsAnimateActive === true) {
  //             requestAnimationFrame(animate)
            
  //             const delta = clock.getDelta();
            
  //             mixer.update( delta );
  //             renderer.render(scene, camera)
            
  //           } else {

  //             return;

  //           }
          
            
  //         }
          
  //         animateCreds(this.scene, this.camera, this.mixer);
        
  //        });
  //       });
  //          break;
  //   }
  // };
  
  

//   async createWorld() {
//     // Adds audio listener to camera
//     this.camera.add(listenerKacl);
  
//     // Load Set
//     fetch(frazSetGlbUrl)
//       .then(response => response.arrayBuffer())
//       .then(arrayBuffer => {
//         const glbData = new Uint8Array(arrayBuffer);
//         this.glLoader.parse(glbData, '', (gltf) => {
//           this.scene.add(gltf.scene);
  
//           const worldSet = gltf.scene;
//           worldSet.position.set(0, 0, 0);
//           kaclCamRandomzier(this.camera, animateActive);
  
//           worldSet.traverse(function (child) {
//             if (child.isMesh) {
//               child.material.roughness = 1;
//             }
//           });
  
//           worldSet.traverse(function (obj) {
//             obj.frustumCulled = false;
//           });
//         });
//       });
  
//     // Add hero model
//     fetch(frazGlbUrl)
//       .then(response => response.arrayBuffer())
//       .then(arrayBuffer => {
//         const glbData = new Uint8Array(arrayBuffer);
//         this.glLoader.parse(glbData, '', (gltf) => {
//           this.scene.add(gltf.scene);
  
//           gltf.scene.position.set(0.061, 0, -0.127);
//           gltf.scene.scale.set(1, 1, 1);
//           gltf.scene.rotation.set(0, -180 * Math.PI / 180, 0);
  
//           const model = gltf.scene;
  
//           model.traverse(function (child) {
//             if (child.isMesh) {
//               child.material.roughness = 1;
//             }
//           });
  
//           model.traverse(function (obj) {
//             obj.frustumCulled = false;
//           });
  
//           this.mixer = new THREE.AnimationMixer(gltf.scene);
//           let clip = gltf.animations[1]; // talk animation
  
//           const action = this.mixer.clipAction(clip);
//           action.setLoop(THREE.LoopRepeat);
//           action.play();
//         });
//       });
//   }
  
// };
