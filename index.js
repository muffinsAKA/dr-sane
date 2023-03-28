import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader';
import { TextGeometry } from 'three/addons/geometries/TextGeometry';
import { gsap } from 'gsap';
import { LottieLoader } from 'three/addons/loaders/LottieLoader';
import animationData from './src/intro.json';
//import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
//import { ShaderPass } from 'three/addons/postprocessing/ShaderPass'
//import { RenderPass } from 'three/addons/postprocessing/RenderPass';
//import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader'

//  ------------- [ DOM ELEMENTS ] -----------------
const startScreen = document.getElementById('start-screen');
const firstTime = document.getElementById('first-time');
const canvas = document.querySelector('#player');
const creditsDiv = document.querySelector('#credits');
const titleDiv = document.querySelector('#title');


//  ------------- [ API GRAB ] -----------------
let episodeData;

//  ------------- [ ANIM TRIGGERS ] -----------------
let animateActive = true;
let creditsAnimateActive = false;



//  ------------- [ GLOBAL VARS ] -----------------
let firstRun = true;


//  ------------- [ GLOBAL OBJS ] -----------------
const objectLoader = new THREE.ObjectLoader();
const audioLoader = new THREE.AudioLoader();
const fontLoader = new FontLoader();
const lottieLoader = new LottieLoader();





//  ------------- [ SCENES ] -----------------
const intro = new THREE.Scene();
const kaclScene = new THREE.Scene();
const credits = new THREE.Scene();




//  ------------- [ CAMERAS ] -----------------
const camCredits = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
const camIntro = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );




//  ------------- [ AUDIO ] -----------------
const listenerCreds = new THREE.AudioListener();
const listenerKacl = new THREE.AudioListener();
  
const soundCreds = new THREE.Audio( listenerCreds );
const soundKacl = new THREE.Audio( listenerKacl );




//  ------------- [ TIMELINES ] -----------------

// Create credits timeline
const ctl = gsap.timeline();

// Create kacl timeline
const ktl = gsap.timeline();




//  ------------- [ RENDERERS ] -----------------
const rendererIntro = new THREE.WebGLRenderer({ canvas:startScreen, antialias: true});
let renderer;
let rendererCredits;



//  ------------- [ MATERIALS + MESHES + FONTS ] -----------------

//let titleCard, titleCardMesh, titleCardMaterial;
let credit1Geo, credit1Mat, credit1Mesh;
let credit2Geo, credit2Mat, credit2Mesh;
let mesh, introPlane, planeMat;
let korin;


//  ------------- [ MAIN INITIALIZATION ] -----------------

mainInit();

async function setRenderer() {

    //  ------------- [ RENDERER ] ----------------
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    rendererCredits = new THREE.WebGLRenderer({canvas, antialias: true});
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
  
}

async function titleFade() {
  titleDiv.style.opacity = 1;
  await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 7 seconds
  titleDiv.style.opacity = 0;
}

async function mainInit() {

    //  ------------- [ INTRO LOTTIE ] ----------------
    const container = document.getElementById('first-time');

    const options = {
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: animationData
    };

    lottie.loadAnimation(options);



  // Adds audio listener to camera
  camCredits.add( listenerCreds );
  camera.add( listenerKacl );

  
  // Add listener for window resizing to adjust size/camera
  window.addEventListener('resize', adjustSize);


  // Default cam position
  camera.position.set(2, 0, 0);
    camera.rotation.set(
      -18.55 * Math.PI / 180,
      -88.34 * Math.PI / 180,
      -18.74 * Math.PI / 180);

      
  //  ------------- [ FIRST RUN CHECK ] -----------------

  if (firstRun == true) {
    
    // Hide player canvas initially
    canvas.style.display = 'none';
    
    // Add event listener to start screen
    firstTime.addEventListener('click', () => {
      
      // Hide start screen
      firstTime.style.display = 'none';
      
      episode();

    })

   } else {

    episode();

   }
  }




//  ------------- [ KACL CREATION ] -----------------

async function createKacl() {

  // Load KACL Set
  objectLoader.load(`./res/scene.json`, function ( kaclJson ) {
     
    // Add the loaded object to the scene
      kaclScene.add( kaclJson );

  });
}



