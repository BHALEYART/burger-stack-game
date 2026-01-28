import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const GAME_STATE_MENU = 0;
const GAME_STATE_PLAYING = 1;
const GAME_STATE_GAMEOVER = 2;

const BLOCK_HEIGHT = 2;
const INITIAL_BLOCK_SIZE = 10;
const INITIAL_SPEED = 0.12;
const SPEED_INCREMENT = 0.025;
const SPEED_INCREASE_EVERY = 8;
const PERFECT_EPSILON = 0.05;
const MAX_COMEBACK_SIZE = 10;
const STREAK_FOR_COMEBACK = 3;
const CAMERA_OFFSET_Y = 18;
const CAMERA_OFFSET_Z = 22;

const BURGER_LAYERS = [
    [
        { height: 0.5, color: 0x8B4513, name: 'Bottom Bun' },
        { height: 0.7, color: 0x8B0000, name: 'Patty' },
        { height: 0.3, color: 0x006400, name: 'Lettuce' },
        { height: 0.5, color: 0xF4A460, name: 'Top Bun' }
    ],
    [
        { height: 0.5, color: 0x8B4513, name: 'Bottom Bun' },
        { height: 0.7, color: 0x8B0000, name: 'Patty' },
        { height: 0.3, color: 0xFFD700, name: 'Cheese' },
        { height: 0.3, color: 0x006400, name: 'Lettuce' },
        { height: 0.5, color: 0xF4A460, name: 'Top Bun' }
    ],
    [
        { height: 0.5, color: 0x8B4513, name: 'Bottom Bun' },
        { height: 0.7, color: 0x8B0000, name: 'Patty' },
        { height: 0.1, color: 0xD3D3D3, name: 'Pickle' },
        { height: 0.7, color: 0x8B0000, name: 'Patty' },
        { height: 0.5, color: 0xF4A460, name: 'Top Bun' }
    ],
    [
        { height: 0.5, color: 0x8B4513, name: 'Bottom Bun' },
        { height: 0.7, color: 0x8B0000, name: 'Patty' },
        { height: 0.2, color: 0xFF6347, name: 'Tomato' },
        { height: 0.15, color: 0xDA70D6, name: 'Onion' },
        { height: 0.3, color: 0x006400, name: 'Lettuce' },
        { height: 0.5, color: 0xF4A460, name: 'Top Bun' }
    ]
];

let renderer, scene, camera, ambientLight, dirLight;
let blocks = [];
let cutPieces = [];
let activeBlock = null;
let lastBlock = null;
let direction = 1;
let moveAxis = 'x';
let blockSpeed = INITIAL_SPEED;
let score = 0;
let highScore = 0;
let gameState = GAME_STATE_MENU;
let perfectStreak = 0;
let flashMesh = null;
let flashTimer = 0;
let backgroundColor = new THREE.Color();
let baseHue = 200;
let topHue = 220;

// Audio - Custom music file
let backgroundMusic = null;
let isMuted = false;
let musicDuration = 0;

const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'absolute';
scoreDiv.style.top = '32px';
scoreDiv.style.width = '100%';
scoreDiv.style.textAlign = 'center';
scoreDiv.style.fontFamily = 'Arial, sans-serif';
scoreDiv.style.fontSize = '48px';
scoreDiv.style.fontWeight = 'bold';
scoreDiv.style.color = '#fff';
scoreDiv.style.textShadow = '0 2px 8px #000a';
scoreDiv.style.pointerEvents = 'none';
scoreDiv.style.display = 'none';
document.body.appendChild(scoreDiv);

const gameOverDiv = document.createElement('div');
gameOverDiv.style.position = 'absolute';
gameOverDiv.style.top = '45%';
gameOverDiv.style.width = '100%';
gameOverDiv.style.textAlign = 'center';
gameOverDiv.style.fontFamily = 'Arial, sans-serif';
gameOverDiv.style.fontSize = '36px';
gameOverDiv.style.color = '#fff';
gameOverDiv.style.textShadow = '0 2px 8px #000a';
gameOverDiv.style.display = 'none';
gameOverDiv.style.pointerEvents = 'none';
document.body.appendChild(gameOverDiv);

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function getGradientColor(t) {
    const h = lerp(baseHue, topHue, t);
    backgroundColor.setHSL(h / 360, 0.2, 0.3);
    return backgroundColor.getStyle();
}

function getBurgerTotalHeight(burgerTypeIndex) {
    const burgerConfig = BURGER_LAYERS[burgerTypeIndex % BURGER_LAYERS.length];
    return burgerConfig.reduce((sum, layer) => sum + layer.height, 0);
}

