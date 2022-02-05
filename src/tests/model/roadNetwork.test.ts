import assert = require("assert");
import RoadNetwork, { create_default_network, RoadNetworkError } from "../../lib/model/roadNetwork";
import Vector2 from "../../lib/vector2";
import CubicBezier from "../../lib/model/cubicBezier";
import { GraphError } from "../../lib/model/graph";
import Stack from "../../lib/model/stack";

export const create_mock_road_network = () => {
    const roadNetwork = new RoadNetwork();
    roadNetwork.add_vertex(new Vector2(0, 0));
    roadNetwork.add_vertex(new Vector2(1, 0));
    roadNetwork.add_vertex(new Vector2(0, 0));
    roadNetwork.set_edge(0, 1, {t1: new Vector2(0, 1), t2: new Vector2(0, 1)});
    roadNetwork.set_edge(0, 2, {t1: new Vector2(0, 0), t2: new Vector2(0, 0)});
    return roadNetwork;
};

describe("road network test suite", () => {

    describe("#constructor()", () => {
        it("instantiates RoadNetwork class", () => {
            new RoadNetwork();
        });

        it("creates default road network", () => {
            create_default_network();
        });
    });

    describe("#get_bezier()", () => {
        it("gets expected bezier from edge 0->1 of mock road network", () => {
            const roadNetwork = create_mock_road_network();
            const expectedBezier = new CubicBezier(new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0));
            assert.deepStrictEqual(roadNetwork.get_bezier(0, 1), expectedBezier);
        });

        it("throws GraphError getting bezier from edge 0->1 of empty road network", () => {
            const roadNetwork = new RoadNetwork();
            assert.throws(() => roadNetwork.get_bezier(0, 0), {name: GraphError.name});
        });

        it("throws RoadNetworkError getting bezier from empty edge 1->2 of mock road network", () => {
            const roadNetwork = create_mock_road_network();
            assert.throws(() => roadNetwork.get_bezier(1, 2), {name: RoadNetworkError.name});
        });
    });

    describe("#find_route()", () => {
        it("gets route [0, 1] for route 0->1 of mock road network", () => {
            const roadNetwork = create_mock_road_network();
            const expectedRoute = new Stack<number>();
            expectedRoute.push(1);
            expectedRoute.push(0);
            assert.deepStrictEqual(roadNetwork.find_route(0, 1), expectedRoute);
        });

        it("throws GraphError for route 0->0 of empty road network", () => {
            const roadNetwork = new RoadNetwork();
            assert.throws(() => roadNetwork.find_route(0, 0), {name: GraphError.name});
        });

        it("throws RoadNetworkError for getting route 1->2 of mock road network", () => {
            const roadNetwork = create_mock_road_network();
            assert.throws(() => roadNetwork.find_route(1, 2), {name: RoadNetworkError.name});
        });
    });

    describe("#create_default_network()", () => {
        it("creates default road network", () => {
            create_default_network();
        });
    });
});
