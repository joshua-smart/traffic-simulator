export default class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    sub(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    mult(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
}
