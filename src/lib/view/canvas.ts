import Vector2 from '../vector2';
import CubicBezier from './cubicBezier';

type LineStyle = {
    color?: string,
    width?: number,
    cap?: CanvasLineCap,
    join?: CanvasLineJoin
}

type ShapeStyle = {
    color?: string,
    line?: LineStyle
}

export default abstract class Canvas {
    private domElement: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(domElement: HTMLCanvasElement) {
        this.domElement = domElement;
        this.ctx = this.domElement.getContext('2d');

        this.domElement.width = this.domElement.offsetWidth;
        this.domElement.height = this.domElement.offsetHeight;
    }

    protected get width(): number { return this.domElement.width; }
    protected get height(): number { return this.domElement.height; }

    protected line(start: Vector2, end: Vector2, style?: LineStyle): void {
        this.line_draw_wrapper(style, () => {
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
        });
    }

    protected circle(center: Vector2, radius: number, style?: ShapeStyle): void {
        this.shape_draw_wrapper(style, () => {
            this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        });
    }

    protected bezier(b: CubicBezier, lineStyle?: LineStyle, shapeStyle?: ShapeStyle) {
        this.line_draw_wrapper(lineStyle, () => {
            let distance = 0;
            let currentPoint = b.get_point_at_distance(distance);

            this.ctx.moveTo(currentPoint.x, currentPoint.y);

            while (currentPoint !== null) {
                this.ctx.lineTo(currentPoint.x, currentPoint.y);
                distance += b.get_arc_length() / 100;
                currentPoint = b.get_point_at_distance(distance);
            }
        });
        this.shape_draw_wrapper(shapeStyle, () => {
            const midPoint = b.get_point_at_distance(b.get_arc_length() / 2);
            const tangent = b.get_tangent_at_distance(b.get_arc_length() / 2);
            const t = tangent.normalise();
            const n = new Vector2(t.y, -t.x);

            const v0 = midPoint.add(t.mult(5));
            const v1 = midPoint.add(t.mult(-5)).add(n.mult(5));
            const v2 = midPoint.add(t.mult(-5)).add(n.mult(-5));

            this.ctx.moveTo(v0.x, v0.y);
            this.ctx.lineTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y);
        });
    }

    protected polygon(vertices: Vector2[], style?: ShapeStyle): void {
        this.shape_draw_wrapper(style, () => {
            this.ctx.moveTo(vertices[0].x, vertices[0].y);
            vertices.forEach(vertex => this.ctx.lineTo(vertex.x, vertex.y));
            this.ctx.closePath();
        });
    }

    private shape_draw_wrapper(style: ShapeStyle, callback: () => void): void {
        if (style) this.assign_shape_style(style);
        this.ctx.beginPath();
        callback();
        this.ctx.fill();
        this.ctx.stroke();
    }

    private line_draw_wrapper(style: LineStyle, callback: () => void) {
        if (style) this.assign_line_style(style);
        this.ctx.beginPath();
        callback();
        this.ctx.stroke();
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

    protected clear(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.width);
    }
}
