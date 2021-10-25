export default class Graph<Vertex, Edge> {
    private adjacencyMatrix: Edge[][];
    private vertices: Vertex[];
    private empty: Edge;

    constructor() {
        this.adjacencyMatrix = [];
        this.vertices = [];
        this.empty = <Edge><unknown>null;
    }

    public get_size() {
        return this.vertices.length;
    }

    public add_vertex(vertex: Vertex): number {
        this.vertices.push(vertex);
        this.adjacencyMatrix.forEach(row => row.push(this.empty));
        this.adjacencyMatrix.push(new Array(this.vertices.length));
        return this.vertices.length - 1;
    }

    public set_vertex(vertexId: number, value: Vertex): void {
        this.check_vertex_index(vertexId);
        this.vertices[vertexId] = value;
    }

    public get_vertex(vertexId: number): Vertex {
        this.check_vertex_index(vertexId);
        return this.vertices[vertexId];
    }

    public remove_vertex(vertexId: number): Vertex {
        this.check_vertex_index(vertexId);
        const removedVertex = this.vertices[vertexId];
        this.adjacencyMatrix.splice(vertexId, 1);
        this.adjacencyMatrix.forEach(row => row.splice(vertexId, 1));
        return removedVertex;
    }

    public set_edge(srcId: number, dstId: number, value: Edge): void {
        this.check_edge_index(srcId, dstId);
        this.adjacencyMatrix[srcId][dstId] = value;
    }

    public get_edge(srcId: number, dstId: number): Edge {
        this.check_edge_index(srcId, dstId);
        return this.adjacencyMatrix[srcId][dstId];
    }

    public remove_edge(srcId: number, dstId: number): Edge {
        this.check_edge_index(srcId, dstId);
        const removedEdge = this.adjacencyMatrix[srcId][dstId];
        this.adjacencyMatrix[srcId][dstId] = this.empty;
        return removedEdge;
    }

    private check_vertex_index(vertexId: number): void {
        if(vertexId < 0 || vertexId >= this.vertices.length) {
            throw new Error(`vertexId (${vertexId}) out of range for length (${this.vertices.length})`);
        }
    }

    private check_edge_index(srcId: number, dstId: number): void {
        if(srcId < 0 || srcId >= this.vertices.length || dstId < 0 || dstId >= this.vertices.length) {
            throw new Error(`srcId (${srcId}), dstId (${dstId}) out of range for length (${this.vertices.length})`);
        }
    }
}
