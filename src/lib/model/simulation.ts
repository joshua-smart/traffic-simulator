import Vector2 from "../vector2";
import Agent from "./agent";
import RoadNetwork from "./roadNetwork";
import CubicBezier from "./cubicBezier";

export default class Simulation {
    private roadNetwork: RoadNetwork;
    private agents: Agent[];

    private sources: number[];
    private exits: number[];

    private timeStep: number;
    private timeWarp: number;

    constructor(roadNetwork: RoadNetwork) {
        this.roadNetwork = roadNetwork;
        this.agents = [];
        this.timeStep = 0.1;
        this.timeWarp = 20;

        this.find_terminating_vertices();

        this.add_agent(0, 12);
    }

    public step() {
        for(let i = 0; i < this.timeWarp; i++) {
            this.agents.forEach((agent, agentId) => {
                const bezier = this.get_agent_bezier(agentId);
                if (agent.get_distance() >= bezier.get_arc_length()) {
                    agent.move_to_next_edge();
                }
                agent.increment_position(this.timeStep);
            });
        }
    }

    private add_agent(srcId: number, dstId: number): void {
        const route = this.roadNetwork.find_route(srcId, dstId);
        const agent = new Agent(route);
        this.agents.push(agent);
    }

    public agent_count(): number {
        return this.agents.length;
    }

    private find_terminating_vertices(): void {
        this.sources = [];
        this.exits = [];

        for(let vertexId = 0; vertexId < this.roadNetwork.size(); vertexId++) {
            let incomingEdges = 0;
            let outgoingEdges = 0;
            for(let dstId = 0; dstId < this.roadNetwork.size(); dstId++) {
                if (this.roadNetwork.get_edge(dstId, vertexId)) incomingEdges++;
                if (this.roadNetwork.get_edge(vertexId, dstId)) outgoingEdges++;
            }

            if (incomingEdges === 0 && outgoingEdges !== 0) this.sources.push(vertexId);
            if (incomingEdges !== 0 && outgoingEdges === 0) this.exits.push(vertexId);
        }
    }

    public get_agent_position(agentId: number): Vector2 {
        const agent = this.agents[agentId];
        const bezier = this.get_agent_bezier(agentId);

        return bezier.get_point_at_distance(agent.get_distance());
    }

    public get_agent_rotation(agentId: number): number {
        const agent = this.agents[agentId];
        const bezier = this.get_agent_bezier(agentId);

        const tangent = bezier.get_tangent_at_distance(agent.get_distance());
        return tangent.angle();
    }

    private get_agent_bezier(agentId: number): CubicBezier {
        const agent = this.agents[agentId];
        const {srcId , dstId} = agent.get_edge();
        return this.roadNetwork.get_bezier(srcId, dstId);
    }
}
