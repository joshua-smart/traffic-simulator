export type AgentData = {
    aliveTime: number;
    routeDistance: number;
    maximumSpeed: number;
    minimumSpeed: number;
    stoppedTime: number;
};

// Saves statistics for an agent as it traverses the road network
export default class AgentRecorder {

    private aliveTime: number;
    private routeDistance: number;
    private maximumSpeed: number;
    private minimumSpeed: number;
    private stoppedTime: number;

    constructor() {
        this.aliveTime = 0;
        this.routeDistance = 0;
        this.maximumSpeed = -Infinity;
        this.minimumSpeed = Infinity;
        this.stoppedTime = 0;
    }

    // Update internal statistics, called every frame
    public track(speed: number, timeStep: number): void {
        this.aliveTime += timeStep;
        this.routeDistance += speed * timeStep;

        this.maximumSpeed = speed > this.maximumSpeed ? speed : this.maximumSpeed;
        this.minimumSpeed = speed < this.minimumSpeed ? speed : this.minimumSpeed;

        if (speed < 0.01) this.stoppedTime += timeStep;
    }

    // Returns final statistics when the agent is destroyed
    public get_data(): AgentData {
        return {
            aliveTime: this.aliveTime,
            routeDistance: this.routeDistance,
            maximumSpeed: this.maximumSpeed,
            minimumSpeed: this.minimumSpeed,
            stoppedTime: this.stoppedTime
        };
    }
}
