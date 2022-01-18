import Graph from './graph';
import Vector2 from '../vector2';
import Stack from '../stack';
import CubicBezier from './cubicBezier';
import ioManager, { JSONRoadNetwork } from '../controller/ioManager';

export class RoadNetworkError extends Error {
    public name = "RoadNetworkError";
    constructor(message?: string) {
        super(message);
    }
}

type Vertex = Vector2;
type Edge = {t1: Vector2, t2: Vector2};

export default class RoadNetwork extends Graph<Vertex, Edge>{
    constructor() {
        super();
    }

    public add_edge(srcId: number, dstId: number): void {
        const srcVertex = this.get_vertex(srcId);
        const dstVertex = this.get_vertex(dstId);
        const t1 = Vector2.sub(dstVertex, srcVertex).mult(1/3);
        const t2 = t1.mult(-1);

        super.set_edge(srcId, dstId, {t1, t2});
    }

    // Create the bezier curve between two vertices in the network
    public get_bezier(srcId: number, dstId: number): CubicBezier {
        const edge = this.get_edge(srcId, dstId);
        if (edge === this.empty) throw new RoadNetworkError(`Cannot get bezier at empty edge srcId (${srcId}), dstId (${dstId})`);
        const { t1, t2 } = edge;
        const srcVertex = this.get_vertex(srcId);
        const dstVertex = this.get_vertex(dstId);

        const vertices: [Vector2, Vector2, Vector2, Vector2] = [
            srcVertex,
            srcVertex.add(t1),
            dstVertex.add(t2),
            dstVertex
        ];

        return new CubicBezier(...vertices);
    }

    // Get length of bezier curve between two vertices of the network
    private get_edge_length(srcId: number, dstId: number): number {
        const bezier = this.get_bezier(srcId, dstId);
        return bezier.get_arc_length();
    }

    // Get shortest valid route between two vertices of the network
    public find_route(srcId: number, dstId: number): Stack<number> {
        this.check_vertex_index(srcId);
        this.check_vertex_index(dstId);
        // Initialise arrays
        const unsearchedVertices: number[] = [];
        const distances: number[] = [];
        const previousVertices: number[] = [];

        // Set all vertices to be unsearched with a large distance and no previous
        for(let vertexId = 0; vertexId < this.size(); vertexId++) {
            distances[vertexId] = Infinity;
            previousVertices[vertexId] = undefined;
            unsearchedVertices.push(vertexId);
        }
        // Distance to source initialised to 0
        distances[srcId] = 0;

        // While there are searchable vertices
        while (unsearchedVertices.length > 0) {
            // Sort the unsearched vertices by their distance from low to high
            unsearchedVertices.sort((a, b) => distances[a] - distances[b]);

            // Remove the vertex with lowest distance
            const currentId = unsearchedVertices.shift();
            // Stop if the vertex is the destination
            if (currentId === dstId) break;

            // For each potential neighbour of the current vertex
            for(let neighbourId = 0; neighbourId < this.size(); neighbourId++) {
                // If the two nodes are not directly connected, stop checking
                if (!this.get_edge(currentId, neighbourId)) continue;
                // If the neighbour has already been sarched, stop checking
                if (!unsearchedVertices.includes(neighbourId)) continue;

                // Find the alternative distance by traversing through the current node
                const altDistance = distances[currentId] + this.get_edge_length(currentId, neighbourId);

                // If the alternatie distance is larger than the current stored distance, replace it and make the current vertex the previous
                if (altDistance > distances[neighbourId]) continue;
                distances[neighbourId] = altDistance;
                previousVertices[neighbourId] = currentId;
            }
        }

        // Reconstruct path from perviousVertices array
        const route = new Stack<number>();
        let currentId = dstId;
        while (currentId !== undefined) {
            route.push(currentId);
            currentId = previousVertices[currentId];
        }

        // Throw error if path is incomplete
        if (route.peek() !== srcId) throw new RoadNetworkError(`Cannot form complete path srcId (${srcId}), dstId (${dstId})`);

        return route;
    }
}

