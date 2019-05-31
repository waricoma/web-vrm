window.addEventListener('DOMContentLoaded', () => {
  const GLTFLoader = new THREE.GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  const fontLoader = new THREE.FontLoader();

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas')
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf1f2f6 );

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    1,
    100000000
  );
  camera.position.set(0, 0, +1000);

  const controls = new THREE.OrbitControls(camera);

  const whiteDirectionalLight = new THREE.DirectionalLight(0xffffff);
  whiteDirectionalLight.intensity = 2;
  whiteDirectionalLight.position.set(1, 1, 1);
  scene.add(whiteDirectionalLight);

  const boxGeometry = new THREE.BoxGeometry(500, 500, 500);
  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);

  const blueMaterial = new THREE.MeshStandardMaterial({
    color: 0x0097e6
  });
  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f2f6
  });

  const blueBoxMesh = new THREE.Mesh(boxGeometry, blueMaterial);
  blueBoxMesh.position.set(0, 1500, 0);
  // scene.add(blueBoxMesh);

  let kitModel;
  GLTFLoader.load(
    'KIT.vrm',
    ( gltf ) => {
      kitModel = gltf.scene;
      kitModel.name = 'kit_model';
      kitModel.scale.set(400.0, 400.0, 400.0);
      kitModel.position.set(0, 0, 0);
      kitModel.rotation.set(0, 180*Math.PI/180, 0);
      scene.add( gltf.scene );
    },
    ( err ) => {
      console.log('An error happened', err);
    }
  );

  let kitPlane;
  textureLoader.load(
    'img/kit2x20.png',
    (kitTex) => {
      const kitPlaneGeometry = new THREE.PlaneGeometry(1, 1);
      const kitMaterial = new THREE.MeshPhongMaterial({
        map: kitTex,
        transparent: true
      });
      kitPlane = new THREE.Mesh( kitPlaneGeometry, kitMaterial );
      kitPlane.scale.set(kitTex.image.width, kitTex.image.height, 1);
      kitPlane.rotation.set(-90*Math.PI/180, 0, 0);
      kitPlane.position.set(0, 0, 0);
      scene.add(kitPlane);

      controls.update();
      renderer.render(scene, camera);
    }
  );

  fontLoader.load('helvetiker_regular.typeface.json', (helvetikerFont) => {
    const textDormMesh = new THREE.Mesh(new THREE.TextGeometry(
      'Is Dorm in blackout?',
      {
        font: helvetikerFont,
        size: 120,
        height: 50,
        curveSegments: 50
      }
    ), blueMaterial);
    textDormMesh.position.set(-1000, 700, -300);
    scene.add(textDormMesh);

    const textRMesh = new THREE.Mesh(new THREE.TextGeometry(
      'R: OK',
      {
        font: helvetikerFont,
        size: 120,
        height: 50,
        curveSegments: 50
      }
    ), blueMaterial);
    textRMesh.position.set(-1000, 500, -300);
    scene.add(textRMesh);

    const textV2AndMMesh = new THREE.Mesh(new THREE.TextGeometry(
      'V2 and M: OK',
      {
        font: helvetikerFont,
        size: 120,
        height: 50,
        curveSegments: 50
      }
    ), blueMaterial);
    textV2AndMMesh.position.set(-1000, 300, -300);
    scene.add(textV2AndMMesh);
  });

  renderer.render(scene, camera);

  let sampleMotion = [];
  let start = -5;
  let end = -20;
  for (let i = start; i >= end; i-=0.1) {
    sampleMotion.push(i*Math.PI/180);
  }
  for (let i = end; i <= start; i+=0.1) {
    sampleMotion.push(i*Math.PI/180);
  }
  let sampleMotionProgress = 0;

  const tick = () => {
    requestAnimationFrame(tick);
    controls.update();

    // blueBoxMesh.rotation.x += 0.01;
    // blueBoxMesh.rotation.y += 0.01;

    if (kitPlane) {
      kitPlane.rotation.z += 0.01;
    }

    scene.traverse((obj) => {
      switch (obj.name) {
        case 'J_Bip_R_UpperArm': // 右肩
          obj.rotation.z = -1.2;
          break;
        case 'J_Bip_L_Hand': // 左手首
          obj.rotation.x = 90*Math.PI/180;
          break;
        case 'J_Bip_L_Shoulder': // 左肩
          sampleMotionProgress++;
          obj.rotation.z = sampleMotion[sampleMotionProgress];
          if (sampleMotion.length === sampleMotionProgress) {
            sampleMotionProgress = 0;
          }
          break;
      }
    });

    renderer.render(scene, camera);
  };
  tick();

  window.addEventListener('resize', () => {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
});

