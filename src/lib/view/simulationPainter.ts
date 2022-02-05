import Simulation from "../model/simulation";
import Canvas from "./canvas";
import Transform from "./transform";

export default class SimulationPainter {
    private agentContainer: HTMLElement;

    constructor() {
        this.agentContainer = document.querySelector('#agent-container');
    }

    public draw(canvas: Canvas, simulation: Simulation, transform: Transform): void {
        for(let agentId = 0; agentId < simulation.agent_count(); agentId++) {
            this.draw_agent(canvas, simulation, agentId, transform);
        }
    }

    public clear(): void {
        this.agentContainer.innerHTML = '';
    }

    // Create HTML element for agent, apply styles and position, draw to UI
    private draw_agent(canvas: Canvas, simulation: Simulation, agentId: number, transform: Transform): void {
        const worldPosition = simulation.get_agent_position(agentId);
        const rotation = simulation.get_agent_rotation(agentId);

        const screenPosition = transform.to_screen_space(worldPosition);

        const agentElement = document.createElement('div');
        agentElement.className = 'agent';
        agentElement.style.left = `${screenPosition.x}px`;
        agentElement.style.top = `${screenPosition.y}px`;
        agentElement.style.transform = `translate(-50%, -50%) scale(${transform.get_scale()}) rotate(${rotation}rad)`;
        agentElement.setAttribute('agentId', String(agentId));

        this.agentContainer.appendChild(agentElement);
    }
}