function createSimpleBlock(width, height, depth, color, x = 0, y = 0, z = 0) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createBlock(width, depth, y, burgerTypeIndex, x = 0, z = 0) {
    const burgerGroup = new THREE.Group();
    const burgerConfig = BURGER_LAYERS[burgerTypeIndex % BURGER_LAYERS.length];
    const totalBurgerHeight = getBurgerTotalHeight(burgerTypeIndex);
    let currentRelativeHeight = -totalBurgerHeight / 2;

    burgerConfig.forEach(layer => {
        const layerMesh = createSimpleBlock(width, layer.height, depth, layer.color, 0, currentRelativeHeight + layer.height / 2, 0);
        burgerGroup.add(layerMesh);
        currentRelativeHeight += layer.height;
    });

    burgerGroup.position.set(x, y, z);
    return burgerGroup;
}

function createFlashOutline(width, depth, y) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -depth / 2);
    shape.lineTo(width / 2, -depth / 2);
    shape.lineTo(width / 2, depth / 2);
    shape.lineTo(-width / 2, depth / 2);
    shape.lineTo(-width / 2, -depth / 2);
    const geometry = new THREE.BufferGeometry().setFromPoints(shape.getPoints());
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, transparent: true, opacity: 1 });
    const line = new THREE.Line(geometry, material);
    line.position.y = y + BLOCK_HEIGHT / 2 + 0.07;
    line.renderOrder = 2;
    return line;
}

function updateScoreDisplay() {
    scoreDiv.innerText = score;
}

function showGameOver() {
    let wonGame = false;
    if (backgroundMusic && musicDuration > 0) {
        wonGame = backgroundMusic.currentTime >= musicDuration;
    }
    
    const message = wonGame ? 
        `🎉 YOU BEAT THE SONG! 🎉<br>Score: ${score}<br>High Score: ${highScore}` :
        `Game Over!<br>Score: ${score}<br>High Score: ${highScore}`;
    
    gameOverDiv.innerHTML = `${message}<br><span style="font-size:24px;">Tap to Restart</span>`;
    gameOverDiv.style.display = '';
    
    const youtubeButton = document.getElementById('youtubeButton');
    if (youtubeButton) {
        youtubeButton.classList.add('visible');
    }
}

function hideGameOver() {
    gameOverDiv.style.display = 'none';
    const youtubeButton = document.getElementById('youtubeButton');
    if (youtubeButton) {
        youtubeButton.classList.remove('visible');
    }
}

