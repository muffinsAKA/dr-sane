import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader';
import { gsap } from 'gsap';
import { LottieLoader } from 'three/addons/loaders/LottieLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import animationData from './src/intro.json';
import { camKaclFront, camKaclTopDown, camBlackTemple } from './src/cams.js';
import { fadeIn, fadeOut, monologue, monologueLength, themeSong, credLength, initIntro, setRenderer, titleFade } from './src/functions.js';

//import { TextGeometry } from 'three/addons/geometries/TextGeometry';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
//import { ShaderPass } from 'three/addons/postprocessing/ShaderPass'
//import { RenderPass } from 'three/addons/postprocessing/RenderPass';
//import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader'

//  ------------- [ DOM ELEMENTS ] -----------------
const startScreen = document.getElementById('start-screen');
const firstTime = document.getElementById('first-time');
const canvas = document.querySelector('#player');
const creditsDiv = document.querySelector('#credits');
const creditsText = creditsDiv.querySelector('p')
const titleDiv = document.querySelector('#title');


let canvasWidth = window.innerWidth * 0.6
let canvasHeight = window.innerHeight * 0.6



//  ------------- [ API GRAB ] -----------------
let episodeData;
let world;

//  ------------- [ ANIM TRIGGERS ] -----------------
let animateActive = true;
let creditsAnimateActive = false;
let mixer;

//  ------------- [ GLOBAL VARS ] -----------------
let firstRun = true;


//  ------------- [ GLOBAL OBJS ] -----------------
const audioLoader = new THREE.AudioLoader();
const fontLoader = new FontLoader();
const lottieLoader = new LottieLoader();
const clock = new THREE.Clock();



//  ------------- [ SCENES ] -----------------
const intro = new THREE.Scene();
let credits = new THREE.Scene();




//  ------------- [ CAMERAS ] -----------------
const camCredits = new THREE.PerspectiveCamera(50, canvasWidth/canvasHeight, 0.01, 1000);
const camera = new THREE.PerspectiveCamera(50, canvasWidth/canvasHeight, 0.01, 5000);
const camIntro = new THREE.PerspectiveCamera( 50, canvasWidth / canvasHeight, 0.01, 10 );
//const controls = new OrbitControls(camera, canvas);


//  ------------- [ AUDIO ] -----------------
const listenerCreds = new THREE.AudioListener();
const listenerKacl = new THREE.AudioListener();
  
const soundCreds = new THREE.Audio( listenerCreds );
const soundKacl = new THREE.Audio( listenerKacl );

// Adds audio listener to camera
camCredits.add( listenerCreds );
camera.add( listenerKacl );


//  ------------- [ TIMELINES ] -----------------

// Create credits timeline
const ctl = gsap.timeline();

// Create kacl timeline
const ktl = gsap.timeline();


//  ------------- [ DIRECTORIES ] -----------------
const baseWorldsDir = './res/3d/worlds/'
const wowWorldDir = './res/3d/worlds/wow';
const frasierWorldDir = './res/3d/worlds/frasier';
const themesDir = './audio/themes/';


//  ------------- [ RENDERERS ] -----------------
const rendererIntro = new THREE.WebGLRenderer({ canvas:startScreen, antialias: true});
let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
let rendererCredits = new THREE.WebGLRenderer({canvas, antialias: true});


//  ------------- [ MAIN INITIALIZATION ] -----------------

mainInit();


function mainInit() {

    //  ------------- [ INTRO LOTTIE ] ----------------
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

 
  //  ------------- [ FIRST RUN CHECK ] -----------------

  if (firstRun == true) {
    
    // Hide player canvas initially
    canvas.style.display = 'none';
    
    // Add event listener to start screen
    firstTime.addEventListener('click', () => {
      
      // Hide start screen
      firstTime.style.display = 'none';
      firstTime.style.opacity = 0;
      
      episode();

    })

   } else {

    episode();

   }
  }

  // Add listener for window resizing to adjust size/camera
  window.addEventListener('resize', adjustSize);


