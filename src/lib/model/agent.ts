import Stack from '../model/stack';
import Vector2 from '../vector2';
import { clamp, min } from 'lodash';
import AgentRecorder, { AgentData } from './agentRecorder';

type AgentValue = {
    position: Vector2,
    direction: Vector2,
    speed: number
};

export default class Agent {
    // Stack of vertices representing the route, the top of the stack being the first vertex
    private route: Stack<number>;
    private currentSrcVertex: number;

    // Distance along current edge, speed in m/s and acceleration during current frame
    private distance: number;
    private speed: number;
    private acceleration: number;

    // Whether this object should be removed from the simulation in the next frame
    public kill: boolean = false;

    private agentRecorder: AgentRecorder;

    constructor(route: Stack<number>) {
        this.route = route;
        this.currentSrcVertex = this.route.pop();

        this.distance = 0;
        this.speed = 0;

        // Attach AgentRecorder to Agent
        this.agentRecorder = new AgentRecorder();
    }

    public get_data(): AgentData {
        return this.agentRecorder.get_data();
    }

    // Called when agent has reached the end of the current edge
    public move_to_next_edge(): void {
        // If agent has reached the end of its last edge then set it to be destroyed
        if (this.on_last_edge()) {
            this.kill = true;
            return;
        }
        // Shift through the vertices in route, moving the agent to the start of the next edge
        this.currentSrcVertex = this.route.pop();
        this.distance = 0;
    }

    public on_last_edge(): boolean {
        return this.route.get_size() === 1;
    }

    // Return the src and dst ids of the edge the agent is currently travelling across
    public get_edge(): {srcId: number, dstId: number} {
        return {
            srcId: this.currentSrcVertex,
            dstId: this.route.peek()
        };
    }

    public get_distance(): number {
        return this.distance;
    }

    public get_speed(): number {
        return this.speed;
    }

    // Increment speed and position based on timeStep of last frame
    public increment_position(timeStep: number): void {
        this.speed += this.acceleration * timeStep;
        this.distance += this.speed * timeStep;

        // Update recorded data
        this.agentRecorder.track(this.speed, timeStep);
    }

    // Calculate acceleration for current frame
    public calculate_acceleration(position: Vector2, direction: Vector2, curvature: number, agentValues: AgentValue[]): void {

        const separationDistance = 4;
        const accelerationLimit = 20;
        const roadSpeed = 13.4;

        // Filter for agents that are in front of this object travelling at an angle < 90 degrees to this object
        const visibleAgents = agentValues.filter(({position: agentPos, direction: agentDir}) => {
            const toAgentRay = agentPos.sub(position);
            return direction.dot(toAgentRay) > 0 && direction.dot(agentDir) > 0;
        });

        // Calculate target speed for each other agent and return the minimum, capped at roadSpeed
        const targetAgentSpeed = min([...visibleAgents.map(agent => this.get_target_speed_from_agent(position, agent, roadSpeed, separationDistance)), roadSpeed]);

        const targetSpeed = clamp(targetAgentSpeed, 0, roadSpeed);

        // Calculate acceleration from targetSpeed
        const acceleration = (targetSpeed - this.speed)*2;
        this.acceleration = accelerationLimit*Math.sign(acceleration);
    }

    // Get targetSpeed based on square distance to other agent
    private get_target_speed_from_agent(position: Vector2, {position: agentPos, direction: agentDir, speed: agentSpeed}: AgentValue, roadSpeed: number, separationDistance: number) {
        // Agent is 'behind' if angle between them is > 90deg
        const behind = agentDir.dot(position.sub(agentPos)) < 0;

        let targetSpeed = roadSpeed;
        // If agent is behind this or agent is faster than this, slow down for the other agent
        if (behind || agentSpeed > this.speed) {
            const distance = position.sub(agentPos).square_magnitude();
            targetSpeed = 0.01*(distance - separationDistance**2) * agentSpeed;
        }
        return targetSpeed;
    }
}
