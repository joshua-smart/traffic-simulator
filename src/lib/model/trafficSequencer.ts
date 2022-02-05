// Used to tell the simulation when to spawn new agents, spawns an agent every second
export default class TrafficSequencer {
    private waitTime: number = 1;
    private lastSpawnTime: number = 0;

    // Return the number of new agents that need to be added to the simulation this frame, enforces the limit on number of agents in the simulation
    public get_new_agent_count(time: number, agentCount: number): number {
        if (agentCount >= 60) return 0;
        let newAgentCount = 0;
        if (time - this.lastSpawnTime > this.waitTime) {
            this.lastSpawnTime = time;
            newAgentCount++;
            this.waitTime = 1;
        }
        return newAgentCount;
    }
}
