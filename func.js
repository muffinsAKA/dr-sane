
//  ------------- [ FUNCTIONS CREATION ] -----------------

export function fadeOutIntro() {
    startScreen.style.opacity = 0;
  }
  
  export function fadeInIntro() {
    startScreen.style.opacity = 1;
  }
  
  
  //  ------------- [ FADE IN ] -----------------
  export function fadeIn() {
    canvas.style.opacity = 1;
  }
  
  //  ------------- [ FADE OUT ] -----------------
  export function fadeOut() {
    canvas.style.opacity = 0;
  }
  
  
  //  ------------- [ RESIZE ] -----------------
  export function adjustSize() {
  
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
  
  //  ------------- [ CAMERA POSITIONS ] -----------------

export function camTitle(camera){
    camera.position.set(2, 0, 0);
    camera.rotation.set(
      -18.55 * Math.PI / 180,
      -88.34 * Math.PI / 180,
      -18.74 * Math.PI / 180);
  }
  
  export function cam1() {
  
    camera.position.set(-0.10, 0.593, 0.019);
    camera.rotation.set(
      -68.43 * Math.PI / 180,
      88.61 * Math.PI / 180,
      68.62 * Math.PI / 180
    );
  
  };
  
  export function cam2() {
  
    camera.position.set(0.522, 0.810, 1.378);
    camera.rotation.set(
      2.52 * Math.PI / 180,
      51.2 * Math.PI / 180,
      -1.77 * Math.PI / 180
    );
  
  };
  
  export function cam3() {
  
    camera.position.set(-0.422, 0.664, -4.226);
    camera.rotation.set(
      173.62 * Math.PI / 180,
      15.10 * Math.PI / 180,
      -178.33 * Math.PI / 180
    );
  
  };

  //  ------------- [ GET LATEST EP ] -----------------

export async function fetchEpisode() {

    // Hit API
    const response = await fetch('http://localhost:3000/episode');
    const data = await response.json();
  
  
    return {
      title: data.title,
      script: data.script,
      audio: data.audio
    };
  
  };
  
  
  //  ------------- [ LOAD THEME + SET DURATION ] -----------------
  
export async function themeSong() {
    
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

  //  ------------- [ PLAY CREDITS THEME + GET LENGTH ] -----------------
export async function credLength() {
  
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

  //  ------------- [ MONOLOGUE LENGTH ] -----------------

export async function monologueLength() {

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
  
  export async function monologue() {
    
    audioLoader.load(`${episodeData.audio}`, function( buffer_mono ) {
      soundKacl.setBuffer( buffer_mono );
      soundKacl.setLoop( false );
      soundKacl.setVolume( 1 );
      soundKacl.play();
  
    });
  
  }
  
  export async function canvasHide() {
  
      canvas.style.opacity = 0;
  
  }
  