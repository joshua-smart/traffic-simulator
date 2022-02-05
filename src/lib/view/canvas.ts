import CubicBezier from '../model/cubicBezier';
import Vector2 from '../vector2';
import Transform from './transform';

type LineStyle = {
    color?: string,
    width?: number,
    cap?: CanvasLineCap,
    join?: CanvasLineJoin
};

type ShapeStyle = {
    color?: string,
    line?: LineStyle
};

// Wrapper class for CanvasRenderingContext2D, to provide a friendlier interface
export default class Canvas {
    private domElement: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private transform: Transform;

    constructor(domElement: HTMLCanvasElement) {
        this.domElement = domElement;
        // Get context object from HTML element
        this.ctx = this.domElement.getContext('2d');

        this.domElement.width = this.domElement.parentElement.offsetWidth;
        this.domElement.height = this.domElement.parentElement.offsetHeight;
    }

    public set_transform(transform: Transform): void {
        this.transform = transform;
    }

    public get width(): number { return this.domElement.width; }
    public get height(): number { return this.domElement.height; }

    // Draw line to canvas from start to end with optional style
    public line(start: Vector2, end: Vector2, style?: LineStyle): void {
        this.line_draw_wrapper(style, () => {
            this.move_to(start);
            this.line_to(end);
        });
    }

    // Draw bezier curve to canvas with direction arrow at midpoint
    public bezier(b: CubicBezier, lineStyle?: LineStyle, shapeStyle?: ShapeStyle) {
        this.line_draw_wrapper(lineStyle, () => {
            let distance = 0;
            let currentPoint = b.get_point_at_distance(distance);

            this.move_to(currentPoint);

            while (distance < b.get_arc_length()) {
                this.line_to(currentPoint);
                distance += b.get_arc_length() / 100;
                currentPoint = b.get_point_at_distance(distance);
            }
        });
        this.shape_draw_wrapper(shapeStyle, () => {
            const arrowSize = 0.75;

            const midPoint = b.get_point_at_distance(b.get_arc_length() / 2);
            const tangent = b.get_tangent_at_distance(b.get_arc_length() / 2);
            const t = tangent.normalise();
            const n = new Vector2(t.y, -t.x);

            const v0 = midPoint.add(t.mult(arrowSize));
            const v1 = midPoint.add(t.mult(-arrowSize)).add(n.mult(arrowSize));
            const v2 = midPoint.add(t.mult(-arrowSize)).add(n.mult(-arrowSize));

            this.move_to(v0);
            this.line_to(v1);
            this.line_to(v2);
        });
    }

    // Function wrapper to manage draw begin and end methods for shapes
    private shape_draw_wrapper(style: ShapeStyle, callback: () => void): void {
        if (style) this.assign_shape_style(style);
        this.ctx.beginPath();
        callback();
        this.ctx.fill();
        this.ctx.stroke();
    }

    // Function wrapper to manage draw begin and end methods for lines
    private line_draw_wrapper(style: LineStyle, callback: () => void) {
        if (style) this.assign_line_style(style);
        this.ctx.beginPath();
        callback();
        this.ctx.stroke();
    }

    // Apply transform and move using result vector
    private move_to(position: Vector2): void {
        const transformedPosition = this.transform.to_screen_space(position);
        this.ctx.moveTo(transformedPosition.x, transformedPosition.y);
    }

    // Apply transform and draw line using result vector
    private line_to(position: Vector2): void {
        const transformedPosition = this.transform.to_screen_space(position);
        this.ctx.lineTo(transformedPosition.x, transformedPosition.y);
    }

    private assign_line_style({color, width, cap, join}: LineStyle): void {
        if (color) this.ctx.strokeStyle = color;
        if (width) this.ctx.lineWidth = width;
        if (cap) this.ctx.lineCap = cap;
        if (join) this.ctx.lineJoin = join;
    }

    private assign_shape_style({color, line}: ShapeStyle): void {
        if (color) this.ctx.fillStyle = color;
        if (line) this.assign_line_style(line);
    }

    public get_dom_element() {
        return this.domElement;
    }

    public clear(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.width);
    }
}
