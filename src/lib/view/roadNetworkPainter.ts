import RoadNetwork from "../model/roadNetwork";
import Vector2 from "../vector2";
import Canvas from "./canvas";
import Transform from "./transform";

export type GhostEdge = {
    srcId: number,
    end: Vector2
};

export default class RoadNetworkPainter {
    // HTML element containing the vertices in the network
    private vertexContainer: HTMLElement;
    // HTML element containing the curve handles in the network
    private handleContainer: HTMLElement;
    // Used the show an edge during its creation
    private ghostEdge: GhostEdge;

    constructor() {
        this.ghostEdge = null;
        // Get container elements from the UI
        this.vertexContainer = document.querySelector('#vertex-container');
        this.handleContainer = document.querySelector('#handle-container');
    }

    // Clear all vertices and handles
    public clear(): void {
        this.vertexContainer.innerHTML = '';
        this.handleContainer.innerHTML = '';
    }

    // If a ghost edge is defined draw edge from srcId to Vector2 position
    private draw_ghost_edge(canvas: Canvas, roadNetwork: RoadNetwork, transform: Transform) {
        // Transform the 2 vector positions
        const srcWorldPosition = roadNetwork.get_vertex(this.ghostEdge.srcId);
        const worldEnd = transform.to_world_space(this.ghostEdge.end);

        // Draw the ghost edge
        canvas.line(srcWorldPosition, worldEnd, {color: 'lightgrey', width: 2 * transform.get_scale(), cap: 'round'});
    }

    // Create HTML elements for the vertices of the road network
    public draw_vertices(roadNetwork: RoadNetwork, transform: Transform): void {
        for(let vertexId = 0; vertexId < roadNetwork.size(); vertexId++) {
            const vertex = roadNetwork.get_vertex(vertexId);
            this.draw_vertex(vertexId, vertex, transform);
        }
    }

    // Add positions and styles to vertex element, then draw to UI
    private draw_vertex(vertexId: number, vertex: Vector2, transform: Transform): void {
        // Transform its position to screen space
        const screenVertex = transform.to_screen_space(vertex);
        // Create a bew HTML element for the vertex
        const vertexElement = document.createElement('div');
        // Set the elements className and position to reflect the vertex's values
        vertexElement.className = 'vertex';
        vertexElement.style.left = `${screenVertex.x}px`;
        vertexElement.style.top = `${screenVertex.y}px`;
        // Apply the scale from the current transform to ensure consistent sizing of vertices when zooming in/out
        vertexElement.style.transform = `translate(-50%, -50%) scale(${transform.get_scale()})`;
        // Set the vertexId attribute to identify this element with a vertex in the network
        vertexElement.setAttribute('vertexId', String(vertexId));

        // Add the element to the vertex container
        this.vertexContainer.appendChild(vertexElement);
    }

    // For each src and dst vertex, if an edge exists, draw it
    public draw_roads(canvas: Canvas, roadNetwork: RoadNetwork, transform: Transform): void {
        for(let srcId = 0; srcId < roadNetwork.size(); srcId++) {
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                // Attempt to draw a road between srcId and dstId
                this.draw_road(canvas, roadNetwork, srcId, dstId, transform);
            }
        }

        if (this.ghostEdge) this.draw_ghost_edge(canvas, roadNetwork, transform);
    }

    // Get and draw the bezier curve represented by a given edge
    private draw_road(canvas: Canvas, roadNetwork: RoadNetwork, srcId: number, dstId: number, transform: Transform): void {
        const edge = roadNetwork.get_edge(srcId, dstId);
        // If there is no edge between these 2 vertices, do not attempt to draw the edge
        if (!edge) return;

        // Get bezier curve represented by this edge
        const bezier = roadNetwork.get_bezier(srcId, dstId);

        // Draw bexier curve to the canvas
        canvas.bezier(bezier,
            {color: 'lightgrey', width: 2 * transform.get_scale(), cap: 'round'},
            {color: 'grey', line: {color: 'transparent', width: 1}}
        );
    }

    public set_ghost_edge(srcId: number, end: Vector2): void {
        this.ghostEdge = {srcId, end};
    }

    public remove_ghost_edge(): void {
        this.ghostEdge = null;
    }

    // For each pair of vertices, attempt to draw the start and end handle
    public draw_handles(canvas: Canvas, roadNetwork: RoadNetwork, transform: Transform): void {
        for(let srcId = 0; srcId < roadNetwork.size(); srcId++) {
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                this.draw_handle(canvas, roadNetwork, srcId, dstId, 'start', transform);
                this.draw_handle(canvas, roadNetwork, srcId, dstId, 'end', transform);
            }
        }
    }

    // Set positions and attributes of handle element and draw to UI
    private draw_handle(canvas: Canvas, roadNetwork: RoadNetwork, srcId: number, dstId: number, position: 'start' | 'end', transform: Transform): void {
        const edge = roadNetwork.get_edge(srcId, dstId);
        // If no edge exists, do not attempt to draw the handle
        if (!edge) return;

        // Get base and handle vectors depending on whether this is a start or end handle
        const base = position === 'start' ? roadNetwork.get_vertex(srcId) : roadNetwork.get_vertex(dstId);
        const handle = position === 'start' ? edge.t1 : edge.t2;

        // Transform the handle position to screen space
        const screenHandle = transform.to_screen_space(handle.add(base));
        // Create a new HTML element for the handle
        const handleElement = document.createElement('div');
        // Set the className and position of the element to reflect the values of the handle
        handleElement.className = 'handle';
        handleElement.style.left = `${screenHandle.x}px`;
        handleElement.style.top = `${screenHandle.y}px`;
        // Apply the scale from the current transform to ensure consistent sizing of handles when zooming in/out
        handleElement.style.transform = `translate(-50%, -50%) scale(${transform.get_scale()})`;

        // Set srcId, dstId and position attributes to identify the element to a handle
        handleElement.setAttribute('srcId', String(srcId));
        handleElement.setAttribute('dstId', String(dstId));
        handleElement.setAttribute('position', position);

        // Add the element to the handle container
        this.handleContainer.appendChild(handleElement);

        // Draw a translucent line between the handle and its vertex
        canvas.line(base, handle.add(base), {color: '#88888840', width: 2});
    }
}