//  ------------- [ KACL ANIMATE ] -----------------
function animate() {
  if (animateActive) {
    setTimeout( function() {

     requestAnimationFrame(animate);

    //controls.update();

    const delta = clock.getDelta();
    world.mixer.update( delta );
    
    
    // depending on the scene, adjust camera behavior for things that need updates (e.g. zooms)
    switch (world.location)  {
  
      case 'blacktemple':
      
      if (camera.position.x >= 1.25) {

          camera.position.x -= 0.0025;
        }
        
         break;
    }
    
    renderer.render(world.scene, camera);
    camera.updateMatrixWorld();

    }, 1000 / 24 ); 
  }
}



//  ------------- [ RESIZE ] -----------------
async function adjustSize() {


  canvasWidth = window.innerWidth * 0.6;
  canvasHeight = window.innerHeight * 0.6;
  
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
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

console.log(creditsText.innerHTML)
//  ------------- [ CREDITS SEQUENCE ] -----------------

async function createCredits() {

  let creditsLength = await credLength(audioLoader, soundCreds);
  
  // Start credits animation loop
  //animateActive = false;
  creditsDiv.style.display = "flex";
  creditsDiv.style.opacity = 1;

  ctl.add(() => credTextGen('Executive Producer', 'KELPY GRAMPER', 'Huge Assistant', 'SPERN TANTLY' ), 0);
  ctl.add(() => credTextGen('Gun Remover', 'PINTUS BLONT', 'Spindle Wombler', 'CARDUS WINDERTON'), "+=2.5");
  ctl.add(() => credTextGen('Executive Producer', 'KELPY GRAMPER', 'Huge Assistant', 'SPERN TANTLY' ), "+=2.5");
  ctl.add(() => credTextGen('Gun Remover', 'PINTUS BLONT', 'Spindle Wombler', 'CARDUS WINDERTON'), "+=2.5");
  ctl.add(() => credTextGen('Executive Producer', 'KELPY GRAMPER', 'Huge Assistant', 'SPERN TANTLY' ), "+=2.5");
  ctl.add(() => credTextGen('Gun Remover', 'PINTUS BLONT', 'Spindle Wombler', 'CARDUS WINDERTON'), "+=2.5");
  ctl.add(() => credTextGen('Executive Producer', 'KELPY GRAMPER', 'Huge Assistant', 'SPERN TANTLY' ), "+=2.5");
  ctl.add(() => credTextGen('Gun Remover', 'PINTUS BLONT', 'Spindle Wombler', 'CARDUS WINDERTON'), "+=2.5");
  ctl.add(() => credTextGen('Executive Producer', 'KELPY GRAMPER', 'Huge Assistant', 'SPERN TANTLY' ), "+=2.5");
;
  
  ctl.add(() => fadeOut(canvas), creditsLength - 2);
  ctl.add(episode, creditsLength + 3);

  ctl.add(() => creditsDiv.style.display = "none", creditsLength - 2 );
  
  // Play timline
  ctl.play();
  
  fadeIn(canvas);
  world.scene.dispose();

  world = new World('frasier', 'kacl', 'fraz');
  world.createWorld();
  
}






//  ------------- [ INTRO ANIMATE ] -----------------
async function animLogo() {

    setTimeout( function() {

        requestAnimationFrame( animLogo );

    }, 1000 / 24 );

    rendererIntro.render( intro, camIntro);

}




//  ------------- [ GET LATEST EP ] -----------------

async function fetchEpisode() {

  // Hit API
  const response = await fetch(`http://localhost:3000/episode`);
  const data = await response.json();

  
  return {
    title: data.title,
    script: data.script,
    audio: data.audio,
    voice: data.voice,
    world: data.world,
    model: data.model,
    location: data.location

  };
};



//  ------------- [ CLEAR SCENE ] -----------------

async function resetScene() {

    // clear Timelines
    ctl.clear();
    ktl.clear();

    // dispose of scene and recreate
    world.scene.dispose();
    intro.dispose();
    creditsAnimateActive.

    // clear vars
    world = null
    
}


//  ------------- [ EPISODE LOOP ] -----------------

async function episode() {

  // Set variables if not first run
  if (firstRun === false) {

      resetScene();

      fadeIn(startScreen);

      startScreen.style.opacity = 1;
      canvas.style.opacity = 1;

      animateActive = true;
      creditsAnimateActive = false;

  };
  
  // Get the latest episode
  await fetchEpisode().then(data => episodeData = data);
  
  // Intro creation
  initIntro(camIntro, lottieLoader, rendererIntro, canvasWidth, canvasHeight, canvas, intro);

  world = new World(episodeData.world, episodeData.location, episodeData.model);
  await world.createWorld();
    
  // Set first run as complete
  firstRun = false;

  // Show player canvas
  startScreen.style.opacity = 1;
  canvas.style.display = 'flex';
  
  // Get theme song lengt
  let themeLength = Math.ceil(await themeSong(themesDir, soundKacl, audioLoader));
    console.log(`theme length: ${themeLength}`);
  
    // Get monologue length
  let monoLength = Math.ceil(await monologueLength(episodeData.audio)) -0.5;
    console.log(`monologue length: ${monoLength}`);


  ktl.add(() => fadeOut(canvas), 0 );

  // start intro logo
  ktl.add(animLogo(), "+=0");

  // fade out intro
  ktl.add(() => fadeOut(startScreen), `+=${themeLength}` );

  // create title card
  ktl.add(() => titleCard(episodeData.title), "+=0");

   // fade in title card
  ktl.add(() => titleFade(titleDiv), "+=2.5");
  
  console.log(`world.location: ${world.location}`)
  ktl.add(() => animate(world.location), "+=0");

  // fade out titlecard
  ktl.add(() => fadeOut(canvas), `+=5`);

  // fade in to kacl studio
  ktl.add(() => fadeIn(canvas), "+=1.5");

  // start monologue
  ktl.add(() => monologue(audioLoader, episodeData.audio, soundKacl), "+=0");

  // fade out post-monologue
  ktl.add(() => fadeOut(canvas), `+=${monoLength}`);

  // Play timeline and call credits 2.55s seconds after its over (2.5s on fadeout so cant do it right away)
  ktl.play().eventCallback("onComplete", () => {

      setTimeout(() => {

          createCredits();

      }, 2650); 

  });
}


class World {
  constructor(worldName, location, character) {
    this.worldName = worldName;
    this.location = location;
    this.character = character;
    this.camera = camera;
    
    this.scene = new THREE.Scene();
    
    this.mixer = null;
  }

  async createWorld() {

    //const objectLoader = new THREE.ObjectLoader();
    const glLoader = new GLTFLoader();
    
    // Load Set
    glLoader.load(
      `${baseWorldsDir}${this.worldName}/sets/${this.location}.glb`,
      (gltf) => {
      
        this.scene.add(gltf.scene);

        const worldSet = gltf.scene;

        switch (this.location) {
          case 'blacktemple':
            camBlackTemple(camera);
            break;
          
          case 'kacl':
            worldSet.position.set(0, 0, 0)
            camKaclTopDown(camera);
            break;
        }

        worldSet.traverse(function (child) {
          if (child.isMesh) {
            child.material.roughness = 1;
          }
        });

        worldSet.traverse(function (obj) {
          obj.frustumCulled = false;
        });

      }
    );

    // Add fraz model
    glLoader.load(
      `${baseWorldsDir}${this.worldName}/characters/${this.character}.glb`,
      (gltf) => {
        this.scene.add(gltf.scene);

        switch (this.character) {

          case 'illidan':
            gltf.scene.position.set( -0.318, 0, 0 );
            break;

          case 'fraz':
            gltf.scene.position.set( 0.061, 0, -0.127 );
            gltf.scene.scale.set( 1, 1, 1 );
            gltf.scene.rotation.set( 0 , -180 * Math.PI / 180, 0 );
            break;
        }

        const model = gltf.scene;

        model.traverse(function (child) {
          if (child.isMesh) {
            child.material.roughness = 1;
          }
        });

        model.traverse(function (obj) {
          obj.frustumCulled = false;
        });

        this.mixer = new THREE.AnimationMixer(gltf.scene);

        let clip;

        switch (this.character) {

          case 'illidan':
            clip = gltf.animations[0]; // talk animation
            break;
          
          case 'fraz':
            clip = gltf.animations[1]; // talk animation
            break;
        }
        

        const action = this.mixer.clipAction(clip);

        action.setLoop(THREE.LoopRepeat);

        action.play();
      }
    );
  }
}
