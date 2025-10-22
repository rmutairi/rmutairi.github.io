import * as THREE from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three137/DRACOLoader.js';
import { RGBELoader } from '../../libs/three137/RGBELoader.js';
import { OrbitControls } from '../../libs/three137/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { FBXLoader } from '../../libs/three137/FBXLoader.js';

import { EffectComposer } from '../../libs/three137/EffectComposer.js';
import { RenderPass } from '../../libs/three137/RenderPass.js';
import { OutlinePass } from '../../libs/three137/OutlinePass.js';

//import { EffectComposer } from '../../libs/three137/postprocessing/EffectComposer.js';
//import { RenderPass } from '../../libs/three137/postprocessing/RenderPass.js';
//import { OutlinePass } from '../../libs/three137/postprocessing/OutlinePass.js';

//import { EffectComposer } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/EffectComposer.js';
//import { RenderPass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/RenderPass.js';
//import { OutlinePass } from 'https://unpkg.com/three@0.137.0/examples/jsm/postprocessing/OutlinePass.js';



class Ro {
    constructor() {








        const container = document.createElement('div');
        document.body.appendChild(container);

        this.clock = new THREE.Clock();
        this.loadingBar = new LoadingBar();
        this.assetsPath = 'factory';
        this.scene = new THREE.Scene();
        


            

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(-0.4, 5, -7);

     

  

  
    this.originalCameraPosition = this.camera.position.clone();
    this.originalCameraRotation = this.camera.rotation.clone();

    

 
    const resetBtn = document.getElementById('resetCameraBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const duration = 0.8;
        const startPos = this.camera.position.clone();
        const startRot = this.camera.rotation.clone();
        const endPos = this.originalCameraPosition.clone();
        const endRot = this.originalCameraRotation.clone();

        let startTime = null;
        const animateReset = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = (timestamp - startTime) / 1000;
          const t = Math.min(elapsed / duration, 1);

          this.camera.position.lerpVectors(startPos, endPos, t);
          this.camera.rotation.x = startRot.x + (endRot.x - startRot.x) * t;
          this.camera.rotation.y = startRot.y + (endRot.y - startRot.y) * t;
          this.camera.rotation.z = startRot.z + (endRot.z - startRot.z) * t;

          if (t < 1) requestAnimationFrame(animateReset);
        };

        requestAnimationFrame(animateReset);
      });
    }

    



        // LIGHT
    
const ambient = new THREE.HemisphereLight(0xffffff, 0x555555, 0.9);
this.scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(10, 15, 10);
dirLight.castShadow = true;

//  Shadow 
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.bias = -0.0001;

//  shadow camera for performance
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 40;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;

// Optional helper to debug shadows
const helper = new THREE.CameraHelper(dirLight.shadow.camera);
// this.scene.add(helper);

this.scene.add(dirLight);

//  realism
this.scene.environment = dirLight;


        // RENDERER
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

       //  PERFORMANCE
this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
this.renderer.toneMappingExposure = 1.1;
this.renderer.physicallyCorrectLights = true;


if (window.devicePixelRatio > 2) {
  this.renderer.setPixelRatio(2);
}



        // CONTROLS
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 1, 0);
       


       
        this.setEnvironment().then(() => {
            this.loadFBXObject(); 
            this.loadingBar.visible = false;
            this.setupFBXClickHandler();
            this.loadPipeObject();
            this.loadPressureTubeObject();
            this.loadCentrifugalPumpsObject()





        });



this.scene.background = new THREE.Color(0x333333);














         //Optional debug
        const grid = new THREE.GridHelper(10, 10);
        this.scene.add(grid);
        const axes = new THREE.AxesHelper(2);
        this.scene.add(axes);

        // Event + loop
        window.addEventListener('resize', this.resize.bind(this));
        this.renderer.setAnimationLoop(this.render.bind(this));
        
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    async setEnvironment() {
        return new Promise((resolve) => {
            const loader = new RGBELoader().setPath(this.assetsPath);
            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            pmremGenerator.compileEquirectangularShader();

            loader.load(
                'hdr/factory.hdr',
                (texture) => {
                    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                    pmremGenerator.dispose();
                    this.scene.environment = envMap;
                    resolve();
                },
                undefined,
                (err) => {
                    console.error('HDR load error:', err.message);
                    resolve();
                }
            );
        });
    }





















