import Model from '../model/model';
import Vector2 from '../vector2';
import Transform from './transform';

export default class View {
    private transform: Transform;
    constructor(model: Model) {
        this.transform = new Transform(new Vector2(100, 200), 2);

        this.redraw();
    }

    public redraw(): void {
        this.roadNetworkCanvas.draw(this.model.get_road_network(), this.transform, this.ghostEdge);
    }


    public pan_display(delta: Vector2): void {
        this.transform.translate(delta);
        this.redraw();
    }

    public zoom_display(center: Vector2, factor: number): void {
        this.transform.zoom(center, factor);
        this.redraw();
    }


    }
}
