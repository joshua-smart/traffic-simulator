import Vector2 from "../vector2";
import Agent from "./agent";
import RoadNetwork from "./roadNetwork";
import CubicBezier from "./cubicBezier";
import TrafficSequencer from "./trafficSequencer";
import { intersection, sample, meanBy } from "lodash";
import { AgentData } from "./agentRecorder";
import SimulationRecorder, { SimulationOutput } from "./simulationRecorder";

export default class Simulation {
    // Road network that the simulation operates on
    private roadNetwork: RoadNetwork;
    // Array of agents currently present in the network
    private agents: Agent[];
    // Manages spawning of new agents to the network
    private trafficSequencer: TrafficSequencer;
    // Structure to record persistent data as the simulation progresses
    private simulationRecorder: SimulationRecorder;

    // Array of vertexId representing entrance vertices to the network
    private sources: number[];
    // A map between a source vertex id and an array of vertexIds representing the connected exit nodes
    private exits: Map<number, number[]>;

    private timeWarp: number;

    // Array of AgentsData objects storing the data of the agents that have completed their journeys
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

        // Get number of new agents that need to be spawned this frame
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
                // Get current postition data of each agent
                position: this.get_agent_position(agentId),
                direction: this.get_agent_tangent(agentId),
                speed: this.agents[agentId].get_speed()
            })
        );
        this.agents.forEach((_, agentId) => {
            this.update_agent(agentId, timeStep, agentValues);
        });

        // Filter out agents with an active kill flag, pushing data to agentData before they are destroyed
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
        // If agent is at the end of its current edge, move to next edge
        if (agent.get_distance() >= bezier.get_arc_length()) {
            agent.move_to_next_edge();
        }
        // Get data about this agent and update its values
        const position = this.get_agent_position(agentId);
        const direction = this.get_agent_tangent(agentId);
        const curvature = this.get_agent_curvature(agentId);
        agent.calculate_acceleration(position, direction, curvature, agentValues);
        agent.increment_position(timeStep);
    }

    // Add a new agent to the network with a random route
    private add_new_agent(): void {
        // If their are no sources in the network, an agent cannot be added
        if (this.sources.length === 0) return;
        // Get random sourceId
        const src = sample(this.sources);
        // Get all connected exits for this source
        const validExits = this.exits.get(src);
        // If there are no valid exits, an agent cannot be added
        if (validExits.length === 0) return;
        // Get random exitId from validExits
        const dst = sample(validExits);
        // Use Dijkstra's algorithm in the graph class to find the shortest valid route between the selected source and exit vertices
        const route = this.roadNetwork.find_route(src, dst);
        // Instantiate a new agent with this route
        const agent = new Agent(route);
        // Add the agent to the simulation
        this.agents.push(agent);
    }

    public agent_count(): number {
        return this.agents.length;
    }

    // Get vertices with only outgoing edges, and a map containing the connected vertices which have only incoming edges
    private get_terminating_vertices(): { sources: number[], exits: Map<number, number[]> } {
        // Instantiate empty exits Map
        const exits = new Map<number, number[]>();
        // Get lists of valid source and exit vertices
        const { sources: sourceVertices, exits: exitVertices } = this.get_source_and_exit_vertices();

        // Remove sources with no connected exits
        const sources = sourceVertices.filter((source) => {
            // Use the depth-first traversal in the graph class to find all connected vertices
            const connectedVertices = this.roadNetwork.traverse(source);
            // Find the vertexIds that are both connected to the source and are exits
            const connectedExits = intersection(connectedVertices, exitVertices);
            // If there are no connected exits, filter out the source
            if (connectedExits.length === 0) return false;
            // Set the Map to point this sourceId to the array of connected exits and do not filter out this source
            exits.set(source, connectedExits);
            return true;
        });

        return { sources, exits };
    }

    // Source defined as a vertex with outgoing but not incoming edges, exit defined as vertex with incoming edges but not outgoing edges
    private get_source_and_exit_vertices(): { sources: number[], exits: number[] } {
        const sources = [];
        const exits = [];

        // For each vertex, count the number of incoming and outgoing edges
        for(let vertexId = 0; vertexId < this.roadNetwork.size(); vertexId++) {
            let incomingEdges = 0;
            let outgoingEdges = 0;
            // If this is connected to the other edge, increment outgoingEdges, if the other edge is connected to this, increment incomingEdges
            for(let dstId = 0; dstId < this.roadNetwork.size(); dstId++) {
                if (this.roadNetwork.get_edge(dstId, vertexId) !== this.roadNetwork.empty) incomingEdges++;
                if (this.roadNetwork.get_edge(vertexId, dstId) !== this.roadNetwork.empty) outgoingEdges++;
            }

            // Use the calculated values to differentiate between source and exit vertices
            if (incomingEdges === 0 && outgoingEdges !== 0) sources.push(vertexId);
            if (incomingEdges !== 0 && outgoingEdges === 0) exits.push(vertexId);
        }

        return { sources, exits };
    }

    // Get position of agent using its distance along its current bezier edge
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

    // Return angle that the tangent makes with the positive x-axis
    public get_agent_rotation(agentId: number): number {
        return this.get_agent_tangent(agentId).angle();
    }

    // Return the bezier curve represented by the edge the agent is currently tavelling across
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
