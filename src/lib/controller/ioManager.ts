import RoadNetwork from "../model/roadNetwork";
import { saveAs } from 'file-saver';
import Vector2 from "../vector2";

type JSONRoadNetwork = {
    adjacencyMatrix: {
        p1: {x: number, y: number}, p2: {x: number, y: number}
    }[][],
    vertices: {x: number, y: number}[]
}

export default class IOManager {
    public static save_road_network(roadNetwork: RoadNetwork): void {
        var file = new File([JSON.stringify(roadNetwork)], 'my road network.json', {type: 'application/json;charset=utf-8'});
        saveAs(file);
    }

    public static async load_road_network(callback: (roadNetwork: RoadNetwork) => void) {
        const fileInput = <HTMLInputElement>document.querySelector('#file-input')
        fileInput.click();
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            const json = <JSONRoadNetwork>JSON.parse(await file.text());

            const roadNetwork = this.json_to_road_network(json);
            callback(roadNetwork);
        }
    }

    private static json_to_road_network(json: JSONRoadNetwork) {
        const roadNetwork = new RoadNetwork();

        for(let vertexId = 0; vertexId < json.vertices.length; vertexId++) {
            const jsonVertex = json.vertices[vertexId];
            const vertex = new Vector2(jsonVertex.x, jsonVertex.y);
            roadNetwork.add_vertex(vertex);
        }

        for(let srcId = 0; srcId < roadNetwork.size(); srcId++) {
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                const jsonEdge = json.adjacencyMatrix[srcId][dstId];
                if (jsonEdge) {
                    const p1 = new Vector2(jsonEdge.p1.x, jsonEdge.p1.y);
                    const p2 = new Vector2(jsonEdge.p2.x, jsonEdge.p2.y);

                    roadNetwork.set_edge(srcId, dstId, {p1, p2});
                }
            }
        }

        return roadNetwork;
    }
}
