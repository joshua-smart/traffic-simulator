import RoadNetwork from "../model/roadNetwork";
import Vector2 from "../vector2";
import Canvas from "./canvas";
import CubicBezier from "./cubicBezier";
import Transform from "./transform";
import { GhostEdge } from "./view";

export default class RoadNetworkCanvas extends Canvas {
    private vertexContainer: HTMLElement;

    constructor() {
        const element = <HTMLCanvasElement>document.querySelector('#road-network-canvas');
        super(element);

        this.vertexContainer = document.querySelector('#vertex-container');
    }

    public draw(roadNetwork: RoadNetwork, transform: Transform, ghostEdge: GhostEdge): void {
        this.clear();
        if (ghostEdge) this.draw_ghost_edge(roadNetwork, transform, ghostEdge);
        this.draw_edges(roadNetwork, transform);
        this.draw_vertices(roadNetwork, transform);
    }

    private draw_ghost_edge(roadNetwork: RoadNetwork, transform: Transform, {srcId, end}: GhostEdge) {
        const srcWorldPosition = roadNetwork.get_vertex(srcId);
        const srcScreenPosition = transform.to_screen_space(srcWorldPosition);

        this.line(srcScreenPosition, end, {color: 'lightgrey', width: 10 * transform.get_scale(), cap: 'round'});
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

    private draw_edges(roadNetwork: RoadNetwork, transform: Transform): void {

        for(let srcId = 0; srcId < roadNetwork.size(); srcId++) {
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                this.draw_edge(roadNetwork, srcId, dstId, transform);
            }
        }
    }

    private draw_edge(roadNetwork: RoadNetwork, srcId: number, dstId: number, transform: Transform): void {
        const edge = roadNetwork.get_edge(srcId, dstId);
        if (!edge) return;

        const worldVertices = [
            roadNetwork.get_vertex(srcId),
            roadNetwork.get_vertex(srcId).add(edge.p1),
            roadNetwork.get_vertex(dstId).add(edge.p2),
            roadNetwork.get_vertex(dstId)
        ];

        const screenVertices = worldVertices.map((vertex) => transform.to_screen_space(vertex));

        const bezier = new CubicBezier(screenVertices[0], screenVertices[1], screenVertices[2], screenVertices[3]);
        this.bezier(bezier,
            {color: 'lightgrey', width: 10 * transform.get_scale(), cap: 'round'},
            {color: 'grey', line: {color: 'transparent', width: 1}}
        );
    }
}
