export type SimulationOutput = {
    agentCount: number,
    dataPoints: number,
    simTimer: number,
    avgAliveTime: number,
    avgDistance: number,
    avgMaxSpeed: number,
    avgMinSpeed: number,
    avgStopTime: number
}

export default class SimulationRecorder {
    private data: SimulationOutput[];

    private lastSaveTime: number;

    constructor() {
        this.data = [];
        this.lastSaveTime = -Infinity;
    }

    public track(time: number, getOutput: (time: number, dataPoints: number) => SimulationOutput): void {
        if (time - this.lastSaveTime <= 1000) return;
        this.data.push(getOutput(time, this.data.length + 1));
        this.lastSaveTime = time;
    }

    public get_data(): SimulationOutput[] {
        return this.data;
    }

    public get_latest(): SimulationOutput {
        return this.data[this.data.length - 1];
    }
}
