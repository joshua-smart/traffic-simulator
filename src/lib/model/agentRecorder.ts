type AgentData = {
    aliveTime: number;
    routeDistance: number;
    maximumSpeed: number;
    minimumSpeed: number;
    stoppedTime: number;
};

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

    public track(speed: number, timeStep: number): void {
        this.aliveTime += timeStep;
        this.routeDistance += speed * timeStep;

        this.maximumSpeed = speed > this.maximumSpeed ? speed : this.maximumSpeed;
        this.minimumSpeed = speed < this.minimumSpeed ? speed : this.minimumSpeed;

        if (speed < 0.01) this.stoppedTime += timeStep;
    }

    public get_date(): AgentData {
        return {
            aliveTime: this.aliveTime,
            routeDistance: this.routeDistance,
            maximumSpeed: this.maximumSpeed,
            minimumSpeed: this.minimumSpeed,
            stoppedTime: this.stoppedTime
        }
    }
}
