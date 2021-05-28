import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OrbitControls} from './module/jsm/controls/OrbitControls.js';
import {ColladaLoader} from "./module/jsm/loaders/ColladaLoader.js";

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(1.3, window.innerWidth / window.innerHeight, 0.25, 2000);
const controls = new OrbitControls(camera, canvas);

function main() {
    const mouse = new THREE.Vector2()
    const raycaster = new THREE.Raycaster();
    let cameraAnimate = false
    let lastBuildOnClick = ''

    renderer.setPixelRatio(window.devicePixelRatio);

    camera.position.set(0, 75, 200);

    controls.zoomSpeed = 2.0;
    controls.panSpeed = 0.5;
    controls.update()

    scene.background = new THREE.Color('0xe0e0e0');
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 0).normalize();
    scene.add(directionalLight);


    const colladaLoader = new ColladaLoader()
    colladaLoader.load('upload/uploads_files_969463_building_collection_dae.dae', function (builds) {
        const buildModel = builds.scene
        buildModel.scale.x = 0.05
        buildModel.scale.y = 0.05
        buildModel.scale.z = 0.05
        buildModel.position.x = -3
        buildModel.position.z = -2
        buildModel.children[0].children.map((item) => {
            item.positionScale = CameraPositionScale(item.name)
        })
        scene.add(buildModel)
    })

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    renderer.domElement.addEventListener('click', onClick, false);

    function onClick() {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0 && intersects[0].object.name !== '' && !cameraAnimate && lastBuildOnClick !== intersects[0].object.name) {
            cameraAnimate = true

            const build = intersects[0].object;
            lastBuildOnClick = build.name
            let buildScale = build.positionScale

            let buildBox3 = new THREE.Box3().setFromObject(intersects[0].object);
            let buildCenter = buildBox3.getCenter(new THREE.Vector3());
            let buildSize = buildBox3.getSize(new THREE.Vector3());

            gsap.to(controls.target, {
                ease: "power2.in",
                duration: 0.5,
                x: buildCenter.x,
                y: buildCenter.y,
                z: (buildCenter.z + buildSize.z),
                onUpdate: function () {
                    controls.update();
                }
            });

            gsap.to(camera.position, {
                duration: 1,
                x: buildCenter.x + buildScale.x,
                y: buildCenter.y + buildScale.y,
                z: (buildCenter.z + buildSize.z) + buildScale.z,
                onUpdate: function () {
                    camera.lookAt(buildCenter);
                    controls.update();
                },
                onComplete: function () {
                    controls.update();
                    cameraAnimate = false
                },
            });

        }
    }


    requestAnimationFrame(render);
}

main();

function CameraPositionScale(name) {
    switch (name) {
        case 'Box01_ncl1_1':
            return {x: 75, y: 20, z: -100}
        case 'Box01_ncl1_3':
            return {x: 40, y: 20, z: 75}
        case 'Box01_ncl1_4':
            return {x: 20, y: 5, z: 75}
        case 'Box02':
            return {x: 20, y: 5, z: 75}
        case 'Box03':
            return {x: 20, y: 5, z: 75}
        case 'Box01_ncl1_2':
            return {x: -70, y: 5, z: 60}
        case 'Box01':
            return {x: -75, y: 20, z: -150}
        default :
            return null
    }
}
