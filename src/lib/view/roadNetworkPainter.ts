import RoadNetwork from "../model/roadNetwork";
import Vector2 from "../vector2";
import Canvas from "./canvas";
import Transform from "./transform";

export type GhostEdge = {
    srcId: number,
    end: Vector2
};

export default class RoadNetworkPainter {
    private vertexContainer: HTMLElement;
    private handleContainer: HTMLElement;
    private ghostEdge: GhostEdge;

    constructor() {
        this.ghostEdge = null;
        this.vertexContainer = document.querySelector('#vertex-container');
        this.handleContainer = document.querySelector('#handle-container');
    }

    public draw(canvas: Canvas, roadNetwork: RoadNetwork, transform: Transform): void {
        if (this.ghostEdge) this.draw_ghost_edge(canvas, roadNetwork, transform);
        this.draw_edges(canvas, roadNetwork, transform);
        this.draw_vertices(roadNetwork, transform);
        this.draw_handles(roadNetwork, transform);
    }

    private draw_ghost_edge(canvas: Canvas, roadNetwork: RoadNetwork, transform: Transform) {
        const srcWorldPosition = roadNetwork.get_vertex(this.ghostEdge.srcId);
        const worldEnd = transform.to_world_space(this.ghostEdge.end);

        canvas.line(srcWorldPosition, worldEnd, {color: 'lightgrey', width: 10 * transform.get_scale(), cap: 'round'});
    }

    private draw_vertices(roadNetwork: RoadNetwork, transform: Transform): void {
        this.vertexContainer.innerHTML = '';

        for(let vertexId = 0; vertexId < roadNetwork.size(); vertexId++) {
            const vertex = roadNetwork.get_vertex(vertexId);
            this.draw_vertex(vertexId, vertex, transform);
        }
    }

    private draw_vertex(vertexId: number, vertex: Vector2, transform: Transform): void {
        const screenVertex = transform.to_screen_space(vertex);
        const vertexElement = document.createElement('div');
        vertexElement.className = 'vertex';
        vertexElement.style.left = `${screenVertex.x}px`;
        vertexElement.style.top = `${screenVertex.y}px`;
        vertexElement.style.transform = `translate(-50%, -50%) scale(${transform.get_scale()})`;
        vertexElement.setAttribute('vertexId', String(vertexId));

        this.vertexContainer.appendChild(vertexElement);
    }

    private draw_edges(canvas: Canvas, roadNetwork: RoadNetwork, transform: Transform): void {

        for(let srcId = 0; srcId < roadNetwork.size(); srcId++) {
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                this.draw_edge(canvas, roadNetwork, srcId, dstId, transform);
            }
        }
    }

    private draw_edge(canvas: Canvas, roadNetwork: RoadNetwork, srcId: number, dstId: number, transform: Transform): void {
        const edge = roadNetwork.get_edge(srcId, dstId);
        if (!edge) return;

        const bezier = roadNetwork.get_bezier(srcId, dstId);

        canvas.bezier(bezier,
            {color: 'lightgrey', width: 10 * transform.get_scale(), cap: 'round'},
            {color: 'grey', line: {color: 'transparent', width: 1}}
        );

        const srcVertex = roadNetwork.get_vertex(srcId);
        const dstVertex = roadNetwork.get_vertex(dstId);
        const { t1, t2 } = roadNetwork.get_edge(srcId, dstId);

        canvas.line(srcVertex, srcVertex.add(t1), {color: '#88888840', width: 2});
        canvas.line(dstVertex, dstVertex.add(t2), {color: '#88888840', width: 2});
    }

    public set_ghost_edge(srcId: number, end: Vector2): void {
        this.ghostEdge = {srcId, end};
    }

    public remove_ghost_edge(): void {
        this.ghostEdge = null;
    }

    private draw_handles(roadNetwork: RoadNetwork, transform: Transform): void {
        this.handleContainer.innerHTML = '';

        for(let srcId = 0; srcId < roadNetwork.size(); srcId++) {
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                this.draw_handle(roadNetwork, srcId, dstId, 'start', transform);
                this.draw_handle(roadNetwork, srcId, dstId, 'end', transform);
            }
        }
    }

    private draw_handle(roadNetwork: RoadNetwork, srcId: number, dstId: number, position: 'start' | 'end', transform: Transform): void {
        const edge = roadNetwork.get_edge(srcId, dstId);
        if (!edge) return;
        const base = position == 'start' ? roadNetwork.get_vertex(srcId) : roadNetwork.get_vertex(dstId);
        const handle = position == 'start' ? edge.t1 : edge.t2;

        const screenHandle = transform.to_screen_space(handle.add(base));
        const handleElement = document.createElement('div');
        handleElement.className = 'handle';
        handleElement.style.left = `${screenHandle.x}px`;
        handleElement.style.top = `${screenHandle.y}px`;
        handleElement.style.transform = `translate(-50%, -50%) scale(${transform.get_scale()})`;

        handleElement.setAttribute('srcId', String(srcId));
        handleElement.setAttribute('dstId', String(dstId));
        handleElement.setAttribute('position', position);

        this.handleContainer.appendChild(handleElement);
    }
}
