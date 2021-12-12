import RoadNetwork, { create_default_network } from "../lib/model/roadNetwork";
import assert = require("assert");
import Stack from "../lib/stack";

describe("road network test suite", () => {
    let roadNetwork: RoadNetwork;

    it("instantiate road network class", () => {
        roadNetwork = new RoadNetwork();
    });

    it("create default road network", () => {
        roadNetwork = create_default_network();
    });

    it("get path between vertices 0 and 12", () => {
        const expectedRoute = new Stack<number>();
        [12, 8, 7, 6, 5, 4, 2, 0].forEach(i => expectedRoute.push(i));
        assert.deepStrictEqual(roadNetwork.find_route(0, 12), expectedRoute);
    });

    it("cannot get path between vertices 15 and 13");
});
