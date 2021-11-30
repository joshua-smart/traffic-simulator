import Vector2 from "../vector2";
import Agent from "./agent";
import RoadNetwork from "./roadNetwork";
import CubicBezier from "./cubicBezier";
import TrafficSequencer from "./trafficSequencer";
import { random } from "lodash";

export default class Simulation {
    private roadNetwork: RoadNetwork;
    private agents: Agent[];
    private trafficSequencer: TrafficSequencer;

    private sources: number[];
    private exits: number[]

    private timeStep: number;
    private timeWarp: number;

    private time: number;

    constructor(roadNetwork: RoadNetwork) {
        this.roadNetwork = roadNetwork;
        this.agents = [];
        this.timeStep = 1;
        this.timeWarp = 20;

        this.time = 0;

        const { sources, exits } = this.find_terminating_vertices();
        this.sources = sources;
        this.exits = exits;
        this.trafficSequencer = new TrafficSequencer();
    }

    public step() {
        for(let i = 0; i < this.timeWarp; i++) {
            this.update_simulation();
        }
    }

    private update_simulation() {
        this.update_agents();

        const newAgentCount = this.trafficSequencer.get_new_agent_count(this.time);
        for(let i = 0; i < newAgentCount; i++) {
            this.add_new_agent();
        }

        this.time += this.timeStep;
    }

    private update_agents() {
        this.agents.forEach((_, agentId) => {
            this.update_agent(agentId)
        });

        this.agents = this.agents.filter(agent => !agent.kill);
    }

    private update_agent(agentId: number) {
        const bezier = this.get_agent_bezier(agentId);
        const agent = this.agents[agentId];
        if (agent.get_distance() >= bezier.get_arc_length()) {
            agent.move_to_next_edge();
        }
        agent.increment_position(this.timeStep);
    }

    private add_new_agent(): void {
        const src = this.sources[random(0, this.sources.length - 1)];
        const dst = this.exits[random(0, this.exits.length - 1)];
        const route = this.roadNetwork.find_route(src, dst);
        const agent = new Agent(route);
        this.agents.push(agent);
    }

    public agent_count(): number {
        return this.agents.length;
    }

    private find_terminating_vertices(): {sources: number[], exits: number[]} {
        const sources = [];
        const exits = [];

        for(let vertexId = 0; vertexId < this.roadNetwork.size(); vertexId++) {
            let incomingEdges = 0;
            let outgoingEdges = 0;
            for(let dstId = 0; dstId < this.roadNetwork.size(); dstId++) {
                if (this.roadNetwork.get_edge(dstId, vertexId)) incomingEdges++;
                if (this.roadNetwork.get_edge(vertexId, dstId)) outgoingEdges++;
            }

            if (incomingEdges === 0 && outgoingEdges !== 0) sources.push(vertexId);
            if (incomingEdges !== 0 && outgoingEdges === 0) exits.push(vertexId);
        }

        return { sources, exits };
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
