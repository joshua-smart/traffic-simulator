import Stack from '../stack';
import Vector2 from '../vector2';
import { clamp, random } from 'lodash';

export default class Agent {
    private route: Stack<number>;
    private currentSrcVertex: number;

    private distance: number;
    private speed: number;
    private acceleration: number;

    private aggression: number;

    public kill: boolean = false;

    constructor(route: Stack<number>) {
        this.route = route;
        this.currentSrcVertex = this.route.pop();

        this.aggression = random(1, 5, true);

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

    public increment_position(timeStep: number): void {
        this.speed += this.acceleration * timeStep;
        this.distance += this.speed * timeStep;
    }

    public calculate_acceleration(position: Vector2, direction: Vector2, agentValues: {position: Vector2, direction: Vector2}[]): void {

        const separationDistance = 50;
        const accelerationLimit = 0.005;
        const roadSpeed = 0.2;

        // Filter for agents that are in front of this object
        const visibleAgents = agentValues.filter(({position: agentPos, direction: agentDir}) => {
            const toAgentRay = agentPos.sub(position);
            return direction.dot(toAgentRay) > 0 && direction.dot(agentDir) > 0;
        });
        const minimumDistanceToAgent = visibleAgents.reduce((minimum, {position: agentPos}) => {
            const squareDistance = position.sub(agentPos).square_magnitude();
            return squareDistance < minimum ? squareDistance : minimum;
        }, Infinity);

        const targetSpeed = clamp(this.aggression*0.01*(minimumDistanceToAgent - separationDistance**2), 0, roadSpeed);
        const acceleration = 0.01*(targetSpeed - this.speed);

        this.acceleration = clamp(acceleration, -accelerationLimit, accelerationLimit);
    }
}
