import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OrbitControls} from './module/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './module/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from './module/jsm/loaders/RGBELoader.js';
import {RoughnessMipmapper} from './module/jsm/utils/RoughnessMipmapper.js';

let camera, scene, renderer, currentIntersection;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2()

init();
render();


function init() {

    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    camera.position.set(-1.8, 0.6, 2.7);

    scene = new THREE.Scene();

    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath('textures/equirectangular/')
        .load('royal_esplanade_1k.hdr', function (texture) {

            const envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();

            render();

            // model

            // use of RoughnessMipmapper is optional
            const roughnessMipmapper = new RoughnessMipmapper(renderer);

            const loader = new GLTFLoader().setPath('models/gltf/DamagedHelmet/glTF/');
            loader.load('DamagedHelmet.gltf', function (gltf) {

                gltf.scene.traverse(function (child) {

                    if (child.isMesh) {

                        // TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
                        // roughnessMipmapper.generateMipmaps( child.material );

                    }

                });
                console.log(gltf)
                scene.add(gltf.scene);

                roughnessMipmapper.dispose();

                render();

            });

        });

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 5;
    controls.maxDistance = 18;
    controls.target.set(0, 0, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize);

    renderer.domElement.addEventListener('click', onClick, false);

    function onClick() {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0 && intersects[0].object.name !== '') {
            console.log('Intersection:', intersects[0]);
            // controls.dollyOut(5);
            // scene.add(loadFont())
            // controls.update();
            scene.remove(text)
            loadFont(intersects[0].object);
        }
    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

var text = false;
var textGeo;
var cubeMat = new THREE.MeshLambertMaterial({color: 0xff3300});

function loadFont(object,camera) {
    var loader = new THREE.FontLoader();
    loader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/gentilis_regular.typeface.json",
        function (res) {
            // return createText(res)
            createText(res, object)
        }
    );
}

function createText(font, object) {
    textGeo = new THREE.TextGeometry("Click object", {
        font: font,
        size: 1,
        height: 0.5,
        curveSegments: 1,
        bevelEnabled: false,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
    });
    // textGeo.center();
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();
    // textGeo.center();
    text = new THREE.Mesh(textGeo, cubeMat);

    text.position.x = -textGeo.boundingBox.max.x / 2;
    text.position.y = object.up.y;
    text.position.z = object.position.z;

    scene.add(text)
    render()
}



function render() {
    console.log(`render`)
    renderer.render(scene, camera);
}


