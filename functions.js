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

  export async function themeSong(theme) {
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
  const audioUrl = 'https://muffinsaka.s3.amazonaws.com/credits.mp3';

  // Get audio duration
  const credAudioPromise = new Promise((resolve, reject) => {
    audioLoader.load(audioUrl, (buffer) => {
      
      console.log(`buffer duration: ${buffer.duration}`)
      resolve(buffer.duration);
    }, undefined, reject);
  });

  // Load and play theme
  audioLoader.load(audioUrl, (buffer) => {
    soundCreds.setBuffer(buffer);
    soundCreds.setLoop(false);
    soundCreds.setVolume(0.4);
    soundCreds.play();
  });

  // Return credits length
  return credAudioPromise;
}


  //  ------------- [ RENDERER ] ----------------
export async function setRenderer(canvas, renderer, canvasWidth, canvasHeight) {

  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));
  renderer.outputEncoding = THREE.sRGBEncoding;  

}

export async function titleFade(titleDiv) {
  titleDiv.style.opacity = 1;
  await new Promise(resolve => setTimeout(resolve, 3000));
  titleDiv.style.opacity = 0;
}

export function logCurrentScene() {
  
  console.log(`Current Scene: ${current.scene}`);
  console.log(`Current Camera: ${current.camera}`);
  console.log(`Current Mixer: ${current.mixer}`);
  console.log(`Current Texture: ${current.texture}`);
  console.log(`Current Cone: ${current.cone}`);

}

export function logHolds(logReq) {

  if (logReq === 'creditsDance') {
    console.log(`creditsDanceHold: ${creditsDanceHold}`);
    console.log(`creditsDanceHold scene: ${creditsDanceHold.scene}`);
    console.log(`creditsDanceHold camera: ${creditsDanceHold.camera}`);
    console.log(`creditsDanceHold mixer: ${creditsDanceHold.mixer}`);
  }

  if (logReq === 'creditsFall') {
  console.log(`creditsFallHold: ${creditsFallHold}`);
  console.log(`creditsFallHold scene: ${creditsFallHold.scene}`);
  console.log(`creditsFallHold camera: ${creditsFallHold.camera}`);
  console.log(`creditsFallHold mixer: ${creditsFallHold.mixer}`);
  console.log(`creditsFallHold texture: ${creditsFallHold.texture}`);
  console.log(`creditsFallHold cone: ${creditsFallHold.cone}`)
  }

  if (logReq === 'kacl') {
  console.log(`kaclHold: ${kaclHold}`);
  console.log(`kaclHold scene: ${kaclHold.scene}`);
  console.log(`kaclHold camera: ${kaclHold.camera}`);
  console.log(`kaclHold mixer: ${kaclHold.mixer}`);
  }
}