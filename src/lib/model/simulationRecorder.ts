export type SimulationOutput = {
    agentCount: number,
    dataPoints: number,
    simTimer: number,
    avgAliveTime: number,
    avgDistance: number,
    avgMaxSpeed: number,
    avgMinSpeed: number,
    avgStopTime: number
};

// This class is used to periodically save the summary data for the simulation, allowing it to be displayed and save as output data
export default class SimulationRecorder {
    // Array of records containing simulation information
    private data: SimulationOutput[];
    private lastSaveTime: number;

    constructor() {
        this.data = [];
        this.lastSaveTime = -Infinity;
    }

    // getOutput is passed as a function parameter to avoid calculating summary data in frames where it is not saved
    public track(time: number, getOutput: (time: number, dataPoints: number) => SimulationOutput): void {
        // If less than a second has passed since the last record, exit the function
        if (time - this.lastSaveTime <= 1) return;
        // Otherwise, get the data and push it to the data array
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
