import { random } from "lodash";

export default class TrafficSequencer {
    private waitTime: number = 1;
    private lastSpawnTime: number = 0;

    public get_new_agent_count(time: number): number {
        let newAgentCount = 0;
        if (time - this.lastSpawnTime > this.waitTime) {
            this.lastSpawnTime = time;
            newAgentCount++;
            this.waitTime = 1;
        }
        return newAgentCount;
    }
}
