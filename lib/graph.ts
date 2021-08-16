export default class Graph<Vertex, Edge> {
    private vertices: Vertex[];
    private adjacencyMatrix: Edge[][];

    constructor() {
        this.vertices = [];
        this.adjacencyMatrix = [];
    }

    public add_vertex(vertex: Vertex): void {
        this.vertices.push(vertex);
    }

    public add_vertices(vertexList: Vertex[]): void {
        for(const vertex of vertexList) {
            this.add_vertex(vertex);
        }
    }

    public remove_vertex(id: number): void {
        this.vertices.splice(id, 1);
        this.adjacencyMatrix.splice(id, 1);
        this.adjacencyMatrix = this.adjacencyMatrix.map((element: Edge[]) => {
            return element.filter((element, index) => index !== id);
        });
    }

    public add_edge(srcId: number, dstId: number, value: Edge): void {
        if (!this.adjacencyMatrix[srcId]) {
            this.adjacencyMatrix[srcId] = [];
        }
        this.adjacencyMatrix[srcId][dstId] = value;
    }

    public add_edges(edgeList: {srcId: number, dstId: number, value: Edge}[]): void {
        for(const {srcId, dstId, value} of edgeList) {
            this.add_edge(srcId, dstId, value);
        }
    }

    public remove_edge(srcId: number, dstId: number): void {
        this.adjacencyMatrix[srcId][dstId] = undefined;
    }

    public get_vertex(id: number): Vertex {
        return this.vertices[id];
    }

    public get_vertices(): Vertex[] {
        return this.vertices;
    }

    public get_edge(srcId: number, dstId: number): Edge {
        if (!this.adjacencyMatrix[srcId]) {
            return undefined;
        }
        return this.adjacencyMatrix[srcId][dstId];
    }
}