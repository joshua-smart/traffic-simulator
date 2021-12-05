import { random } from "lodash";

export default class TrafficSequencer {
    private waitTime: number = 1000;
    private lastSpawnTime: number = 0;
    private time = 0;

    public get_new_agent_count(timeStep: number): number {
        let newAgentCount = 0;
        if (this.time - this.lastSpawnTime > this.waitTime) {
            this.lastSpawnTime = this.time;
            newAgentCount++;
            this.waitTime = random(400, 500);
        }
        this.time += timeStep;
        return newAgentCount;
    }
}
