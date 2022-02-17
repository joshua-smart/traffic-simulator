import Vector2 from "../vector2";

// Transform defined by origin position and scale
export default class Transform {
    private position: Vector2;
    private scale: number;

    constructor(position: Vector2, scale: number) {
        this.position = position;
        this.scale = scale;
    }

    // Move origin by delta vector
    public translate(delta: Vector2): void {
        this.position = this.position.add(delta);
    }

    // Modify the translatation to zoom from center with specified factor
    public zoom(center: Vector2, factor: number): void {
        this.position = Vector2.add(
            center.mult(1 - factor),
            this.position.mult(factor)
        );
        this.scale *= factor;
    }

    // Translate a world vector to screen space
    public to_screen_space(worldVector: Vector2): Vector2 {
        return worldVector.mult(this.scale).add(this.position);
    }

    // Translate a screen vector to world space
    public to_world_space(screenVector: Vector2): Vector2 {
        return screenVector.sub(this.position).mult(1/this.scale);
    }

    public get_scale(): number {
        return this.scale;
    }
}
