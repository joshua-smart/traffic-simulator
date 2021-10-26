import Graph from './graph';
import Vector2 from '../vector2';
import Stack from '../stack';

type Vertex = Vector2;
type Edge = {srcTangent: Vector2, dstTangent: Vector2};
type Edge = {p1: Vector2, p2: Vector2};

export default class RoadNetwork extends Graph<Vertex, Edge>{
    constructor() {
        super();
    }

    private get_edge_length(srcId: number, dstId: number): number {
        const srcV = this.get_vertex(srcId);
        const dstV = this.get_vertex(dstId);
        return Vector2.sub(srcV, dstV).magnitude();
    }

    public find_route(srcId: number, dstId: number): Stack<number> {
        const q: number[] = [];
        const dist: number[] = [];
        const prev: number[] = [];

        for(let v = 0; v < this.get_size(); v++) {
            dist[v] = Infinity;
            prev[v] = undefined;
            q.push(v);
        }
        dist[srcId] = 0;

        while (q.length > 0) {
            q.sort((a, b) => dist[a] - dist[b]);
            const u = q.shift();

            if (u == dstId) {
                return;
            }

            for(let v = 0; v < this.get_size(); v++) {
                if(this.get_edge(u, v) && q.includes(v)) {
                    const alt = dist[u] + this.get_edge_length(u, v);
                    if (alt < dist[v]) {
                        dist[v] = alt;
                        prev[v] = u;
                    }
                }
            }
        }

        const s: Stack<number> = new Stack<number>();
        let u = dstId;

        while (u) {
            s.push(u);
            u = prev[u];
        }
        return s;
    }
}
}
