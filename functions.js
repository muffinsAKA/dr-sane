import * as THREE from 'three';

//  ------------- [ FADES ] -----------------

export function fadeIn(canvas) {
    canvas.style.opacity = 1;
  }
  
export function fadeOut(canvas) {
    canvas.style.opacity = 0;
  }


//  ------------- [ MONOLOGUE LENGTH ] -----------------
export async function monologueLength(audio) {
  let monoAudio = new Audio(`data:audio/mpeg;base64,${audio}`);

  return new Promise((resolve, reject) => {
    monoAudio.addEventListener('loadedmetadata', () => {
      resolve(monoAudio.duration);
    });

    monoAudio.addEventListener('error', reject);
  });
}
  
  //  ------------- [ LOAD THEME + SET DURATION ] -----------------

  export async function themeSong(theme, soundKacl, audioLoader) {
    const audioData = `data:audio/mpeg;base64,${theme}`;
  
    // Create a new Audio object
    const themeAudio = new Audio(audioData);
  
    // Get audio duration
    const introLengthPromise = new Promise((resolve, reject) => {
      themeAudio.addEventListener('loadedmetadata', () => {
        // Load duration into 'introLength'
        resolve(themeAudio.duration);
      });
      themeAudio.addEventListener('error', reject);
    });
  
    // Load and play theme
    audioLoader.load(audioData, function (buffer) {
      soundKacl.setBuffer(buffer);
      soundKacl.setLoop(false);
      soundKacl.setVolume(1);
      soundKacl.play();
    });
  
    // Return theme song length
    return introLengthPromise;
  }

  //  ------------- [ MONOLOGUE SOUND ] -----------------

  export async function monologue(audioLoader, audio, soundKacl) {
    const audioData = `data:audio/mpeg;base64,${audio}`;
  
    return new Promise((resolve, reject) => {
      audioLoader.load(audioData, (buffer_mono) => {
        soundKacl.setBuffer(buffer_mono);
        soundKacl.setLoop(false);
        soundKacl.setVolume(1);
        soundKacl.onEnded(() => {
          resolve();
        });
        soundKacl.play();
      }, undefined, reject);
    });
  }
  

//  ------------- [ PLAY CREDITS THEME + GET LENGTH ] -----------------
export async function credLength(audioLoader, soundCreds) {
  
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

//  ------------- [ INTRO SEQUENCE ] -----------------

export async function initIntro(animationData, camIntro, lottieLoader, rendererIntro, canvasWidth, canvasHeight, canvas, intro) {

  let mesh, introPlane, planeMat;

  camIntro.position.z = 1;

  lottieLoader.setQuality( 4 );
  lottieLoader.load( animationData, function ( texture ) {

    const bgPlane = new THREE.PlaneGeometry( 10, 10 );
    const bgMat = new THREE.MeshBasicMaterial( { color:'#050505'} );
    const bgMesh = new THREE.Mesh( bgPlane, bgMat);

    introPlane = new THREE.PlaneGeometry( 1, 1 );
    planeMat = new THREE.MeshBasicMaterial( { map: texture, transparent: true } );
    mesh = new THREE.Mesh( introPlane, planeMat );
    intro.add( mesh );
    intro.add( bgMesh );

    bgMesh.position.z = -3;

  });
  
  rendererIntro.setPixelRatio( window.devicePixelRatio );
  rendererIntro.setSize( canvasWidth, canvasHeight );
  
  canvas.style.display = 'none';
  
}

  //  ------------- [ RENDERER ] ----------------
export async function setRenderer(canvas, renderer, rendererCredits, canvasWidth, canvasHeight) {

  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));
  renderer.outputEncoding = THREE.sRGBEncoding;

  rendererCredits.setSize(canvasWidth, canvasHeight);
  rendererCredits.setPixelRatio(Math.min(window.devicePixelRatio, 4));
  rendererCredits.outputEncoding = THREE.sRGBEncoding;
  

}

export async function titleFade(titleDiv) {
  titleDiv.style.opacity = 1;
  await new Promise(resolve => setTimeout(resolve, 3000));
  titleDiv.style.opacity = 0;
}
