import Model from '../model/model';
import Vector2 from '../vector2';
import Canvas from './canvas';
import RoadNetworkPainter from './roadNetworkPainter';
import SimulationPainter from './simulationPainter';
import Transform from './transform';
import OutputPainter from './outputPainter';

// Object type definition for drawFlags attribute
type DrawFlags = {
    roads: boolean,
    handles: boolean,
    vertices: boolean,
    simulation: boolean,
    output: boolean
};

export default class View {
    private model: Model;
    private canvas: Canvas;
    // Encapsulated painter classes
    private roadNetworkPainter: RoadNetworkPainter;
    private simulationPainter: SimulationPainter;
    private outputPainter: OutputPainter;

    private transform: Transform;

    private drawFlags: DrawFlags;

    constructor(model: Model) {
        this.model = model;
        // Get canvas element from the UI
        const canvasElement = <HTMLCanvasElement>document.querySelector('#main-canvas');
        // Instantiate the canvas class with canvasElement
        this.canvas = new Canvas(canvasElement);
        // Instantiate painter classes
        this.roadNetworkPainter = new RoadNetworkPainter();
        this.simulationPainter = new SimulationPainter();
        this.outputPainter = new OutputPainter();
        // Set default transform
        this.transform = new Transform(new Vector2(-800, 500), 5);

        // Set default drawFlags
        this.drawFlags = {
            roads: true,
            handles: true,
            vertices: true,
            simulation: false,
            output: false
        };

        this.redraw();
    }

    public redraw(): void {
        // Clear the canvas and remove created elements from last frame
        this.canvas.clear();
        this.roadNetworkPainter.clear();
        this.simulationPainter.clear();
        // Update the canvas transform to the current transform
        this.canvas.set_transform(this.transform);

        // If roads are set to be drawn, use the roadNetworkPainter to draw the roads
        if (this.drawFlags.roads) this.roadNetworkPainter.draw_roads(this.canvas, this.model.get_road_network(), this.transform);

        // If handles are set to be drawn, use the roadNetworkPainter to draw the handles
        if (this.drawFlags.handles) this.roadNetworkPainter.draw_handles(this.canvas, this.model.get_road_network(), this.transform);

        // If vertices are set to be drawn, use the roadNetworkPainter to draw the vertices
        if (this.drawFlags.vertices) this.roadNetworkPainter.draw_vertices(this.model.get_road_network(), this.transform);

        // If simulation is set to be drawn, use the simulationPainter to draw the simulation
        if (this.drawFlags.simulation) this.simulationPainter.draw(this.canvas, this.model.get_simulation(), this.transform);

        // If output is set to be drawn, use the OutputPainter to draw the output
        if (this.drawFlags.output) this.outputPainter.draw(this.model.get_current_output());
    }

    // Change a specified attribute in the draw flags
    public set_draw(key: string, value: boolean): void {
        this.drawFlags[key] = value;
    }

    public get_canvas_element(): HTMLElement {
        return document.querySelector('#canvas-container');
    }

    // Get distance in pixels, of the canvas from the top of the screen
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

    public get_screen_center(): Vector2 {
        return new Vector2(
            this.canvas.width/2,
            this.canvas.height/2
        );
    }
}
