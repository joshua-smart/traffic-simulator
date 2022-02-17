// Used to tell the simulation when to spawn new agents, spawns an agent every second
export default class TrafficSequencer {
    private waitTime: number = 1;
    private lastSpawnTime: number = 0;

    // Return the number of new agents that need to be added to the simulation this frame
    public get_new_agent_count(time: number, agentCount: number): number {
        // If there are >=60 agents in the simulation, do not add more
        if (agentCount >= 60) return 0;
        let newAgentCount = 0;
        // If it has been more than waitTime seconds since the last agent was spawned, spawn another agent
        if (time - this.lastSpawnTime > this.waitTime) {
            this.lastSpawnTime = time;
            newAgentCount++;
            this.waitTime = 1;
        }
        return newAgentCount;
    }
}
