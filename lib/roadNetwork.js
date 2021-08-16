import Graph from "./graph.js";
import Vector2 from "./vector2.js";
export default class RoadNetwork extends Graph {
    constructor() {
        super();
    }
    static async load_road_network(filepath) {
        const response = await fetch(filepath);
        const { vertices, adjacencyMatrix } = await response.json();
        const vertexList = vertices.map(({ x, y }) => new Vector2(x, y));
        const roadNetwork = new RoadNetwork();
        roadNetwork.add_vertices(vertexList);
        for (let i = 0; i < adjacencyMatrix.length; i++) {
            for (let j = 0; j < adjacencyMatrix[i].length; j++) {
                const edgeValue = adjacencyMatrix[i][j];
                roadNetwork.add_edge(i, j, edgeValue);
            }
        }
        return roadNetwork;
    }
}
