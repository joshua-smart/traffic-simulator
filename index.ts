import RoadNetwork from './lib/roadNetwork.js';
import Canvas from "./lib/canvas.js";

import InteractionManager from "./lib/interactionManager.js";

const roadNetwork: RoadNetwork = await RoadNetwork.load_road_network('./assets/sample_network.json');

const canvasParent: HTMLElement = document.querySelector('main');
const canvas: Canvas = new Canvas(canvasParent);

const interactionManager: InteractionManager = new InteractionManager(canvas, roadNetwork);

canvas.draw(roadNetwork);
canvas.draw(roadNetwork);