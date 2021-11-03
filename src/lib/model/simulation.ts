import Agent from "./agent";
import RoadNetwork from "./roadNetwork";

export default class Simulation {
    private roadNetwork: RoadNetwork;
    private agents: Agent[];

    private sources: number[];
    private exits: number[];

    constructor(roadNetwork: RoadNetwork) {
        this.roadNetwork = roadNetwork;

        const { sources, exits } = this.find_terminating_vertices(roadNetwork);
        this.sources = sources;
        this.exits = exits;
    }

    private find_terminating_vertices(roadNetwork: RoadNetwork): {sources: number[], exits: number[]} {
        const sources: number[] = [];
        const exits: number[] = [];

        for(let vertexId = 0; vertexId < roadNetwork.size(); vertexId++) {
            let incomingEdges = 0;
            let outgoingEdges = 0;
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                if (roadNetwork.get_edge(dstId, vertexId)) incomingEdges++;
                if (roadNetwork.get_edge(vertexId, dstId)) outgoingEdges++;
            }

            if (incomingEdges === 0 && outgoingEdges !== 0) sources.push(vertexId);
            if (incomingEdges !== 0 && outgoingEdges === 0) exits.push(vertexId);
        }

        return { sources, exits };
    }
}
