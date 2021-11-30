import Stack from '../stack';

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
        this.speed = 0.5;
        this.acceleration = 0;
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
        this.acceleration = 0;
    }
}
