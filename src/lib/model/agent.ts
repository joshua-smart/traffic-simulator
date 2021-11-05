import Stack from '../stack';

export default class Agent {
    private distance: number;
    private speed: number;
    private route: Stack<number>;
    private currentSrcVertex: number;

    private acceleration: number;

    constructor(route: Stack<number>) {
        this.route = route;
        this.currentSrcVertex = this.route.pop();
        this.distance = 0;
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

    public increment_position(): void {
        this.speed += this.acceleration;
        this.distance += this.speed;
    }
}
