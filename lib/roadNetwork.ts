import Graph from "./graph.js";
import Vector2 from "./vector2.js";

type RoadNetworkData = {vertices: {x: number, y: number}[], adjacencyMatrix: number[][]};

export default class RoadNetwork extends Graph<Vector2, number> {

    constructor() {
        super();
    }

    public static async load_road_network(filepath: string) {
        const response: Response = await fetch(filepath);
        const {vertices, adjacencyMatrix}: RoadNetworkData = await response.json();

        const vertexList: Vector2[] = vertices.map(({x, y}) => new Vector2(x, y));

        const roadNetwork = new RoadNetwork();
        roadNetwork.add_vertices(vertexList);

        for(let i = 0; i < adjacencyMatrix.length; i++) {
            for(let j = 0; j < adjacencyMatrix[i].length; j++) {
                const edgeValue = adjacencyMatrix[i][j];
                roadNetwork.add_edge(i, j, edgeValue);
            }
        }

        return roadNetwork;
    }
}