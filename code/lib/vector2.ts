export default class Vector2 {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public sub(vector: Vector2): Vector2 {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    public add(vector: Vector2): Vector2 {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    public mult(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    public rotate(angle: number): Vector2 {
        return new Vector2(
            Math.cos(angle) * this.x - Math.sin(angle) * this.y,
            Math.sin(angle) * this.x + Math.cos(angle) * this.y);
    }

    public get_mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    public set_mag(magnitude: number) {
        return this.mult(magnitude / this.get_mag());
    }
}