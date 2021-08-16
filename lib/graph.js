export default class Graph {
    constructor() {
        this.vertices = [];
        this.adjacencyMatrix = [];
    }
    add_vertex(vertex) {
        this.vertices.push(vertex);
    }
    add_vertices(vertexList) {
        for (const vertex of vertexList) {
            this.add_vertex(vertex);
        }
    }
    remove_vertex(id) {
        this.vertices.splice(id, 1);
        this.adjacencyMatrix.splice(id, 1);
        this.adjacencyMatrix = this.adjacencyMatrix.map((element) => {
            return element.filter((element, index) => index !== id);
        });
    }
    add_edge(srcId, dstId, value) {
        if (!this.adjacencyMatrix[srcId]) {
            this.adjacencyMatrix[srcId] = [];
        }
        this.adjacencyMatrix[srcId][dstId] = value;
    }
    add_edges(edgeList) {
        for (const { srcId, dstId, value } of edgeList) {
            this.add_edge(srcId, dstId, value);
        }
    }
    remove_edge(srcId, dstId) {
        this.adjacencyMatrix[srcId][dstId] = undefined;
    }
    get_vertex(id) {
        return this.vertices[id];
    }
    get_vertices() {
        return this.vertices;
    }
    get_edge(srcId, dstId) {
        if (!this.adjacencyMatrix[srcId]) {
            return undefined;
        }
        return this.adjacencyMatrix[srcId][dstId];
    }
}