function resetGame() {
    while (blocks.length) {
        const b = blocks.pop();
        scene.remove(b.mesh);
        b.mesh.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
    while (cutPieces.length) {
        const c = cutPieces.pop();
        scene.remove(c.mesh);
        c.mesh.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
    if (activeBlock) {
        scene.remove(activeBlock.mesh);
        activeBlock.mesh.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        activeBlock = null;
    }
    if (flashMesh) {
        scene.remove(flashMesh);
        flashMesh.geometry.dispose();
        flashMesh.material.dispose();
        flashMesh = null;
    }
    score = 0;
    blockSpeed = INITIAL_SPEED;
    perfectStreak = 0;
    direction = 1;
    moveAxis = 'x';
    backgroundColor.setStyle(getGradientColor(0));
    renderer.setClearColor(backgroundColor);
    hideGameOver();
    setupTower();
    spawnNextBlock();
    updateScoreDisplay();
}

function setupTower() {
    const burgerTypeIndex = 0;
    const totalBurgerHeight = getBurgerTotalHeight(burgerTypeIndex);
    const mesh = createBlock(INITIAL_BLOCK_SIZE, INITIAL_BLOCK_SIZE, totalBurgerHeight / 2, burgerTypeIndex);
    scene.add(mesh);
    blocks.push({
        mesh: mesh,
        width: INITIAL_BLOCK_SIZE,
        depth: INITIAL_BLOCK_SIZE,
        x: 0,
        z: 0,
        y: totalBurgerHeight / 2,
        burgerTypeIndex: burgerTypeIndex,
        burgerHeight: totalBurgerHeight
    });
    lastBlock = blocks[blocks.length - 1];
}

function spawnNextBlock() {
    const prev = blocks[blocks.length - 1];
    let width = prev.width;
    let depth = prev.depth;
    let x = prev.x, z = prev.z;
    const burgerTypeIndex = Math.floor(Math.random() * BURGER_LAYERS.length);
    const totalBurgerHeight = getBurgerTotalHeight(burgerTypeIndex);
    let y = prev.y + prev.burgerHeight / 2 + totalBurgerHeight / 2;
    if (moveAxis === 'x') {
        x = -18 * direction;
    } else {
        z = -18 * direction;
    }
    const mesh = createBlock(width, depth, y, burgerTypeIndex, x, z);
    scene.add(mesh);
    activeBlock = {
        mesh: mesh,
        width: width,
        depth: depth,
        x: x,
        z: z,
        y: y,
        direction: direction,
        moveAxis: moveAxis,
        speed: blockSpeed,
        state: 'sliding',
        burgerTypeIndex: burgerTypeIndex,
        burgerHeight: totalBurgerHeight
    };
}

function dropActiveBlock() {
    if (!activeBlock || activeBlock.state !== 'sliding') return;
    activeBlock.state = 'dropping';
    const prev = blocks[blocks.length - 1];
    let overlap, cutLeft = 0, cutRight = 0, cutFront = 0, cutBack = 0;
    let axis = activeBlock.moveAxis;
    let perfect = false;
    let offset = 0;
    if (axis === 'x') {
        offset = activeBlock.x - prev.x;
        overlap = activeBlock.width - Math.abs(offset);
        if (Math.abs(offset) < PERFECT_EPSILON) {
            perfect = true;
            overlap = activeBlock.width;
        }
        if (overlap <= 0) {
            missBlock();
            return;
        }
        cutLeft = offset > 0 ? offset : 0;
        cutRight = offset < 0 ? -offset : 0;
    } else {
        offset = activeBlock.z - prev.z;
        overlap = activeBlock.depth - Math.abs(offset);
        if (Math.abs(offset) < PERFECT_EPSILON) {
            perfect = true;
            overlap = activeBlock.depth;
        }
        if (overlap <= 0) {
            missBlock();
            return;
        }
        cutFront = offset > 0 ? offset : 0;
        cutBack = offset < 0 ? -offset : 0;
    }
    if (perfect) {
        perfectStreak++;
        flashTimer = 0.3;
        if (flashMesh) {
            scene.remove(flashMesh);
            flashMesh.geometry.dispose();
            flashMesh.material.dispose();
            flashMesh = null;
        }
        flashMesh = createFlashOutline(activeBlock.width, activeBlock.depth, activeBlock.y);
        scene.add(flashMesh);
        if (perfectStreak >= STREAK_FOR_COMEBACK) {
            if (axis === 'x') {
                activeBlock.width = Math.min(MAX_COMEBACK_SIZE, INITIAL_BLOCK_SIZE);
            } else {
                activeBlock.depth = Math.min(MAX_COMEBACK_SIZE, INITIAL_BLOCK_SIZE);
            }
            perfectStreak = 0;
        }
    } else {
        perfectStreak = 0;
        if (axis === 'x') {
            if (cutLeft > 0) createCutPiece('x', activeBlock, cutLeft, 1, activeBlock.burgerTypeIndex);
            if (cutRight > 0) createCutPiece('x', activeBlock, cutRight, -1, activeBlock.burgerTypeIndex);
            activeBlock.width = overlap;
            activeBlock.x = prev.x + offset / 2;
        } else {
            if (cutFront > 0) createCutPiece('z', activeBlock, cutFront, 1, activeBlock.burgerTypeIndex);
            if (cutBack > 0) createCutPiece('z', activeBlock, cutBack, -1, activeBlock.burgerTypeIndex);
            activeBlock.depth = overlap;
            activeBlock.z = prev.z + offset / 2;
        }
    }
    
    while(activeBlock.mesh.children.length > 0) {
        const child = activeBlock.mesh.children[0];
        activeBlock.mesh.remove(child);
        child.geometry.dispose();
        child.material.dispose();
    }

    const burgerConfig = BURGER_LAYERS[activeBlock.burgerTypeIndex % BURGER_LAYERS.length];
    const totalBurgerHeight = activeBlock.burgerHeight;
    let currentRelativeHeight = -totalBurgerHeight / 2;

    burgerConfig.forEach(layer => {
        const layerMesh = createSimpleBlock(activeBlock.width, layer.height, activeBlock.depth, layer.color, 0, currentRelativeHeight + layer.height / 2, 0);
        activeBlock.mesh.add(layerMesh);
        currentRelativeHeight += layer.height;
    });

    activeBlock.mesh.position.set(activeBlock.x, activeBlock.y, activeBlock.z);
    
    blocks.push({
        mesh: activeBlock.mesh,
        width: activeBlock.width,
        depth: activeBlock.depth,
        x: activeBlock.x,
        z: activeBlock.z,
        y: activeBlock.y,
        burgerTypeIndex: activeBlock.burgerTypeIndex,
        burgerHeight: activeBlock.burgerHeight
    });
    
    lastBlock = blocks[blocks.length - 1];
    activeBlock = null;
    score++;
    updateScoreDisplay();
    if (score % SPEED_INCREASE_EVERY === 0) blockSpeed += SPEED_INCREMENT;
    direction *= -1;
    moveAxis = moveAxis === 'x' ? 'z' : 'x';
    setTimeout(spawnNextBlock, 130);
}

function missBlock() {
    activeBlock.state = 'falling';
    activeBlock.fallVelocity = -0.7;
    activeBlock.fallTimer = 0;
    if (score > highScore) {
        highScore = score;
    }
    gameState = GAME_STATE_GAMEOVER;
    stopMusic();
    showGameOver();
}

function createCutPiece(axis, block, cutSize, dir, burgerTypeIndex) {
    const burgerGroup = new THREE.Group();
    const burgerConfig = BURGER_LAYERS[burgerTypeIndex % BURGER_LAYERS.length];
    const totalBurgerHeight = getBurgerTotalHeight(burgerTypeIndex);
    let currentRelativeHeight = -totalBurgerHeight / 2;

    let newWidth = block.width;
    let newDepth = block.depth;
    let newX = block.x;
    let newZ = block.z;

    if (axis === 'x') {
        newWidth = cutSize;
        newX = block.x + dir * (block.width / 2 + cutSize / 2);
    } else {
        newDepth = cutSize;
        newZ = block.z + dir * (block.depth / 2 + cutSize / 2);
    }

    burgerConfig.forEach(layer => {
        const layerMesh = createSimpleBlock(newWidth, layer.height, newDepth, layer.color, 0, currentRelativeHeight + layer.height / 2, 0);
        burgerGroup.add(layerMesh);
        currentRelativeHeight += layer.height;
    });

    burgerGroup.position.set(newX, block.y, newZ);
    scene.add(burgerGroup);
    cutPieces.push({
        mesh: burgerGroup,
        velocity: new THREE.Vector3(
            axis === 'x' ? 0.17 * dir : 0,
            -0.38,
            axis === 'z' ? 0.17 * dir : 0
        )
    });
}

function updateCutPieces(dt) {
    for (let i = cutPieces.length - 1; i >= 0; i--) {
        const c = cutPieces[i];
        c.mesh.position.addScaledVector(c.velocity, dt * 60);
        c.velocity.y -= 0.022 * dt * 60;
        if (c.mesh.position.y < -40) {
            scene.remove(c.mesh);
            c.mesh.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            cutPieces.splice(i, 1);
        }
    }
}

function updateFlash(dt) {
    if (flashMesh) {
        flashTimer -= dt;
        if (flashTimer <= 0) {
            scene.remove(flashMesh);
            flashMesh.geometry.dispose();
            flashMesh.material.dispose();
            flashMesh = null;
        } else {
            flashMesh.material.opacity = Math.max(0, flashTimer / 0.3);
        }
    }
}

// Music functions - Custom audio file
function initMusic() {
    if (!backgroundMusic) {
        backgroundMusic = new Audio('./music.mp3');
        backgroundMusic.loop = false;
        backgroundMusic.volume = 0.5;
        
        backgroundMusic.addEventListener('loadedmetadata', () => {
            musicDuration = backgroundMusic.duration;
        });
        
        backgroundMusic.addEventListener('ended', () => {
            if (gameState === GAME_STATE_PLAYING) {
                if (score > highScore) {
                    highScore = score;
                }
                gameState = GAME_STATE_GAMEOVER;
                showGameOver();
            }
        });
    }
}

function startMusic() {
    if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => {
            console.log('Audio play may require user interaction first:', err);
        });
    }
}

function stopMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

function toggleMute() {
    isMuted = !isMuted;
    if (backgroundMusic) {
        backgroundMusic.muted = isMuted;
    }
    const muteButton = document.getElementById('muteButton');
    if (muteButton) {
        muteButton.textContent = isMuted ? '🔇' : '🔊';
    }
}

function animate(time) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.035, renderer.info.render.frame ? (time - renderer.info.render.frame) / 1000 : 0.016);
    renderer.info.render.frame = time;
    
    if (gameState === GAME_STATE_PLAYING) {
        if (activeBlock && activeBlock.state === 'sliding') {
            let bound = 18;
            if (activeBlock.moveAxis === 'x') {
                activeBlock.x += activeBlock.speed * activeBlock.direction;
                if (activeBlock.x > bound) {
                    activeBlock.x = bound;
                    activeBlock.direction *= -1;
                }
                if (activeBlock.x < -bound) {
                    activeBlock.x = -bound;
                    activeBlock.direction *= -1;
                }
                activeBlock.mesh.position.x = activeBlock.x;
            } else {
                activeBlock.z += activeBlock.speed * activeBlock.direction;
                if (activeBlock.z > bound) {
                    activeBlock.z = bound;
                    activeBlock.direction *= -1;
                }
                if (activeBlock.z < -bound) {
                    activeBlock.z = -bound;
                    activeBlock.direction *= -1;
                }
                activeBlock.mesh.position.z = activeBlock.z;
            }
        }
        if (activeBlock && activeBlock.state === 'falling') {
            activeBlock.mesh.position.y += activeBlock.fallVelocity;
            activeBlock.fallVelocity -= 0.04;
            if (activeBlock.mesh.position.y < -40) {
                activeBlock.mesh.position.y = -40;
            }
        }
        updateCutPieces(dt);
        updateFlash(dt);
        if (blocks.length > 0) {
            const topY = blocks[blocks.length - 1].y;
            camera.position.y = lerp(camera.position.y, topY + CAMERA_OFFSET_Y, 0.08);
            camera.position.z = lerp(camera.position.z, CAMERA_OFFSET_Z + Math.max(0, (blocks.length - 12) * 0.5), 0.08);
        }
        if (score > 0) {
            let t = Math.min(1, score / 30);
            const col = getGradientColor(t);
            renderer.setClearColor(col);
        }
    }
    
    renderer.render(scene, camera);
}

