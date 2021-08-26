import RoadNetwork from './lib/roadNetwork.js';
import DrawManager from "./lib/drawManager.js";
import InteractionManager from "./lib/interactionManager.js";
import Canvas from './lib/canvas.js';

const roadNetwork: RoadNetwork = await RoadNetwork.load_road_network('./assets/sample_network.json');

const canvasParent: HTMLElement = document.querySelector('main');
const drawManager: DrawManager  = new DrawManager(canvasParent);

new InteractionManager(drawManager, roadNetwork);

drawManager.draw(roadNetwork);

const canvas = new Canvas(canvasParent, 200, 200);

canvas.draw_line(0, 0, 100, 100);