//  ------------- [ KACL ANIMATE ] -----------------
function animate() {
  if (animateActive) {
    setTimeout( function() {

     requestAnimationFrame(animate);

    }, 1000 / 24 );
    

    renderer.render(kaclScene, camera);
  }

}



//  ------------- [ FUNCTIONS CREATION ] -----------------

function fadeOutIntro() {
  startScreen.style.opacity = 0;
}

function fadeInIntro() {
  startScreen.style.opacity = 1;
}


//  ------------- [ FADE IN ] -----------------
function fadeIn() {
  canvas.style.opacity = 1;
}

//  ------------- [ FADE OUT ] -----------------
function fadeOut() {
  canvas.style.opacity = 0;
}


//  ------------- [ RESIZE ] -----------------
function adjustSize() {

  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth/window.innerHeight);
  
  camCredits.aspect = window.innerWidth/window.innerHeight;
  camCredits.updateProjectionMatrix();
  rendererCredits.setSize(window.innerWidth/window.innerHeight);
  
  camIntro.aspect = window.innerWidth / window.innerHeight;
  camIntro.updateProjectionMatrix();
  rendererIntro.setSize( window.innerWidth, window.innerHeight );

}

async function credTextGen(line1, line2) {
    creditsDiv.innerHTML = `${line1} <br> ${line2}`;
  }

async function titleCard(epTitle) {
    titleDiv.innerHTML = `${epTitle}`;
}

// 
//  ------------- [ CREDITS SEQUENCE ] -----------------

async function createCredits() {

  let creditsLength = await credLength();
  
  // Start credits animation loop
  animateActive = false;
  creditsDiv.style.display = "block";

  ctl.add(() => credTextGen('EXECUTIVE PRODUCER', 'Kelsey Grumpy'), 0);
  ctl.add(() => credTextGen('EXECUTIVE PRODUCER', 'Grunky Doby'), 2.5);
  

  ctl.add(episode, creditsLength + 4);

  ctl.add(() => creditsDiv.style.display = "none", creditsLength - 2 )

  // Play timline
  ctl.play();
  
}

//  ------------- [ PLAY CREDITS THEME + GET LENGTH ] -----------------
async function credLength() {
  
  let credAudio = new Audio('/audio/themes/credits.mp3');


  // Get audio duration
  let credAudioPromise = new Promise((resolve, reject) => {

  credAudio.addEventListener('loadedmetadata', () => {
      
    // load duration into 'creditsLength'
    resolve(credAudio.duration); 
    });
    
    credAudio.addEventListener('error', reject);

    
    });

    // Load and play theme
    audioLoader.load('/audio/themes/credits.mp3', function(buffer) {
        soundCreds.setBuffer(buffer);
        soundCreds.setLoop(false);
        soundCreds.setVolume(0.4);
        soundCreds.play();
    
    });
  
    // return credits length
    return credAudioPromise;

}

  
//  ------------- [ CREDITS ANIMATE ] -----------------
function creditsAnimate() {
  if (creditsAnimateActive) {
    setTimeout( function() {
      
    requestAnimationFrame( creditsAnimate );

    }, 1000 / 24 );

    rendererCredits.render(credits, camCredits);
  }
}





//  ------------- [ INTRO SEQUENCE ] -----------------

async function initIntro() {

  camIntro.position.z = 2;

  lottieLoader.setQuality( 4 );
  lottieLoader.load( 'intro.json', function ( texture ) {

    introPlane = new THREE.PlaneGeometry( 2, 2 );
    planeMat = new THREE.MeshBasicMaterial( { map: texture } );
    mesh = new THREE.Mesh( introPlane, planeMat );
    intro.add( mesh );

  });
  
  rendererIntro.setPixelRatio( window.devicePixelRatio );
  rendererIntro.setSize( window.innerWidth, window.innerHeight );
  
  canvas.style.display = 'none';
  
}


//  ------------- [ INTRO ANIMATE ] -----------------
async function animLogo() {

    setTimeout( function() {

        requestAnimationFrame( animLogo );

    }, 1000 / 24 );

    rendererIntro.render( intro, camIntro);

}




//  ------------- [ CAMERA POSITIONS ] -----------------

function camTitle(){
  camera.position.set(2, 0, 0);
  camera.rotation.set(
    -18.55 * Math.PI / 180,
    -88.34 * Math.PI / 180,
    -18.74 * Math.PI / 180);
}

