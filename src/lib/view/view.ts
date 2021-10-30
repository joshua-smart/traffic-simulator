import Model from '../model/model';
import Vector2 from '../vector2';
import Canvas from './canvas';
import RoadNetworkPainter from './roadNetworkPainter';
import Transform from './transform';

export default class View {
    private model: Model;
    private canvas: Canvas;
    private roadNetworkPainter: RoadNetworkPainter;
    private transform: Transform;

    constructor(model: Model) {
        this.model = model;
        const canvasElement = <HTMLCanvasElement>document.querySelector('#main-canvas');
        this.canvas = new Canvas(canvasElement);
        this.roadNetworkPainter = new RoadNetworkPainter(this.canvas);
        this.transform = new Transform(new Vector2(100, 200), 2);

        this.redraw();
    }

    public redraw(): void {
        this.roadNetworkPainter.draw(this.model.get_road_network(), this.transform);
    }

    public get_canvas_element(): HTMLElement {
        return document.querySelector('#canvas-container');
    }

    public get_canvas_offset(): number {
        return this.canvas.get_dom_element().getBoundingClientRect().top;
    }

    public pan_display(delta: Vector2): void {
        this.transform.translate(delta);
    }

    public zoom_display(center: Vector2, factor: number): void {
        this.transform.zoom(center, factor);
    }

    public to_world_space(vector: Vector2): Vector2 {
        return this.transform.to_world_space(vector);
    }

    public set_ghost_edge(srcId: number, end: Vector2): void {
        this.roadNetworkPainter.set_ghost_edge(srcId, end);
    }

    public remove_ghost_edge(): void {
        this.roadNetworkPainter.remove_ghost_edge();
    }
}
