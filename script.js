// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas-container").appendChild(renderer.domElement);

// Lighting
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Helpers
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Controls
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
const transformControls = new THREE.TransformControls(camera, renderer.domElement);
scene.add(transformControls);

// Disable OrbitControls when using TransformControls
transformControls.addEventListener("mouseDown", () => {
    orbitControls.enabled = false;
});
transformControls.addEventListener("mouseUp", () => {
    orbitControls.enabled = true;
});

// Camera Position
camera.position.set(0, 3, 5);
orbitControls.update();

// Object Selection
let selectedObject = null;
function selectObject(object) {
    if (selectedObject) transformControls.detach();
    selectedObject = object;
    transformControls.attach(selectedObject);
}

// Function to Add Shapes
function addShape(type) {
    let geometry, material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });

    switch (type) {
        case 'cube': geometry = new THREE.BoxGeometry(1, 1, 1); break;
        case 'sphere': geometry = new THREE.SphereGeometry(0.5, 32, 32); break;
        case 'cylinder': geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); break;
        case 'plane': geometry = new THREE.PlaneGeometry(2, 2); break;
        case 'pyramid': geometry = new THREE.ConeGeometry(0.5, 1, 4); break;
    }

    const shape = new THREE.Mesh(geometry, material);
    shape.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, 0);
    scene.add(shape);

    shape.userData.selectable = true;
}

// Event Listeners
['cube', 'sphere', 'cylinder', 'plane', 'pyramid'].forEach(shape => {
    document.getElementById(`add${shape.charAt(0).toUpperCase() + shape.slice(1)}`).addEventListener("click", () => addShape(shape));
});

// Object Selection Handling
window.addEventListener("click", (event) => {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (const intersect of intersects) {
        if (intersect.object.userData.selectable) {
            selectObject(intersect.object);
            return;
        }
    }
});

// Keyboard Shortcuts
window.addEventListener("keydown", (event) => {
    if (selectedObject) {
        switch (event.key) {
            case "Delete":
                scene.remove(selectedObject);
                transformControls.detach();
                selectedObject = null;
                break;
            case "d":
                if (event.ctrlKey) {
                    const newObject = selectedObject.clone();
                    newObject.position.x += 1;
                    scene.add(newObject);
                }
                break;
            case "t":
                transformControls.setMode("translate");
                break;
            case "r":
                transformControls.setMode("rotate");
                break;
            case "s":
                transformControls.setMode("scale");
                break;
        }
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Resize Handling
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});