function onUserInput(event) {
    if (event) {
        event.preventDefault();
    }
    
    if (gameState === GAME_STATE_PLAYING) {
        dropActiveBlock();
    } else if (gameState === GAME_STATE_GAMEOVER) {
        gameState = GAME_STATE_PLAYING;
        resetGame();
        startMusic();
    }
}

function startGame() {
    console.log('START GAME CALLED!');
    
    const startMenu = document.getElementById('startMenu');
    const muteButton = document.getElementById('muteButton');
    
    // Hide menu
    if (startMenu) {
        startMenu.classList.add('hidden');
        console.log('Menu hidden');
    }
    
    // Show game UI
    scoreDiv.style.display = 'block';
    if (muteButton) {
        muteButton.classList.add('visible');
    }
    
    // Set game state
    gameState = GAME_STATE_PLAYING;
    console.log('Game state set to PLAYING');
    
    // Initialize and start music
    initMusic();
    startMusic();
    
    // Reset and start game
    resetGame();
    
    console.log('Game started!');
}

function setupThree() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    renderer.setClearColor(getGradientColor(0));

    camera = new THREE.OrthographicCamera(
        window.innerWidth / -32,
        window.innerWidth / 32,
        window.innerHeight / 32,
        window.innerHeight / -32,
        0.1,
        1000
    );
    camera.position.set(18, CAMERA_OFFSET_Y, CAMERA_OFFSET_Z);
    camera.lookAt(0, 0, 0);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.66);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 0.72);
    dirLight.position.set(8, 40, 16);
    scene.add(dirLight);

    const bgPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshBasicMaterial({ color: 0x2c3e50, depthWrite: false })
    );
    bgPlane.position.y = -32;
    bgPlane.position.z = -60;
    scene.add(bgPlane);

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('pointerdown', onUserInput);
    renderer.domElement.addEventListener('touchstart', onUserInput, { passive: false });
    renderer.domElement.addEventListener('click', onUserInput);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    
    let lastTouchEnd = 0;
    renderer.domElement.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    console.log('Three.js setup complete');
}

function onWindowResize() {
    camera.left = window.innerWidth / -32;
    camera.right = window.innerWidth / 32;
    camera.top = window.innerHeight / 32;
    camera.bottom = window.innerHeight / -32;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// EXPOSE FUNCTIONS TO WINDOW FOR ONCLICK
window.startGameFunction = startGame;
window.toggleMuteFunction = toggleMute;

// Initialize everything
console.log('Initializing game...');
setupThree();
animate(performance.now());
console.log('Game ready! Click START GAME to play.');
