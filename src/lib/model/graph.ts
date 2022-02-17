// Custom error class
export class GraphError extends Error {
    public name = "GraphError";
    constructor(message?: string) {
        super(message);
    }
}

export default class Graph<Vertex, Edge> {
    private adjacencyMatrix: Edge[][];
    private vertices: Vertex[];
    public readonly empty: Edge;

    constructor() {
        this.adjacencyMatrix = [];
        this.vertices = [];
        // Constant for empty edges declared here for type consistency
        this.empty = <Edge><unknown>null;
    }

    public size() {
        return this.vertices.length;
    }

    // Adds vertex to vertices array and ads a row and column to adjacencyMatrix
    public add_vertex(vertex: Vertex): number {
        // Add vertex to vertex array
        this.vertices.push(vertex);
        // Push an extra empty element to each row of the adjacency matrix
        this.adjacencyMatrix.forEach(row => row.push(this.empty));
        // Add a new row filled with empty elements to the bottom of the adjacency matrix
        this.adjacencyMatrix.push(new Array(this.vertices.length).fill(this.empty));
        // Return index of added vertex
        return this.vertices.length - 1;
    }

    // If vertexId is valid, set vertex to vertices array
    public set_vertex(vertexId: number, value: Vertex): void {
        this.check_vertex_index(vertexId);
        this.vertices[vertexId] = value;
    }

    // If vertexId is valid, get vertex from array
    public get_vertex(vertexId: number): Vertex {
        this.check_vertex_index(vertexId);
        return this.vertices[vertexId];
    }

    // Removes vertex from vertex array and removes it's row and column from adjacencyMatrix
    public remove_vertex(vertexId: number): Vertex {
        this.check_vertex_index(vertexId);
        const removedVertex = this.vertices[vertexId];
        this.vertices.splice(vertexId, 1);
        this.adjacencyMatrix.splice(vertexId, 1);
        this.adjacencyMatrix.forEach(row => row.splice(vertexId, 1));
        return removedVertex;
    }

    // If srcId,dstId represents a valid edge, set the value of the edge 
    public set_edge(srcId: number, dstId: number, value: Edge): void {
        this.check_edge_index(srcId, dstId);
        this.adjacencyMatrix[srcId][dstId] = value;
    }

    // If srcId,dstId represents a valid edge, get the value of the edge
    public get_edge(srcId: number, dstId: number): Edge {
        this.check_edge_index(srcId, dstId);
        return this.adjacencyMatrix[srcId][dstId];
    }

    // // If srcId,dstId represents a valid edge, set the value of the edge in the adjecency matrix to empty
    public remove_edge(srcId: number, dstId: number): Edge {
        this.check_edge_index(srcId, dstId);
        const removedEdge = this.adjacencyMatrix[srcId][dstId];
        this.adjacencyMatrix[srcId][dstId] = this.empty;
        return removedEdge;
    }

    // Internally used check for valid vertexId
    protected check_vertex_index(vertexId: number): void {
        if(vertexId < 0 || vertexId >= this.vertices.length) {
            throw new GraphError(`vertexId (${vertexId}) out of range for length (${this.vertices.length})`);
        }
    }

    // Internally used check for valid edge location
    protected check_edge_index(srcId: number, dstId: number): void {
        if(srcId < 0 || srcId >= this.vertices.length || dstId < 0 || dstId >= this.vertices.length) {
            throw new GraphError(`srcId (${srcId}), dstId (${dstId}) out of range for length (${this.vertices.length})`);
        }
    }

    // Bredth-first graph traversal
    public traverse(srcId: number): number[] {
        // Throw error if srcId is invalid
        this.check_vertex_index(srcId);
        const visited = [];
        const searchable = [srcId];

        while (searchable.length > 0) {
	    // Remove and store first element of searchable array, and set as visited
            const current = searchable.shift();
            visited.push(current);

            for(let neighbourId = 0; neighbourId < this.size(); neighbourId++) {
                // If no edge exists, skip neighbour
                if (this.get_edge(current, neighbourId) === this.empty) continue;
                // If neighbour is already visited, skip
                if (visited.includes(neighbourId)) continue;
                // If both tests pass, add neighbour to searchable queue
                searchable.push(neighbourId);
            }
        }
        // Return the array of vertices that have been visited by the traversal
        return visited;
    }
}