// vessel



async loadFBXObject() {
    try {
        const loader = new FBXLoader();
        loader.setPath(`${this.assetsPath}factory/`);

        console.log('📦 Loading FBX objects...');
        this.loadingBar.visible = true;

       
        const loadFBX = (filename) => {
            return new Promise((resolve, reject) => {
                loader.load(
                    filename,
                    resolve,
                    (xhr) => {
                        if (xhr.lengthComputable) {
                            this.loadingBar.progress = xhr.loaded / xhr.total;
                        }
                    },
                    reject
                );
            });
        };

       
        const vessel = await loadFBX('vessel.fbx');
        const vesselTop = await loadFBX('vesseltop.fbx');

       

        const applyMaterial = (obj) => {
            obj.traverse((child) => {
               if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true; 
               }
            });
        };

       
        
      
        const box = new THREE.Box3().setFromObject(vessel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = 2.0 / Math.max(size.x, size.y, size.z);
        vessel.scale.setScalar(scale);
        vessel.position.set(0, 1.3, 0);
        vesselTop.position.set(0,1.3,0);
         

       
        vesselTop.scale.setScalar(scale);
        //vesselTop.position.set(0, 0.5, 0); 

        
        this.scene.add(vessel);
        this.scene.add(vesselTop);

        
        this.vessel = vessel;
        this.vesselTop = vesselTop;

        console.log('✅ Both FBX models loaded successfully');
        this.loadingBar.visible = false;

       
        this.setupFBXClickHandler();

    } catch (error) {
        console.error('❌ Failed to load FBX object:', error);
        this.loadingBar.visible = false;
    }
}


//centrifugalpumps
    
async loadCentrifugalPumpsObject() {
    try {
        const loader = new FBXLoader();
        loader.setPath(`${this.assetsPath}factory/`);

        console.log('📦 Loading pipe FBX...');
        this.loadingBar.visible = true;

        const CentrifugalPump = await new Promise((resolve, reject) => {
            loader.load(
                'centrifugalpump.fbx',
                resolve,
                (xhr) => {
                    if (xhr.lengthComputable) {
                        this.loadingBar.progress = xhr.loaded / xhr.total;
                    }
                },
                reject
            );
        });

    
    

      
        const box = new THREE.Box3().setFromObject(CentrifugalPump);
      const size = new THREE.Vector3();
    
  box.getSize(size);
        const scale = 1.5 / Math.max(size.x, size.y, size.z);
        CentrifugalPump.scale.setScalar(scale);
       CentrifugalPump.position.set(0, 1.3, 0);


         const applyMaterial = (obj) => {
            obj.traverse((child) => {
               if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true; 
               }
            });
        };



        this.scene.add(CentrifugalPump);
        this.CentrifugalPump = CentrifugalPump;

        console.log('✅ Pipe FBX loaded successfully:', CentrifugalPump);
        this.loadingBar.visible = false;

       
        this.setupCentrifugalPumpsClickHandler();

    } catch (error) {
        console.error('❌ Failed to load centrifugalpumps FBX:', error);
        this.loadingBar.visible = false;
    }
}




//pipe 

async loadPipeObject() {
    try {
        const loader = new FBXLoader();
        loader.setPath(`${this.assetsPath}factory/`);

        console.log('📦 Loading pipe FBX...');
        this.loadingBar.visible = true;

        const pipe = await new Promise((resolve, reject) => {
            loader.load(
                'pipe7.fbx',
                resolve,
                (xhr) => {
                    if (xhr.lengthComputable) {
                        this.loadingBar.progress = xhr.loaded / xhr.total;
                    }
                },
                reject
            );
        });

        const applyMaterial = (obj) => {
            pipe.traverse((child) => {
               if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
      
               }
            });
        };

        
        const box = new THREE.Box3().setFromObject(pipe);
      const size = new THREE.Vector3();
     
  box.getSize(size);
        const scale = 10.0 / Math.max(size.x, size.y, size.z);
        pipe.scale.setScalar(scale);
        pipe.position.set(0, 1.3, 0);




        this.scene.add(pipe);
        this.pipe = pipe;

        console.log('✅ Pipe FBX loaded successfully:', pipe);
        this.loadingBar.visible = false;

        
        this.setupPipeClickHandler();

    } catch (error) {
        console.error('❌ Failed to load pipe FBX:', error);
        this.loadingBar.visible = false;
    }
}



