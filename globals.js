import { FontLoader } from 'three/addons/loaders/FontLoader';
import { LottieLoader } from 'three/addons/loaders/LottieLoader';
import * as THREE from 'three';
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

export { objectLoader, audioLoader, fontLoader, lottieLoader, intro, kaclScene, credits, camCredits, camera, camIntro, soundCreds, soundKacl, listenerCreds, listenerKacl };