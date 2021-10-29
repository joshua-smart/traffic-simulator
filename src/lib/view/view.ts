import Model from '../model/model';
import Vector2 from '../vector2';
import RoadNetworkCanvas from './roadNetworkCanvas';
import Transform from './transform';

export type GhostEdge = {
    srcId: number,
    end: Vector2
};

export default class View {
    private model: Model;
    private roadNetworkCanvas: RoadNetworkCanvas;
    private transform: Transform;
    private ghostEdge: GhostEdge;

    constructor(model: Model) {
        this.model = model;
        this.roadNetworkCanvas = new RoadNetworkCanvas();
        this.transform = new Transform(new Vector2(100, 200), 2);

        this.redraw();
    }

    public redraw(): void {
        this.roadNetworkCanvas.draw(this.model.get_road_network(), this.transform, this.ghostEdge);
    }

    public get_canvas_element(): HTMLElement {
        return document.querySelector('#canvas-container');
    }

    public get_canvas_offset(): number {
        return this.roadNetworkCanvas.get_dom_element().getBoundingClientRect().top;
    }

    public pan_display(delta: Vector2): void {
        this.transform.translate(delta);
        this.redraw();
    }

    public zoom_display(center: Vector2, factor: number): void {
        this.transform.zoom(center, factor);
        this.redraw();
    }

    public to_world_space(vector: Vector2): Vector2 {
        return this.transform.to_world_space(vector);
    }

    public set_ghost_edge(srcId: number, end: Vector2): void {
        this.ghostEdge = {srcId, end};
    }

    public remove_ghost_edge(): void {
        this.ghostEdge = null;
    }
}
