//  ------------- [ CAMERA POSITIONS ] -----------------

export async function camKaclTopDown(camera) {

    camera.position.set(-2.620, 1.873, -3.365);
    camera.rotation.set(
      -151.36 * Math.PI / 180,
      -55.61 * Math.PI / 180,
      -155.73 * Math.PI / 180
  
    );
  }
  
export async function camKaclFront(camera) {
  
    camera.position.set(-1.1, 0.546, -0.560);
    camera.rotation.set(
      118.32 * Math.PI / 180,
      -88.28 * Math.PI / 180,
      118.33 * Math.PI / 180
  
    );
  }

  export async function camKaclWindow(camera) {
  
    camera.position.set(-0.660, 1.096, 4.296);
    camera.rotation.set(
      -0.53 * Math.PI / 180,
      -21.20 * Math.PI / 180,
      -0.19 * Math.PI / 180
  
    );
  }
  
 export async function camBlackTemple(camera) {
  
    camera.position.set(3, 0.48, 0);
    camera.rotation.set(
      93.37 * Math.PI / 180,
      85.90 * Math.PI / 180,
      -93.37 * Math.PI / 180
  
    );
  }
  


  export async function kaclCamRandomzier(camera) {
    
     const kaclCams = [
      async function camKaclTopDown() {

        camera.position.set(-2.620, 1.873, -3.365);
        camera.rotation.set(
        -151.36 * Math.PI / 180,
        -55.61 * Math.PI / 180,
        -155.73 * Math.PI / 180
    
      );
    },
    
    async function camKaclFront() {
    
      camera.position.set(-1.1, 0.546, -0.560);
      camera.rotation.set(
        118.32 * Math.PI / 180,
        -88.28 * Math.PI / 180,
        118.33 * Math.PI / 180
    
      );
    },
  
    async function camKaclWindow() {
    
      camera.position.set(-0.660, 1.096, 4.296);
      camera.rotation.set(
        -0.53 * Math.PI / 180,
        -21.20 * Math.PI / 180,
        -0.19 * Math.PI / 180
    
      );
    },
    async function camKaclLowRight() {
    
      camera.position.set(-0.642, 0.704, 1.751);
      camera.rotation.set(
        5.57 * Math.PI / 180,
        -27.39 * Math.PI / 180,
        2.57 * Math.PI / 180
    
      );
    },
    async function camKaclCloseLeft() {
    
      camera.position.set(-1.152, 0.670, -2.588);
      camera.rotation.set(
        178.53 * Math.PI / 180,
        -49.68 * Math.PI / 180,
        178.88 * Math.PI / 180
    
      );
    }
  ];


    const camIndex = Math.floor(Math.random() * kaclCams.length);
  
    const camChoice = kaclCams[camIndex];



      const randomWait = Math.floor(Math.random() * (9000 - 4500) + 4500);
      
      setTimeout(() => {
        kaclCamRandomzier(camera)  
        return camChoice(camera);

      }, randomWait)

      
     }



 