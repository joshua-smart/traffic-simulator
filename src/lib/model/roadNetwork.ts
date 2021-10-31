import Graph from './graph';
import Vector2 from '../vector2';
import Stack from '../stack';

type Vertex = Vector2;
type Edge = {t1: Vector2, t2: Vector2};

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

        for(let v = 0; v < this.size(); v++) {
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

            for(let v = 0; v < this.size(); v++) {
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

// TEMPORARY
export function create_default_network() {
    const roadNetwork = new RoadNetwork();
    roadNetwork.add_vertex(new Vector2(0, 0));
    roadNetwork.add_vertex(new Vector2(100, 100));
    roadNetwork.add_vertex(new Vector2(50, -50));
    roadNetwork.add_vertex(new Vector2(200, 150));
    roadNetwork.add_vertex(new Vector2(300, -50));

    roadNetwork.set_edge(0, 1, {t1: new Vector2(0, 0), t2: new Vector2(0, 0)});
    roadNetwork.set_edge(1, 2, {t1: new Vector2(0, 0), t2: new Vector2(0, 0)});
    roadNetwork.set_edge(1, 3, {t1: new Vector2(0, 0), t2: new Vector2(0, 0)});
    roadNetwork.set_edge(1, 4, {t1: new Vector2(0, 0), t2: new Vector2(0, 0)});
    roadNetwork.set_edge(4, 3, {t1: new Vector2(0, 0), t2: new Vector2(0, 0)});

    return roadNetwork;
}
