export default class Model {
    constructor() {
        

    public toggle_edge(srcId: number, dstId: number): void {
        // No self-connecting vertices
        if (srcId === dstId) return;
        if (this.roadNetwork.get_edge(srcId, dstId)) {
            this.roadNetwork.remove_edge(srcId, dstId);
            return;
        }
        this.roadNetwork.remove_edge(dstId, srcId);
        this.roadNetwork.set_edge(srcId, dstId, {p1: new Vector2(0, 0), p2: new Vector2(0, 0)});
    }

    }
}
