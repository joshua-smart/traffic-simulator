import Vector2 from "../vector2";

export default class Transform {
    private position: Vector2;
    private scale: number;

    constructor(position: Vector2, scale: number) {
        this.position = position;
        this.scale = scale;
    }

    public translate(delta: Vector2): void {
        this.position = this.position.add(delta);
    }

    public zoom(center: Vector2, factor: number): void {
        this.position = Vector2.add(
            center.mult(1 - factor),
            this.position.mult(factor)
        );
        this.scale *= factor;
    }

    public to_screen_space(worldVector: Vector2): Vector2 {
        return worldVector.mult(this.scale).add(this.position);
    }

    public to_world_space(screenVector: Vector2): Vector2 {
        return screenVector.sub(this.position).mult(1/this.scale);
    }

    public get_scale(): number {
        return this.scale;
    }
}