//pressuretube


async loadPressureTubeObject() {
    try {
        const loader = new FBXLoader();
        loader.setPath(`${this.assetsPath}factory/`);

        console.log('📦 Loading pressure tube FBX...');
        this.loadingBar.visible = true;

      


        const pressureTube = await new Promise((resolve, reject) => {
            loader.load(
                'pressuretube3.fbx',
                resolve,
                (xhr) => {
                    if (xhr.lengthComputable) {
                        this.loadingBar.progress = xhr.loaded / xhr.total;
                    }
                },
                reject
            );
        });

         
const box = new THREE.Box3().setFromObject(pressureTube);
const size = new THREE.Vector3();
box.getSize(size);

const maxDim = Math.max(size.x, size.y, size.z);


  box.getSize(size);
        const scale = 8.0 / Math.max(size.x, size.y, size.z);
        pressureTube.scale.setScalar(scale);
        pressureTube.position.set(0, 1.3, 0);

  const applyMaterial = (obj) => {
            pressureTube.traverse((child) => {
               if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
       
               }
            });
        };

      
        this.scene.add(pressureTube);
        this.pressureTube = pressureTube;

        console.log('✅ Pressure tube FBX loaded successfully:', pressureTube);
        this.loadingBar.visible = false;

      
        this.setupPressureTubeClickHandler();

    } catch (error) {
        console.error('❌ Failed to load pressure tube FBX:', error);
        this.loadingBar.visible = false;
    }
}




     






setupFBXClickHandler() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let textVisible = false;
    let outlined = false;

   
    const textDiv = document.createElement('div');
    textDiv.style.position = 'absolute';
    textDiv.style.top = '20px';
    textDiv.style.left = '50%';
    textDiv.style.transform = 'translateX(-50%)';
    textDiv.style.color = '#000000ff';
    textDiv.style.fontFamily = 'Arial, sans-serif';
    textDiv.style.fontSize = '22px';
    textDiv.style.textAlign = 'center';
    textDiv.style.userSelect = 'none';
    textDiv.style.display = 'none'; 
    textDiv.innerHTML = `
        <div>vessel   (hide)</div>
        <a href="https://en.wikipedia.org/wiki/Reverse_osmosis" target="_blank" style="
            color: #1e90ff;
            text-decoration: none;
            font-size: 18px;
        ">learn more</a>
    `;
    document.body.appendChild(textDiv);

  
    const onClick = (event) => {
        if (!this.vessel && !this.vesselTop) return;

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, this.camera);

       
         raycaster.setFromCamera(pointer, this.camera);
        const intersects = raycaster.intersectObject(this.vessel, true);
      
 if (intersects.length > 0) {
            textVisible = !textVisible;
            textDiv.style.display = textVisible ? 'block' : 'none';
    
           outlined = !outlined;
   
            this.vessel.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (outlined) {
                        child.material.emissive = new THREE.Color(0x008000);
                        child.material.emissiveIntensity = 0.8;
                    } else {
                        child.material.emissive.set(0x000000);
                    }
                }
            });
        }
    };

    

    window.addEventListener('click', onClick);}




