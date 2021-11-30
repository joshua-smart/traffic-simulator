import { random } from "lodash";

export default class TrafficSequencer {
    private waitTime: number = 1000;
    private lastSpawnTime: number;

    constructor() {
        this.lastSpawnTime = 0;
    }

    public get_new_agent_count(time: number): number {
        let newAgentCount = 0;
        if (time - this.lastSpawnTime > this.waitTime) {
            this.lastSpawnTime = time;
            newAgentCount++;
            this.waitTime = random(100, 500);
        }
        return newAgentCount;
    }
}
