import RoadNetwork, { create_default_network } from "./roadNetwork";
import { cloneDeep } from 'lodash';
import Vector2 from "../vector2";
import Simulation from "./simulation";
import { SimulationOutput } from "./simulationRecorder";

export default class Model {
    private roadNetwork: RoadNetwork;
    private simulation: Simulation;

    constructor() {
        // Use the default_network on startup to replace the empty screen
        this.roadNetwork = create_default_network();
    }

    public get_road_network(): RoadNetwork {
        return this.roadNetwork;
    }

    public get_simulation() {
        return this.simulation;
    }

    // Create deep copy of RoadNetwork class to avoid duplicate references
    public copy_road_network(): RoadNetwork {
        return cloneDeep(this.roadNetwork);
    }

    public apply_state(newState: RoadNetwork): void {
        this.roadNetwork = newState;
    }

    // Enforce vertex limit
    public add_vertex(position: Vector2): number {
        if (this.roadNetwork.size() >= 50) return -1;
        return this.roadNetwork.add_vertex(position);
    }

    // Reverse edge if the reverse is present, create new if none exists, remove if edge exists
    public toggle_edge(srcId: number, dstId: number): void {
        // No self-connecting vertices
        if (srcId === dstId) return;
        // If an edge in the same direction already exists, remove edge and exit function
        if (this.roadNetwork.get_edge(srcId, dstId)) {
            this.roadNetwork.remove_edge(srcId, dstId);
            return;
        }
        // If neither edge case, remove edge in other direction and add edge in this direction
        this.roadNetwork.remove_edge(dstId, srcId);
        this.roadNetwork.add_edge(srcId, dstId);
    }

    public set_vertex(vertexId: number, position: Vector2): void {
        this.roadNetwork.set_vertex(vertexId, position);
    }

    // Move edge handle to mouse position
    public set_handle({srcId, dstId, position}: {srcId: number, dstId: number, position: 'start' | 'end'}, mousePosition: Vector2): void {
        const currentEdge = this.roadNetwork.get_edge(srcId, dstId);
        const vertex = position === 'start' ? this.roadNetwork.get_vertex(srcId) : this.roadNetwork.get_vertex(dstId);
        const newTangent = mousePosition.sub(vertex);
        const newEdge = position === 'start' ? {t1: newTangent, t2: currentEdge.t2} : {t1: currentEdge.t1, t2: newTangent};
        this.roadNetwork.set_edge(srcId, dstId, newEdge);
    }

    public remove_vertex(vertexId: number) {
        this.roadNetwork.remove_vertex(vertexId);
    }

    public start_simulation() {
        // Instantiate a new simulation using the current road network
        this.simulation = new Simulation(this.roadNetwork);
    }

    public stop_simulation() {
        this.simulation = null;
    }

    public step_simulation(timeStep: number) {
        this.simulation.step(timeStep);
    }

    public get_output(): SimulationOutput[] {
        return this.simulation.get_output();
    }

    public get_current_output(): SimulationOutput {
        return this.simulation.get_current_output();
    }
}