function cam1() {

  camera.position.set(-0.10, 0.593, 0.019);
  camera.rotation.set(
    -68.43 * Math.PI / 180,
    88.61 * Math.PI / 180,
    68.62 * Math.PI / 180
  );

};



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
    name: data.name,
    location: data.location

  };

};


//  ------------- [ LOAD THEME + SET DURATION ] -----------------

async function themeSong() {
  
  // Generate random # between 1-21
  let n = Math.floor(Math.random() * (21 - 1) + 1);

  // Check duration of mp3
  let themeAudio = new Audio(`/audio/themes/theme${n}.mp3`);
  
  // Get audio duration
  let introLengthPromise = new Promise((resolve, reject) => {

    themeAudio.addEventListener('loadedmetadata', () => {
      
      // load duration into 'introLength'
      resolve(themeAudio.duration); 

    });
    
    themeAudio.addEventListener('error', reject);

  });
  
  // Load and play theme
  audioLoader.load(`/audio/themes/theme${n}.mp3`, function(buffer) {
    soundKacl.setBuffer(buffer);
    soundKacl.setLoop(false);
    soundKacl.setVolume(1);
    soundKacl.play();
  
  });
  
  // return theme song length
  return introLengthPromise;

}



//  ------------- [ MONOLOGUE LENGTH ] -----------------

async function monologueLength() {

  let monoAudio = new Audio(`${episodeData.audio}`);


  // Get audio duration
  let monoLengthPromise = new Promise((resolve, reject) => {

    monoAudio.addEventListener('loadedmetadata', () => {
      
      // load duration into 'introLength'
      resolve(monoAudio.duration); 
    });
    
    monoAudio.addEventListener('error', reject);

    });

  return monoLengthPromise;

}




//  ------------- [ MONOLOGUE SOUND ] -----------------

async function monologue() {
  
  audioLoader.load(`${episodeData.audio}`, function( buffer_mono ) {
    soundKacl.setBuffer( buffer_mono );
    soundKacl.setLoop( false );
    soundKacl.setVolume( 1 );
    soundKacl.play();

  });

}

async function canvasHide() {

    canvas.style.opacity = 0;

}



//  ------------- [ CLEAR SCENE ] -----------------

async function clear() {

    // clear Timelines
    ctl.clear();
    ktl.clear();

}

//  ------------- [ EPISODE LOOP ] -----------------

async function episode() {

    // Set variables if not first run
  if (firstRun == false) {

      clear();

      fadeInIntro();

      startScreen.style.opacity = 1;
      canvas.style.opacity = 1;

      animateActive = true;
      creditsAnimateActive = false;

  };

  // Intro creation
  initIntro();

  setRenderer();

  // Get the latest episode
  await fetchEpisode().then(data => episodeData = data);

  const title = episodeData.title;

  await createKacl();

  camTitle();
  
  // Show player canvas
  startScreen.style.opacity = 1;
  canvas.style.display = 'block';


  // Get monologue length
  let monoLength = Math.ceil(await monologueLength()) -0.5;

  // Set first run as complete
  firstRun = false;

  // Get theme song length
  let themeLength = Math.ceil(await themeSong());

  ktl.add(canvasHide, 0);

  // start intro logo
  ktl.add(animLogo(), "+=2.5s");

  // fade out intro
  ktl.add(fadeOutIntro, `+=${themeLength}`);

  // fade in title card
  ktl.add(titleCard(title), "+=0");

  ktl.add(titleFade, "+=2.5");
  

  ktl.add(animate, "+=0");

  // fade out titlecard
  ktl.add(fadeOut, `+=5`);

  // switch to main camera
  ktl.add(cam1, "+=2.5");

  // fade in to kacl studio
  ktl.add(fadeIn, "+=0.5");

  // start monologue
  ktl.add(monologue, "+=0");

  // fade out post-monologue
  ktl.add(fadeOut, `+=${monoLength}`);

  // Play timeline and call credits 2.55s seconds after its over (2.5s on fadeout so cant do it right away)
  ktl.play().eventCallback("onComplete", () => {

      setTimeout(() => {

          createCredits();

      }, 2550); 

  });
}

