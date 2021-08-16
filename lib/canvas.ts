import Vector2 from "./vector2.js";
import RoadNetwork from "./roadNetwork.js";

type Transform = {scale: number, origin: Vector2};

export default class Canvas {

    private canvasRootElement: HTMLDivElement;
    private transform: Transform;

    constructor(parentElement: HTMLElement) {
        this.canvasRootElement = document.createElement('div');
        this.canvasRootElement.className = 'canvas';
        parentElement.appendChild(this.canvasRootElement);

        this.transform = {scale: 2, origin: new Vector2(100, 100)};
    }

    public draw(roadNetwork: RoadNetwork): void {
        this.canvasRootElement.innerHTML = '';

        this.draw_graph_edges(roadNetwork);
        this.draw_graph_vertices(roadNetwork);
    }

    private draw_graph_edges(roadNetwork: RoadNetwork): void {
        const canvasElement: HTMLCanvasElement = this.create_canvas_element();
        this.canvasRootElement.appendChild(canvasElement);
        const context: CanvasRenderingContext2D = canvasElement.getContext('2d');
        context.beginPath();

        const vertices: Vector2[] = roadNetwork.get_vertices();

        for(let i = 0; i < vertices.length; i++) {
            for(let j = 0; j < vertices.length; j++) {
                const edgeValue: number = roadNetwork.get_edge(i, j);

                if (edgeValue) {
                    this.draw_edge(i, j, context, roadNetwork);
                }
            }
        }

        context.stroke();
    }

    private draw_edge(i: number, j: number, context: CanvasRenderingContext2D, roadNetwork: RoadNetwork): void {
        const srcWorldPosition: Vector2 = roadNetwork.get_vertex(i);
        const dstWorldPosition: Vector2 = roadNetwork.get_vertex(j);

        const srcScreenPosition: Vector2 = this.world_to_screen_position(srcWorldPosition);
        const dstScreenPosition: Vector2 = this.world_to_screen_position(dstWorldPosition);

        context.moveTo(srcScreenPosition.x, srcScreenPosition.y);
        context.lineTo(dstScreenPosition.x, dstScreenPosition.y);
    }

    private create_canvas_element(): HTMLCanvasElement {
        const element: HTMLCanvasElement = document.createElement('canvas');
        element.width = this.canvasRootElement.clientWidth;
        element.height = this.canvasRootElement.clientHeight;
        element.className = 'road-network-canvas';

        return element;
    }

    private draw_graph_vertices(roadNetwork: RoadNetwork): void {
        const vertices: Vector2[] = roadNetwork.get_vertices();
        for(let i = 0; i < vertices.length; i++) {
            const worldPosition: Vector2 = vertices[i];
            const vertexElement: HTMLDivElement = this.create_vertex_element(worldPosition, i);
            this.canvasRootElement.appendChild(vertexElement);
        }
    }

    private create_vertex_element(worldPosition: Vector2, i: number): HTMLDivElement {
        const screenPosition: Vector2 = this.world_to_screen_position(worldPosition);
        const element: HTMLDivElement = document.createElement('div');
        element.className = 'vertex';
        element.id = `vertex${i}`;
        element.innerText = `${i}`;
        element.style.left = `${screenPosition.x}px`;
        element.style.top = `${screenPosition.y}px`;
        return element;
    }

    private world_to_screen_position(worldPosition: Vector2): Vector2 {
        return worldPosition.add(this.transform.origin)
            .mult(this.transform.scale);
    }

    public get_canvas_root_element(): HTMLDivElement {
        return this.canvasRootElement;
    }

    public move_origin(deltaPos: Vector2): void {
        this.transform.origin = this.transform.origin.add(deltaPos.mult(1/this.transform.scale));
    }
}
