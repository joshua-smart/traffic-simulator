import Stack from '../stack';

export default class Agent {
    private route: Stack<number>;
    private currentSrcVertex: number;

    private distance: number;
    private speed: number;
    private acceleration: number;

    constructor(route: Stack<number>) {
        this.route = route;
        this.currentSrcVertex = this.route.pop();

        this.distance = 10;
        this.speed = 0.5;
        this.acceleration = 0;
    }

    public move_to_next_edge(): void {
        this.currentSrcVertex = this.route.pop();
        this.distance = 0;
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

    public increment_position(timeStep): void {
        this.speed += this.acceleration * timeStep;
        this.distance += this.speed * timeStep;
        this.acceleration = 0;
    }
}