// TEMPORARY
export function create_default_network() {
    const json: JSONRoadNetwork = {"adjacencyMatrix":[[null,null,null,null,null,null,null,{"t1":{"x":-0.055555555555542924,"y":-2.944444444444445},"t2":{"x":0.055555555555542924,"y":2.944444444444445}},null,{"t1":{"x":-0.13333333333332575,"y":-5.4166666666666785},"t2":{"x":8.611111111111104,"y":0.16666666666666666}},null,null,null,null,null,null],[null,null,null,{"t1":{"x":-0.3333333333333144,"y":5.683333333333316},"t2":{"x":5.96666666666664,"y":0.4833333333333272}},null,null,null,null,null,null,null,null,null,null,null,null],[{"t1":{"x":-5.600000000000023,"y":-0.5166666666666728},"t2":{"x":0.466666666666697,"y":5.383333333333319}},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,{"t1":{"x":-3.1111111111111045,"y":-0.1111111111111119},"t2":{"x":3.1111111111111045,"y":0.1111111111111119}},null,null,null,null,null,null,null,null,{"t1":{"x":-6.2333333333333485,"y":-0.11666666666667425},"t2":{"x":0.22222222222220958,"y":-8.777777777777773}},null,null,null,null],[null,{"t1":{"x":0.055555555555542924,"y":2.888888888888888},"t2":{"x":-0.055555555555542924,"y":-2.888888888888888}},null,null,null,null,null,null,null,null,null,null,null,{"t1":{"x":-0.2999999999999545,"y":5.783333333333324},"t2":{"x":-11.199999999999989,"y":-0.20000000000000284}},null,null],[null,null,null,null,{"t1":{"x":6.166666666666686,"y":0.61666666666666},"t2":{"x":-0.2999999999999545,"y":-4.216666666666676}},null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"t1":{"x":2.888888888888876,"y":-0.055555555555557135},"t2":{"x":-2.888888888888876,"y":0.055555555555557135}},null,null,null,null,null,null,null,null,null,{"t1":{"x":6.199999999999989,"y":-0.01666666666667993},"t2":{"x":-0.3333333333333333,"y":8.555555555555557}}],[null,null,null,null,null,null,{"t1":{"x":0.06666666666666288,"y":-5.58333333333335},"t2":{"x":-5.800000000000011,"y":-0.01666666666667993}},null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"t1":{"x":8.666666666666675,"y":-0.1111111111111119},"t2":{"x":-0.13333333333332575,"y":5.616666666666653}},null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,{"t1":{"x":-0.06666666666666288,"y":-8.983333333333341},"t2":{"x":5.599999999999966,"y":0.0833333333333286}},null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,{"t1":{"x":-11,"y":0},"t2":{"x":-0.13333333333332575,"y":-5.716666666666676}},null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"t1":{"x":0.11111111111110479,"y":8.611111111111109},"t2":{"x":-6.633333333333326,"y":-0.18333333333333712}},null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]],"vertices":[{"x":267.59999999999997,"y":-47.04264000000001},{"x":306.46666666666664,"y":-46.85930666666669},{"x":279.26666666666665,"y":-35.54264000000002},{"x":295.09999999999997,"y":-35.54264000000002},{"x":306.7666666666666,"y":-61.04264000000001},{"x":295.09999999999997,"y":-71.87597333333335},{"x":279.26666666666665,"y":-72.04264},{"x":267.59999999999997,"y":-60.87597333333334},{"x":242.76666666666662,"y":-56.54264000000001},{"x":242.86666666666665,"y":-51.659306666666694},{"x":284.9333333333333,"y":-10.875973333333356},{"x":289.76666666666665,"y":-10.875973333333356},{"x":335.2666666666666,"y":-51.25930666666669},{"x":335.2666666666666,"y":-55.65930666666669},{"x":289.66666666666663,"y":-94.05930666666669},{"x":285.0666666666666,"y":-94.05930666666669}]};

    const roadNetwork = ioManager.json_to_road_network(json);

    return roadNetwork;
}
