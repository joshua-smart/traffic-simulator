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
}
