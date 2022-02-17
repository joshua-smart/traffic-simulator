import Simulation from "../model/simulation";
import Canvas from "./canvas";
import Transform from "./transform";

export default class SimulationPainter {
    private agentContainer: HTMLElement;

    constructor() {
        this.agentContainer = document.querySelector('#agent-container');
    }

    // For each agent in the simulation, draw it to the UI
    public draw(canvas: Canvas, simulation: Simulation, transform: Transform): void {
        for(let agentId = 0; agentId < simulation.agent_count(); agentId++) {
            this.draw_agent(canvas, simulation, agentId, transform);
        }
    }

    // Remove all agent HTML elements from the UI
    public clear(): void {
        this.agentContainer.innerHTML = '';
    }

    // Create HTML element for agent
    private draw_agent(canvas: Canvas, simulation: Simulation, agentId: number, transform: Transform): void {
        // Get agents worldPosition and rotation
        const worldPosition = simulation.get_agent_position(agentId);
        const rotation = simulation.get_agent_rotation(agentId);

        // Transform agent's position to screen spage
        const screenPosition = transform.to_screen_space(worldPosition);

        // Create new HTML element for agent
        const agentElement = document.createElement('div');
        // Set the elements className and position to reflect the agent's values
        agentElement.className = 'agent';
        agentElement.style.left = `${screenPosition.x}px`;
        agentElement.style.top = `${screenPosition.y}px`;
        // Apply the scale from the current transform, and apply the rotation of the agent to the element 
        agentElement.style.transform = `translate(-50%, -50%) scale(${transform.get_scale()}) rotate(${rotation}rad)`;
        agentElement.setAttribute('agentId', String(agentId));

        // Add the element to the UI
        this.agentContainer.appendChild(agentElement);
    }
}
