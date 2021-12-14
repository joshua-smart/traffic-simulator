import * as assert from "assert";
import Graph, { GraphError } from "../../lib/model/graph";

describe("graph test suite", () => {

    const create_mock_graph = () => {
        const graph = new Graph<number, number>();
        graph.add_vertex(0);
        graph.add_vertex(1);
        graph.add_vertex(2);
        graph.set_edge(0, 1, 1);
        return graph;
    };

    describe("#constructor()", () => {
        it("instantiates graph class", () => {
            new Graph<number, number>();
        });

        it("gets value of edge 1->2 of mock graph as empty", () => {
            const graph = create_mock_graph();
            assert.strictEqual(graph.get_edge(1, 2), graph.empty);
        });
    });

    describe("#size()", () => {
        it("gets size of empty graph as 0", () => {
            const graph = new Graph<number, number>();
            assert.strictEqual(graph.size(), 0);
        });

        it("gets size of mock graph as 3", () => {
            const graph = create_mock_graph();
            assert.strictEqual(graph.size(), 3);
        });
    });

    describe("#add_vertex()", () => {
        it("adds vertex with value 0", () => {
            const graph = new Graph<number, number>();
            graph.add_vertex(0);
        });
    });

    describe("#set_vertex()", () => {
        it("sets value of mock graph vertex 0 to 1", () => {
            const graph = create_mock_graph();
            graph.set_vertex(0, 1);
        });

        it("throws GraphError when setting empty graph vertex 0 to 0", () => {
            const graph = new Graph<number, number>();
            assert.throws(() => graph.set_vertex(0, 0), {name: GraphError.name});
        });
    });

    describe("#get_vertex()", () => {
        it("gets value of 0 from mock graph vertex 0", () => {
            const graph = create_mock_graph();
            assert.strictEqual(graph.get_vertex(0), 0);
        });

        it("throws error getting value of vertex 0 in empty graph", () => {
            const graph = new Graph<number, number>();
            assert.throws(() => graph.get_vertex(0), {name: GraphError.name});
        });
    });

    describe("#remove_vertex()", () => {
        it("removes vertex 0 from mock graph", () => {
            const graph = create_mock_graph();
            graph.remove_vertex(0);
        });

        it("throws GraphError removing vertex 0 from empty graph", () => {
            const graph = new Graph<number, number>();
            assert.throws(() => graph.remove_vertex(0), {name: GraphError.name});
        });
    });

    describe("#set_edge()", () => {
        it("sets edge value 0 to mock graph edge 0->1", () => {
            const graph = create_mock_graph();
            graph.set_edge(0, 1, 0);
        });

        it("throws GraphError setting value of edge 0->1 to 0 on empty graph", () => {
            const graph = new Graph<number, number>();
            assert.throws(() => graph.set_edge(0, 1, 0), {name: GraphError.name});
        });
    });

    describe("#get_edge()", () => {
        it("gets value of 1 from edge 0->1 on mock graph", () => {
            const graph = create_mock_graph();
            assert.strictEqual(graph.get_edge(0, 1), 1);
        });

        it("throws GraphError getting edge 0->1 from empty graph", () => {
            const graph = new Graph<number, number>();
            assert.throws(() => graph.get_edge(0, 1), {name: GraphError.name});
        });
    });

    describe("#remove_edge()", () => {
        it("removes edge 0->1 from mock graph then value is empty", () => {
            const graph = create_mock_graph();
            graph.remove_edge(0, 1);
            assert.strictEqual(graph.get_edge(0, 1), graph.empty);
        });

        it("throws GraphError removing edge 0->1 from empty graph", () => {
            const graph = new Graph<number, number>();
            assert.throws(() => graph.remove_edge(0, 1), {name: GraphError.name});
        });
    });

    describe("#traverse()", () => {
        it("throws GraphError traversing empty graph from 0", () => {
            const graph = new Graph<number, number>();
            assert.throws(() => graph.traverse(0), {name: GraphError.name});
        });

        it("gets [0, 1] traversing mock graph from 0", () => {
            const graph = create_mock_graph();
            assert.deepStrictEqual(graph.traverse(0), [0, 1]);
        });

        it("gets [2] traversing mock graph from 2", () => {
            const graph = create_mock_graph();
            assert.deepStrictEqual(graph.traverse(2), [2]);
        });
    });
});
