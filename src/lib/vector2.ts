export default class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // All non-static methods are defined by calling the static method on the instance

    public static add(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x + b.x, a.y + b.y);
    }
    public add(other: Vector2): Vector2 {
        return Vector2.add(this, other);
    }

    public static sub(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }
    public sub(other: Vector2): Vector2 {
        return Vector2.sub(this, other);
    }

    public static mult(vector: Vector2, scalar: number): Vector2 {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }
    public mult(scalar: number): Vector2 {
        return Vector2.mult(this, scalar);
    }

    public static square_magnitude(vector: Vector2): number {
        return vector.x * vector.x + vector.y * vector.y;
    }
    public square_magnitude(): number {
        return Vector2.square_magnitude(this);
    }

    public static magnitude(vector: Vector2): number {
        return Vector2.square_magnitude(vector) ** 0.5;
    }
    public magnitude(): number {
        return Vector2.magnitude(this);
    }

    public static dot(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y;
    }
    public dot(other: Vector2): number {
        return Vector2.dot(this, other);
    }

    public static normalise(vector: Vector2): Vector2 {
        const magnitude = vector.magnitude();
        return new Vector2(vector.x / magnitude, vector.y / magnitude);
    }
    public normalise(): Vector2 {
        return Vector2.normalise(this);
    }
}