//pipe
setupPipeClickHandler() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let textVisible = false;
    let outlined = false;

    const textDiv = document.createElement('div');
    textDiv.style.position = 'absolute';
    textDiv.style.bottom = '40px';
    textDiv.style.left = '50%';
    textDiv.style.transform = 'translateX(-50%)';
    textDiv.style.color = '#000000';
    textDiv.style.fontFamily = 'Arial, sans-serif';
    textDiv.style.fontSize = '22px';
    textDiv.style.textAlign = 'center';
    textDiv.style.userSelect = 'none';
    textDiv.style.display = 'none';
    textDiv.innerHTML = `
        <div>pipe (hide)</div>
        <a href="https://en.wikipedia.org/wiki/Pipeline_transport" target="_blank" style="
            color: #1e90ff;
            text-decoration: none;
            font-size: 18px;
        ">learn more</a>
    `;
    document.body.appendChild(textDiv);

    const onClick = (event) => {
        if (!this.pipe) return;

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, this.camera);
        const intersects = raycaster.intersectObject(this.pipe, true);

        if (intersects.length > 0) {
            textVisible = !textVisible;
            textDiv.style.display = textVisible ? 'block' : 'none';
            
            outlined = !outlined;

        
            this.pipe.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (outlined) {
                        child.material.emissive = new THREE.Color(0xffff00);
                        child.material.emissiveIntensity = 0.2;
                    } else {
                        child.material.emissive.set(0x000000);
                    }
                }
            });
        }
    };

    window.addEventListener('click', onClick);
}







//centrifugalpumps

setupCentrifugalPumpsClickHandler() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let textVisible = false;
    let outlined = false;

    
    const textDiv = document.createElement('div');
    textDiv.style.position = 'absolute';
    textDiv.style.top = '100px';
    textDiv.style.left = '50%';
    textDiv.style.transform = 'translateX(-50%)';
    textDiv.style.color = '#000000ff';
    textDiv.style.fontFamily = 'Arial, sans-serif';
    textDiv.style.fontSize = '22px';
    textDiv.style.textAlign = 'center';
    textDiv.style.userSelect = 'none';
    textDiv.style.display = 'none';
    textDiv.innerHTML = `
        <div>Centrifugal pumps</div>
        <br>
        <div> جهاز الطرد المركزي </div>
        <a href="https://en.wikipedia.org/wiki/Centrifugal_pump" target="_blank" style="
            color: #1e90ff;
            text-decoration: none;
            font-size: 18px;
        ">learn more</a>
    `;
    document.body.appendChild(textDiv);

    const onClick = (event) => {
        if (!this.CentrifugalPump) return;

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

       


 
         raycaster.setFromCamera(pointer, this.camera);
        const intersects = raycaster.intersectObject(this.CentrifugalPump, true);
      
 if (intersects.length > 0) {
            textVisible = !textVisible;
            textDiv.style.display = textVisible ? 'block' : 'none';
    
           outlined = !outlined;
 
            this.CentrifugalPump.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (outlined) {
                        child.material.emissive = new THREE.Color(0x008000);
                        child.material.emissiveIntensity = 0.8;
                    } else {
                        child.material.emissive.set(0x000000);
                    }
                }
            });
        }
    };










    window.addEventListener('click', onClick);
}



setupPressureTubeClickHandler() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let textVisible = false;
    let outlined = false;

   
    const textDiv = document.createElement('div');
    textDiv.style.position = 'absolute';
    textDiv.style.top = '100px';
    textDiv.style.left = '50%';
    textDiv.style.transform = 'translateX(-50%)';
    textDiv.style.color = '#000000ff';
    textDiv.style.fontFamily = 'Arial, sans-serif';
    textDiv.style.fontSize = '22px';
    textDiv.style.textAlign = 'center';
    textDiv.style.userSelect = 'none';
    textDiv.style.display = 'none';
    textDiv.innerHTML = `
        <div>pressure tube</div>
        <a href="https://en.wikipedia.org/wiki/Pressure_vessel" target="_blank" style="
            color: #1e90ff;
            text-decoration: none;
            font-size: 18px;
        ">learn more</a>
    `;
    document.body.appendChild(textDiv);

    const onClick = (event) => {
        if (!this.pressureTube) return;

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      

         raycaster.setFromCamera(pointer, this.camera);
        const intersects = raycaster.intersectObject(this.pressureTube, true);
      
 if (intersects.length > 0) {
            textVisible = !textVisible;
            textDiv.style.display = textVisible ? 'block' : 'none';
    
           outlined = !outlined;
   
            this.pressureTube.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (outlined) {
                         child.material.emissive = new THREE.Color(0xffff00);
                        child.material.emissiveIntensity = 0.2;
                    } else {
                        child.material.emissive.set(0x000000);
                    }
                }
            });
        }
    };






    window.addEventListener('click', onClick);
}




          


    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { Ro };

