import RoadNetwork, { create_default_network } from "./roadNetwork";
import { cloneDeep } from 'lodash';
import Vector2 from "../vector2";
import Simulation from "./simulation";

export default class Model {
    private roadNetwork: RoadNetwork;
    private simulation: Simulation;

    constructor() {
        this.roadNetwork = create_default_network();
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
        this.roadNetwork.set_edge(srcId, dstId, {t1: new Vector2(0, 0), t2: new Vector2(0, 0)});
    }

    public set_vertex(vertexId: number, position: Vector2): void {
        this.roadNetwork.set_vertex(vertexId, position);
    }

    public set_handle({srcId, dstId, position}: {srcId: number, dstId: number, position: 'start' | 'end'}, mousePosition: Vector2): void {
        const currentEdge = this.roadNetwork.get_edge(srcId, dstId);
        const vertex = position == 'start' ? this.roadNetwork.get_vertex(srcId) : this.roadNetwork.get_vertex(dstId);
        const newTangent = mousePosition.sub(vertex);
        const newEdge = position == 'start' ? {t1: newTangent, t2: currentEdge.t2} : {t1: currentEdge.t1, t2: newTangent};
        this.roadNetwork.set_edge(srcId, dstId, newEdge);
    }

    public remove_vertex(vertexId: number) {
        this.roadNetwork.remove_vertex(vertexId);
    }

    public start_simulation() {
        this.simulation = new Simulation(this.roadNetwork);
    }
}
