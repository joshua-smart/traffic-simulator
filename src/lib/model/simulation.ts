import Vector2 from "../vector2";
import Agent from "./agent";
import RoadNetwork from "./roadNetwork";
import CubicBezier from "./cubicBezier";
import TrafficSequencer from "./trafficSequencer";
import { intersection, sample, meanBy } from "lodash";
import { AgentData } from "./agentRecorder";
import SimulationRecorder, { SimulationOutput } from "./simulationRecorder";

export default class Simulation {
    private roadNetwork: RoadNetwork;
    private agents: Agent[];
    private trafficSequencer: TrafficSequencer;
    private simulationRecorder: SimulationRecorder;

    private sources: number[];
    private exits: Map<number, number[]>;

    private timeWarp: number;

    private agentData: AgentData[];
    private agentCount: number;

    private simulationTime: number;

    constructor(roadNetwork: RoadNetwork) {
        this.roadNetwork = roadNetwork;
        this.agents = [];
        this.timeWarp = 1;
        this.agentData = [];
        this.agentCount = 0;
        this.simulationTime = 0;

        const { sources, exits } = this.get_terminating_vertices();
        this.sources = sources;
        this.exits = exits;
        this.trafficSequencer = new TrafficSequencer();
        this.simulationRecorder = new SimulationRecorder();
    }

    // Called for every frame of the simulation
    public step(timeStep: number): void {
        const simulationTimeStep = timeStep * this.timeWarp;
        // Update simulationTimer
        this.simulationTime += simulationTimeStep;
        this.update_agents(simulationTimeStep);

        const newAgentCount = this.trafficSequencer.get_new_agent_count(this.simulationTime, this.agents.length);
        for(let i = 0; i < newAgentCount; i++) {
            this.add_new_agent();
            this.agentCount++;
        }
        // Supply callback to SimulationRecorder for data gathering
        this.simulationRecorder.track(this.simulationTime, (time: number, dataPoints: number) => {
            return {
                simTimer: time,
                dataPoints,
                agentCount: this.agentCount,
                avgAliveTime: meanBy(this.agentData, data => data.aliveTime),
                avgDistance: meanBy(this.agentData, data => data.routeDistance),
                avgMaxSpeed: meanBy(this.agentData, data => data.maximumSpeed),
                avgMinSpeed: meanBy(this.agentData, data => data.minimumSpeed),
                avgStopTime: meanBy(this.agentData, data => data.stoppedTime)
            };
        });
    }

    // Iterate over agents and update position, if kill flag is active collect data and remove from array
    private update_agents(timeStep: number): void {
        const agentValues = this.agents.map((_, agentId) => ({
                position: this.get_agent_position(agentId),
                direction: this.get_agent_tangent(agentId),
                speed: this.agents[agentId].get_speed()
            })
        );
        this.agents.forEach((_, agentId) => {
            this.update_agent(agentId, timeStep, agentValues);
        });

        this.agents = this.agents.filter(agent => {
            if(agent.kill) {
                this.agentData.push(agent.get_data());
                return false;
            }
            return true;
        });
    }

    // First check if agent is at end of edge, then calculate acceleration, then increment position
    private update_agent(agentId: number, timeStep: number, agentValues: {position: Vector2, direction: Vector2, speed: number}[]): void {
        const bezier = this.get_agent_bezier(agentId);
        const agent = this.agents[agentId];
        if (agent.get_distance() >= bezier.get_arc_length()) {
            agent.move_to_next_edge();
        }
        const position = this.get_agent_position(agentId);
        const direction = this.get_agent_tangent(agentId);
        const curvature = this.get_agent_curvature(agentId);
        agent.calculate_acceleration(position, direction, curvature, agentValues);
        agent.increment_position(timeStep);
    }

    // Select random source, then select random exit from validExits array, generate route and push the new agent
    private add_new_agent(): void {
        if (this.sources.length === 0) return;
        const src = sample(this.sources);
        const validExits = this.exits.get(src);
        if (validExits.length === 0) return;
        const dst = sample(validExits);
        const route = this.roadNetwork.find_route(src, dst);
        const agent = new Agent(route);
        this.agents.push(agent);
    }

    public agent_count(): number {
        return this.agents.length;
    }

    // Uses a graph traversal to create a Map pointing a source vertex to an array of connected exit vertices, this ensures only valid source-exit pairs can be selected to generate routes
    private get_terminating_vertices(): { sources: number[], exits: Map<number, number[]> } {
        const exits = new Map<number, number[]>();
        const { sources: sourceVertices, exits: exitVertices } = this.get_source_and_exit_vertices();

        const sources = sourceVertices.filter((source) => {
            const connectedVertices = this.roadNetwork.traverse(source);
            const connectedExits = intersection(connectedVertices, exitVertices);
            if (connectedExits.length === 0) return false;
            exits.set(source, connectedExits);
            return true;
        });

        return { sources, exits };
    }

    // Source defined as a vertex with outgoing but not incoming edges, exit defined as vertex with incoming edges but not outgoing edges
    private get_source_and_exit_vertices(): { sources: number[], exits: number[] } {
        const sources = [];
        const exits = [];

        for(let vertexId = 0; vertexId < this.roadNetwork.size(); vertexId++) {
            let incomingEdges = 0;
            let outgoingEdges = 0;
            for(let dstId = 0; dstId < this.roadNetwork.size(); dstId++) {
                if (this.roadNetwork.get_edge(dstId, vertexId) !== this.roadNetwork.empty) incomingEdges++;
                if (this.roadNetwork.get_edge(vertexId, dstId) !== this.roadNetwork.empty) outgoingEdges++;
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

    private get_agent_tangent(agentId: number): Vector2 {
        const agent = this.agents[agentId];
        const bezier = this.get_agent_bezier(agentId);

        return bezier.get_tangent_at_distance(agent.get_distance());
    }

    private get_agent_curvature(agentId: number): number {
        const agent = this.agents[agentId];
        const bezier = this.get_agent_bezier(agentId);

        return bezier.get_curvature_at_distance(agent.get_distance());
    }

    public get_agent_rotation(agentId: number): number {
        return this.get_agent_tangent(agentId).angle();
    }

    private get_agent_bezier(agentId: number): CubicBezier {
        const agent = this.agents[agentId];
        const {srcId , dstId} = agent.get_edge();
        return this.roadNetwork.get_bezier(srcId, dstId);
    }

    public get_output(): SimulationOutput[] {
        return this.simulationRecorder.get_data();
    }

    public get_current_output(): SimulationOutput {
        return this.simulationRecorder.get_latest();
    }
}
