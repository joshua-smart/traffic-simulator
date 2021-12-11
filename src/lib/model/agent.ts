import Stack from '../stack';
import Vector2 from '../vector2';
import { clamp, max, min } from 'lodash';

type AgentValue = {
    position: Vector2,
    direction: Vector2,
    speed: number
}

export default class Agent {
    private route: Stack<number>;
    private currentSrcVertex: number;

    private distance: number;
    private speed: number;
    private acceleration: number;

    public kill: boolean = false;

    constructor(route: Stack<number>) {
        this.route = route;
        this.currentSrcVertex = this.route.pop();

        this.distance = 10;
        this.speed = 0;
    }

    public move_to_next_edge(): void {
        if (this.on_last_edge()) {
            this.kill = true;
            return;
        }
        this.currentSrcVertex = this.route.pop();
        this.distance = 0;
    }

    public on_last_edge(): boolean {
        return this.route.get_size() === 1;
    }

    public get_edge(): {srcId: number, dstId: number} {
        return {
            srcId: this.currentSrcVertex,
            dstId: this.route.peek()
        }
    }

    public get_distance(): number {
        return this.distance;
    }

    public get_speed(): number {
        return this.speed;
    }

    public increment_position(timeStep: number): void {
        this.speed += this.acceleration * timeStep;
        this.distance += this.speed * timeStep;
    }

    public calculate_acceleration(position: Vector2, direction: Vector2, agentValues: AgentValue[]): void {

        const separationDistance = 50;
        const accelerationLimit = 0.05;
        const roadSpeed = 0.2;

        // Filter for agents that are in front of this object travelling at an angle < 90 degrees to this object
        const visibleAgents = agentValues.filter(({position: agentPos, direction: agentDir}) => {
            const toAgentRay = agentPos.sub(position);
            return direction.dot(toAgentRay) > 0 && direction.dot(agentDir) > 0;
        });

        const targetAgentSpeed = min(
            [...visibleAgents.map(agent => this.get_target_speed_from_agent(position, agent, roadSpeed, separationDistance)), roadSpeed]
        );

        const targetSpeed = clamp(targetAgentSpeed, -roadSpeed, roadSpeed);

        const acceleration = 0.01*(targetSpeed - this.speed);
        this.acceleration = clamp(acceleration, -accelerationLimit, accelerationLimit);
    }

    private get_target_speed_from_agent(position: Vector2, {position: agentPos, direction: agentDir, speed: agentSpeed}: AgentValue, roadSpeed: number, separationDistance: number) {
        const behind = agentDir.dot(position.sub(agentPos)) < 0;

        let targetSpeed = roadSpeed;
        if (behind || agentSpeed > this.speed) {
            const nearestDistance = position.sub(agentPos).square_magnitude();
            targetSpeed = max([0.1*(nearestDistance - separationDistance**2) * agentSpeed, 0]);
        }
        return targetSpeed;
    }
}