/*
model_with_cloth
Root
Global
Position
J_Bip_C_Hips
J_Bip_C_Spine
J_Bip_C_Chest
J_Bip_C_UpperChest
J_Sec_L_Bust1
J_Sec_L_Bust2
J_Sec_R_Bust1
J_Sec_R_Bust2
J_Bip_C_Neck
J_Bip_C_Head
J_Adj_L_FaceEyeSet
J_Adj_L_FaceEye
J_Adj_R_FaceEyeSet
J_Adj_R_FaceEye
HairJoint-fc4d05b0-28fe-4aae-b3ba-f2f037d819a8
HairJoint-b330fbb5-2e4c-41ea-b420-662f9064e1be
HairJoint-6b25b976-97ba-4ca7-be85-30c8cc39d1a1
HairJoint-2ae99813-049f-4d7c-98fb-473dbba830d2
HairJoint-f39413c2-dc45-4a63-944d-5f614cf3af4e
HairJoint-c1ead540-8658-4c7c-90e5-8b81ecba92a7
HairJoint-1aff8eb0-02b3-4dc8-b4d5-e0ff2cd1b342
HairJoint-8d2612c5-7a7d-48af-8acc-8eff68b195d7
HairJoint-aca5681b-4237-4aa0-9bb6-1501889553b8
HairJoint-ce6dcc9a-c787-4909-acbe-637d232e33e0
J Bip L Shoulder
J Bip L Upper Arm
J Sec L Upper Arm
J Bip L Lower Arm
J Sec L Lower Arm
J Bip L Hand
J Bip L Index 1
J Bip L Index 2
J Bip L Index 3
J Bip L Index 3_end
J Bip L Little 1
J Bip L Little 2
J Bip L Little 3
J Bip L Little 3_end
J Bip L Middle 1
J Bip L Middle 2
J Bip L Middle 3
J Bip L Middle 3_end
J Bip L Ring 1
J Bip L Ring 2
J Bip L Ring 3
J Bip L Ring 3_end
J Bip L Thumb 1
J Bip L Thumb 2
J Bip L Thumb 3
J Bip L Thumb 3_end
Hairs
Hair001
Hair001.baked_0
Hair001.baked_1
Hair001.baked_2
Hair001.baked_3
Hair001.baked_4
Hair001.baked_5
Hair001.baked_6
Hair001.baked_7
Hair001.baked_8
Hair001.baked_9
Hair001.baked_10
Hair001.baked_11
Hair001.baked_12
Hair001.baked_13
Hair001.baked_14
Hair001.baked_15
Hair001.baked_16
Hair001.baked_17
Hair001.baked_18
Hair001.baked_19
Hair001.baked_20
Hair001.baked_21
Hair001.baked_22
Hair001.baked_23
Hair001.baked_24
Hair001.baked_25
Hair001.baked_26
Hair001.baked_27
Hair001.baked_28
Hair001.baked_29
Hair001.baked_30
Hair001.baked_31
Hair001.baked_32
Hair001.baked_33
Hair001.baked_34
Hair001.baked_35
Hair001.baked_36
Hair001.baked_37
Hair001.baked_38
Hair001.baked_39
Hair001.baked_40
Hair001.baked_41
Hair001.baked_42
Hair001.baked_43
Hair001.baked_44
Hair001.baked_45
Hair001.baked_46
Hair001.baked_47
Hair001.baked_48
Hair001.baked_49
Hair001.baked_50
Hair001.baked_51
Hair001.baked_52
Hair001.baked_53
Hair001.baked_54
Hair001.baked_55
Hair001.baked_56
Hair001.baked_57
Hair001.baked_58
Hair001.baked_59
Hair001.baked_60
Hair001.baked_61
Hair001.baked_62
Hair001.baked_63
Hair001.baked_64
Hair001.baked_65
Hair001.baked_66
Hair001.baked_67
Hair001.baked_68
Hair001.baked_69
Hair001.baked_70
Hair001.baked_71
Hair001.baked_72
Hair001.baked_73
Hair001.baked_74
Hair001.baked_75
Hair001.baked_76
Hair001.baked_77
Hair001.baked_78
Hair001.baked_79
Hair001.baked_80
Hair001.baked_81
secondary
Face
Face.baked_0
Face.baked_1
Face.baked_2
Face.baked_3
Face.baked_4
Face.baked_5
Face.baked_6
Face.baked_7
Face.baked_8
Face.baked_9
Body
Body.baked_0
Body.baked_1
Body.baked_2
Body.baked_3
Body.baked_4
Body.baked_5
Body.baked_6
Body.baked_7
*/

/*
Yumi Nakahara
Ay Norakmolika
Chanvesna Ma
Chea Rika
Eishin Ono
Momoka Miyazaki
Sokhom Chhun
Srey Chanreaksmey
Theavymann
Vong Siev Ing
Wakaba Miura
 */
