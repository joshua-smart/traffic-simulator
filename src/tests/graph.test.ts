import Graph from "../lib/model/graph";
import * as assert from "assert";

describe("graph test suite", () => {
    let graph: Graph<number, number>;

    it("instantiate graph class", () => {
        graph = new Graph<number, number>();
    });

    it("add three vertices [10, 7, -65]", () => {
        graph.add_vertex(10);
        graph.add_vertex(7);
        graph.add_vertex(-65);
    });

    it("get value of vertex 0", () => {
        assert.strictEqual(graph.get_vertex(0), 10);
    });

    it("add edges (0, 1, 101), (1, 2, -0.6)", () => {
        graph.set_edge(0, 1, 101);
        graph.set_edge(1, 2, -0.6);
    });

    it("get value of empty edge between 0 and 2", () => {
        assert.strictEqual(graph.get_edge(0, 2), graph.empty);
    });

    it("remove vertex 0", () => {
        graph.remove_vertex(0);
    });

    it("get new value of vertex 0", () => {
        assert.strictEqual(graph.get_vertex(0), 7);
    });

    it("get value of edge between 0 and 1", () => {
        assert.strictEqual(graph.get_edge(0, 1), -0.6);
    });
});
