import Vector2 from '../vector2';

const interpolationResolution = 0.01;

export default class CubicBezier {
    private vertices: Vector2[];
    private distanceLookup: Map<number, number>;

    constructor(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2) {
        this.vertices = [p0, p1, p2, p3];
        this.distanceLookup = this.generate_lookup();
    }

    public set_vertex(index: number, value: Vector2): void {
        this.vertices[index] = value;
        this.distanceLookup = this.generate_lookup();
    }

    private interpolate(t: number): Vector2 {
        return new Vector2(0, 0).add(
            this.vertices[0].mult((1 - t)**3)
        ).add(
            this.vertices[1].mult(3*(1-t)**2*t)
        ).add(
            this.vertices[2].mult(3*(1-t)*t**2)
        ).add(
            this.vertices[3].mult(t**3)
        );
    }

    private tangent(t: number): Vector2 {
        return new Vector2(0, 0).add(
            this.vertices[0].mult(-3*t**2 + 6*t - 3)
        ).add(
            this.vertices[1].mult(9*t**2 - 12*t + 3)
        ).add(
            this.vertices[2].mult(-9*t**2 + 6*t)
        ).add(
            this.vertices[3].mult(3*t**2)
        );
    }

    private generate_lookup(): Map<number, number> {
        const map = new Map<number, number>();
        let distance = 0;
        let t = 0;
        while (t <= 1) {
            map.set(t, distance);
            const p = this.interpolate(t);
            t += interpolationResolution;
            const q = this.interpolate(t);
            distance += Vector2.sub(p, q).magnitude();
        }
        return map;
    }

    public get_t_at_distance(targetDistance: number): number {
        for(const [t, distance] of this.distanceLookup) {
            if (distance >= targetDistance) return t;
        }
        return null;
    }

    public get_point_at_distance(targetDistance: number) {
        const t = this.get_t_at_distance(targetDistance);
        return this.interpolate(t);
    }

    public get_tangent_at_distance(targetDistance: number) {
        const t = this.get_t_at_distance(targetDistance);
        if (t === null) return null;
        return this.tangent(t);
    }
}
