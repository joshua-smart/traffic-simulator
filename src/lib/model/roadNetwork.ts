import Graph from './graph';
import Vector2 from '../vector2';
import Stack from '../stack';
import CubicBezier from './cubicBezier';
import ioManager, { JSONRoadNetwork } from '../controller/ioManager';

type Vertex = Vector2;
type Edge = {t1: Vector2, t2: Vector2};

export default class RoadNetwork extends Graph<Vertex, Edge>{
    constructor() {
        super();
    }

    // Create the bezier curve between two vertices in the network
    public get_bezier(srcId: number, dstId: number): CubicBezier {
        const srcVertex = this.get_vertex(srcId);
        const dstVertex = this.get_vertex(dstId);
        const { t1, t2 } = this.get_edge(srcId, dstId);

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

        const route = new Stack<number>();
        let currentId = dstId;

        while (currentId != undefined) {
            route.push(currentId);
            currentId = previousVertices[currentId];
        }
        return route;
    }
}

// TEMPORARY
export function create_default_network() {
    const json: JSONRoadNetwork = {"adjacencyMatrix":[[null,null,{"t1":{"x":0,"y":0},"t2":{"x":16.200000000000045,"y":29.999999999999986}},null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,{"t1":{"x":-23.399999999999977,"y":0},"t2":{"x":1.8240000000000123,"y":26.231999999999957}},null,null,null,null,null,null,null,null,null,null,null],[null,{"t1":{"x":-15,"y":27.599999999999994},"t2":{"x":0,"y":0}},{"t1":{"x":-22.80000000000001,"y":4.799999999999997},"t2":{"x":25.200000000000045,"y":3.5999999999999943}},null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"t1":{"x":-4.175999999999988,"y":-21.768000000000043},"t2":{"x":-3.076000000000022,"y":22.531999999999957}},null,null,null,null,null,{"t1":{"x":-24.666666666666686,"y":-20.17235056559245},"t2":{"x":0,"y":0}},null,null,null,null],[null,null,null,null,null,null,{"t1":{"x":-0.07600000000002183,"y":-25.46800000000004},"t2":{"x":-27.599999999999966,"y":1.2000000000000028}},null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"t1":{"x":21,"y":-2.3999999999999986},"t2":{"x":-21.600000000000023,"y":-1.7999999999999972}},null,null,null,null,null,null,{"t1":{"x":15.600000000000023,"y":-28.199999999999996},"t2":{"x":0,"y":0}},null],[null,null,null,null,null,null,null,null,{"t1":{"x":25.19999999999999,"y":0},"t2":{"x":-2.3999999999999773,"y":-29.4}},null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,{"t1":{"x":4.199999999999989,"y":19.799999999999997},"t2":{"x":3.6000000000000227,"y":-19.799999999999997}},null,null,{"t1":{"x":24,"y":18.6},"t2":{"x":-0.6000000000000227,"y":-0.5999999999999996}},null,null,null],[null,null,null,{"t1":{"x":-1.8000000000000114,"y":21.599999999999994},"t2":{"x":28.80000000000001,"y":-0.5999999999999943}},null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,{"t1":{"x":0,"y":0},"t2":{"x":-24.676000000000016,"y":13.53199999999996}},null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,{"t1":{"x":0,"y":0},"t2":{"x":25.19999999999999,"y":-16.799999999999997}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"t1":{"x":0,"y":0},"t2":{"x":-16.80000000000001,"y":-25.79999999999999}},null,null,null,null,null,null,null,null]],"vertices":[{"x":339.224,"y":216.33768389892575},{"x":363.224,"y":217.53768389892574},{"x":317.62399999999997,"y":98.73768389892574},{"x":374.024,"y":97.53768389892574},{"x":266,"y":51.50568389892578},{"x":265.5,"y":-2.9943161010742188},{"x":311.62399999999997,"y":-55.46231610107426},{"x":366.824,"y":-56.66231610107426},{"x":427.424,"y":-5.062316101074259},{"x":427.424,"y":47.73768389892574},{"x":159.224,"y":10.53768389892574},{"x":159.82399999999998,"y":35.13768389892574},{"x":539.4639999999999,"y":10.129683898925736},{"x":540.064,"y":34.129683898925734},{"x":326.62399999999997,"y":-159.26231610107425},{"x":350.024,"y":-161.06231610107426}]};

    const roadNetwork = ioManager.json_to_road_network(json);

    return roadNetwork;
}
