import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader';
import { TextGeometry } from 'three/addons/geometries/TextGeometry';
import { gsap } from 'gsap';
import { LottieLoader } from 'three/addons/loaders/LottieLoader';
import animationData from './src/intro.json';
import dotenv from 'dotenv';
//import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
//import { ShaderPass } from 'three/addons/postprocessing/ShaderPass'
//import { RenderPass } from 'three/addons/postprocessing/RenderPass';
//import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader'

dotenv.config();

//  ------------- [ ENV KEYS ] -----------------
const sceneName = process.dotenv.sceneName;
const apiGetLatest = process.dotenv.apiGetLatest;

//  ------------- [ DOM ELEMENTS ] -----------------
const startScreen = document.getElementById('start-screen');
const firstTime = document.getElementById('first-time');
const canvas = document.querySelector('#player');


//  ------------- [ API GRAB ] -----------------
let episodeData;



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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const rendererCredits = new THREE.WebGLRenderer({canvas, antialias: true});



//  ------------- [ MATERIALS + MESHES + FONTS ] -----------------

let titleCard, titleCardMesh, titleCardMaterial;
let credit1Geo, credit1Mat, credit1Mesh;
let credit2Geo, credit2Mat, credit2Mesh;
let mesh, introPlane, planeMat;
let korin;


//  ------------- [ MAIN INITIALIZATION ] -----------------

mainInit();

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


  //  ------------- [ RENDERER ] ----------------

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;



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
  objectLoader.load(`${sceneName}`, function ( kaclJson ) {
     
    // Add the loaded object to the scene
      kaclScene.add( kaclJson );

  });
}



//  ------------- [ TEXT CREATION ] -----------------

async function createText() {
   
  // --TITLECARD TEXT--

  // Create title card geo + mesh
  fontLoader.load('korin.json', function ( fontdata ) {

    korin = fontdata;

    // Create episode Title Card geometry
    titleCard = new TextGeometry( `${episodeData.title}`, {
        font: korin,
        size: .2,
        height: .001
    });

    // Create title card mat + mesh
    titleCardMaterial = new THREE.MeshBasicMaterial();
    titleCardMesh = new THREE.Mesh(titleCard, titleCardMaterial);

    // Position title card
    titleCard.center();
    titleCardMesh.position.set(9, 0, 0);
    titleCardMesh.rotation.set(0,-1.56,0);

    // add Title Card to scene
    kaclScene.add(titleCardMesh);


    // --CREDITS TEXT--

    // Create the credits geometry
    credit1Geo = new TextGeometry( `EXECUTIVE PRODUCER \n    Huge Greg`, {
        font: korin,
        size: .2,
        height: .001
    });

    credit2Geo = new TextGeometry( `BIG BOY \n   Small Greg`, {
        font: korin,
        size: .2,
        height: .001
    });

    // Create 1st credit mat and mesh
    credit1Mat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 1 
    });

    credit1Mesh = new THREE.Mesh(credit1Geo, credit1Mat);

    // Position 1st credit
    credit1Geo.center();
    credit1Mesh.position.set(9, 0, 0);
    credit1Mesh.rotation.set(0,-1.56,0);
    credit1Mesh.visible = false;

    // Create 2nd credit mat and mesh
    credit2Mat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 1 
    });

    credit2Mesh = new THREE.Mesh(credit2Geo, credit2Mat);

    // Position 2nd credit
    credit2Geo.center();
    credit2Mesh.position.set(9, 0, 0);
    credit2Mesh.rotation.set(0,-1.56,0);
    credit2Mesh.visible = false;

    // Add credits to scene
    credits.add(credit1Mesh);
    credits.add(credit2Mesh);

    // Set credits camera pos
    camCredits.position.set(2, 0, 0);
    camCredits.rotation.set(
        -18.55 * Math.PI / 180,
        -88.34 * Math.PI / 180,
        -18.74 * Math.PI / 180);

    });

} 


//  ------------- [ KACL ANIMATE ] -----------------
function animate() {

    setTimeout( function() {

        requestAnimationFrame( animate );

    }, 1000 / 24 );
    

    renderer.render(kaclScene, camera);

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



// 
//  ------------- [ CREDITS SEQUENCE ] -----------------

async function createCredits() {

  let creditsLength = await credLength();
  
  // Start credits animation loop
  creditsAnimate();

  // Fade in from black
  ctl.add(fadeIn, { duration: 0});

  ctl.to(credit1Mesh, { duration: 0.1, visible: true }, "+=1");
  ctl.to(credit1Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit2Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit2Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit1Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit1Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit2Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit2Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit1Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit1Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit2Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit2Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit1Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit1Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit2Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit2Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit1Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit1Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit2Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit2Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit1Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit1Mesh, { duration: 0.1, visible: false }, "+=2.5")
  ctl.to(credit2Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit2Mesh, { duration: 0.1, visible: false }, "+=2.5");
  ctl.to(credit1Mesh, { duration: 0.1, visible: true }, "+=0");
  ctl.to(credit1Mesh, { duration: 0.1, visible: false }, "+=2.5");

  ctl.add(episode, creditsLength + 4);
  
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

    setTimeout( function() {

        requestAnimationFrame( creditsAnimate );

    }, 1000 / 24 );

    renderer.render(credits, camCredits);
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

function cam2() {

  camera.position.set(0.522, 0.810, 1.378);
  camera.rotation.set(
    2.52 * Math.PI / 180,
    51.2 * Math.PI / 180,
    -1.77 * Math.PI / 180
  );

};

function cam3() {

  camera.position.set(-0.422, 0.664, -4.226);
  camera.rotation.set(
    173.62 * Math.PI / 180,
    15.10 * Math.PI / 180,
    -178.33 * Math.PI / 180
  );

};



//  ------------- [ GET LATEST EP ] -----------------

async function fetchEpisode() {

  // Hit API
  const response = await fetch(`${apiGetLatest}`);
  const data = await response.json();


  return {
    title: data.title,
    script: data.script,
    audio: data.audio
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

    // clear Geo
    credit1Geo.dispose();
    credit2Geo.dispose();
    titleCard.dispose();
    introPlane.dispose();

    // clear Mats
    credit1Mat.dispose();
    credit2Mat.dispose();
    titleCardMaterial.dispose();
    planeMat.dispose();

    // clear Meshes
    credits.remove(credit1Mesh);
    credits.remove(credit2Mesh);
    kaclScene.remove(titleCardMesh);
    intro.remove(mesh);

}

//  ------------- [ EPISODE LOOP ] -----------------

async function episode() {

     // Set variables if not first run
    if (firstRun == false) {

        clear();

        fadeInIntro();

        startScreen.style.opacity = 1;
        canvas.style.opacity = 1;

    };
    
    // Intro creation
    initIntro();

    // Get the latest episode
    await fetchEpisode().then(data => episodeData = data);

    await createText();

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
    ktl.add(fadeIn, "+=2.5");

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

