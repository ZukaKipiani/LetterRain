// Matter.js module aliases
const { Engine, Render, World, Bodies, Body, Events, Mouse, MouseConstraint } = Matter;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer
let canvas = document.getElementById('canvas');
const renderer = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#ffffff'
    }
});

// Create boundaries
const wallThickness = 50;
let leftWall, rightWall, ground;

function createBoundaries() {
    if (leftWall) World.remove(world, leftWall);
    if (rightWall) World.remove(world, rightWall);
    if (ground) World.remove(world, ground);

    leftWall = Bodies.rectangle(0, window.innerHeight / 2, wallThickness, window.innerHeight, { isStatic: true });
    rightWall = Bodies.rectangle(window.innerWidth, window.innerHeight / 2, wallThickness, window.innerHeight, { isStatic: true });
    ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, wallThickness, { isStatic: true });

    World.add(world, [leftWall, rightWall, ground]);
}

createBoundaries();

// Create mouse constraint
const mouse = Mouse.create(renderer.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

World.add(world, mouseConstraint);

// Keep the mouse in sync with rendering
renderer.mouse = mouse;

// Create letters
const letters = [];

function createLetter(char) {
    const size = 30;
    const letter = Bodies.rectangle(
        Math.random() * (window.innerWidth - size) + size / 2,
        0,
        size,
        size,
        {
            render: {
                fillStyle: '#000000',
                text: {
                    content: char,
                    color: '#ffffff',
                    size: 20,
                    family: 'Arial'
                }
            }
        }
    );
    letters.push(letter);
    World.add(world, letter);
}

// Handle window resize
window.addEventListener('resize', () => {
    renderer.canvas.width = window.innerWidth;
    renderer.canvas.height = window.innerHeight;
    Render.setPixelRatio(renderer, window.devicePixelRatio);
    createBoundaries();
});

// Handle key presses
document.addEventListener('keypress', (event) => {
    if (event.key.match(/[a-z]/i)) {
        createLetter(event.key.toUpperCase());
    }
});

// Run the engine
Engine.run(engine);
Render.run(renderer);

// Handle continuous resizing
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

Events.on(engine, 'afterUpdate', () => {
    if (window.innerWidth !== lastWidth || window.innerHeight !== lastHeight) {
        const scaleX = window.innerWidth / lastWidth;
        const scaleY = window.innerHeight / lastHeight;

        renderer.canvas.width = window.innerWidth;
        renderer.canvas.height = window.innerHeight;
        Render.setPixelRatio(renderer, window.devicePixelRatio);
        createBoundaries();

        letters.forEach(letter => {
            Body.scale(letter, scaleX, scaleY);
            Body.setPosition(letter, {
                x: letter.position.x * scaleX,
                y: letter.position.y * scaleY
            });
        });

        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
    }
});