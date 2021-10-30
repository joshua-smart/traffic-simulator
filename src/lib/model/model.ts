import RoadNetwork, { create_default_network } from "./roadNetwork";
import { cloneDeep } from 'lodash';
import Vector2 from "../vector2";
import Simulation from "./simulation";

export default class Model {
    private roadNetwork: RoadNetwork;
    private simulation: Simulation;

    constructor() {
        this.roadNetwork = create_default_network();
        this.simulation = new Simulation();
    }

    public get_road_network(): RoadNetwork {
        return this.roadNetwork;
    }

    public get_simulation() {
        return this.simulation;
    }

    public copy_road_network(): RoadNetwork {
        return cloneDeep(this.roadNetwork);
    }

    public apply_state(newState: RoadNetwork): void {
        this.roadNetwork = newState;
    }

    public add_vertex(position: Vector2): number {
        return this.roadNetwork.add_vertex(position);
    }

    public toggle_edge(srcId: number, dstId: number): void {
        // No self-connecting vertices
        if (srcId === dstId) return;
        if (this.roadNetwork.get_edge(srcId, dstId)) {
            this.roadNetwork.remove_edge(srcId, dstId);
            return;
        }
        this.roadNetwork.remove_edge(dstId, srcId);
        this.roadNetwork.set_edge(srcId, dstId, {p1: new Vector2(0, 0), p2: new Vector2(0, 0)});
    }

    public set_vertex(vertexId: number, position: Vector2): void {
        this.roadNetwork.set_vertex(vertexId, position);
    }

    public remove_vertex(vertexId: number) {
        this.roadNetwork.remove_vertex(vertexId);
    }
}
