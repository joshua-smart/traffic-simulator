import Vector2 from "./vector2.js";
export default class Canvas {
    constructor(parentElement) {
        this.canvasRootElement = document.createElement('div');
        this.canvasRootElement.className = 'canvas';
        parentElement.appendChild(this.canvasRootElement);
        this.transform = { scale: 2, origin: new Vector2(100, 100) };
    }
    draw(roadNetwork) {
        this.canvasRootElement.innerHTML = '';
        this.draw_graph_edges(roadNetwork);
        this.draw_graph_vertices(roadNetwork);
    }
    draw_graph_edges(roadNetwork) {
        const canvasElement = this.create_canvas_element();
        this.canvasRootElement.appendChild(canvasElement);
        const context = canvasElement.getContext('2d');
        context.beginPath();
        const vertices = roadNetwork.get_vertices();
        for (let i = 0; i < vertices.length; i++) {
            for (let j = 0; j < vertices.length; j++) {
                const edgeValue = roadNetwork.get_edge(i, j);
                if (edgeValue) {
                    this.draw_edge(i, j, context, roadNetwork);
                }
            }
        }
        context.stroke();
    }
    draw_edge(i, j, context, roadNetwork) {
        const srcWorldPosition = roadNetwork.get_vertex(i);
        const dstWorldPosition = roadNetwork.get_vertex(j);
        const srcScreenPosition = this.world_to_screen_position(srcWorldPosition);
        const dstScreenPosition = this.world_to_screen_position(dstWorldPosition);
        context.moveTo(srcScreenPosition.x, srcScreenPosition.y);
        context.lineTo(dstScreenPosition.x, dstScreenPosition.y);
    }
    create_canvas_element() {
        const element = document.createElement('canvas');
        element.width = this.canvasRootElement.clientWidth;
        element.height = this.canvasRootElement.clientHeight;
        element.className = 'road-network-canvas';
        return element;
    }
    draw_graph_vertices(roadNetwork) {
        const vertices = roadNetwork.get_vertices();
        for (let i = 0; i < vertices.length; i++) {
            const worldPosition = vertices[i];
            const vertexElement = this.create_vertex_element(worldPosition, i);
            this.canvasRootElement.appendChild(vertexElement);
        }
    }
    create_vertex_element(worldPosition, i) {
        const screenPosition = this.world_to_screen_position(worldPosition);
        const element = document.createElement('div');
        element.className = 'vertex';
        element.id = `vertex${i}`;
        element.innerText = `${i}`;
        element.style.left = `${screenPosition.x}px`;
        element.style.top = `${screenPosition.y}px`;
        return element;
    }
    world_to_screen_position(worldPosition) {
        return worldPosition.add(this.transform.origin)
            .mult(this.transform.scale);
    }
    get_canvas_root_element() {
        return this.canvasRootElement;
    }
    move_origin(deltaPos) {
        this.transform.origin = this.transform.origin.add(deltaPos.mult(1 / this.transform.scale));
    }
}
