import * as assert from 'assert';
import CubicBezier from "../../lib/model/cubicBezier";
import Vector2 from "../../lib/vector2";

const create_mock_bezier = () => new CubicBezier(
    new Vector2(0, 0),
    new Vector2(1, 1),
    new Vector2(2, 2),
    new Vector2(3, 3)
);

describe("cubic bezier test suite", () => {

    describe("#constructor()", () => {
        it("instantiates new cubic bezier", () => {
            new CubicBezier(new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0));
        });

        it("creates mock bezier", () => {
            create_mock_bezier();
        });
    });

    describe("#get_vertex()", () => {
        it("gets 0, 0 for vertex 0 of mock bezier", () => {
            const bezier = create_mock_bezier();
            assert.deepStrictEqual(bezier.get_vertex(0), new Vector2(0, 0));
        });

        it("gets 3, 3 for vertex 3 of mock bezier", () => {
            const bezier = create_mock_bezier();
            assert.deepStrictEqual(bezier.get_vertex(3), new Vector2(3, 3));
        });
    });

    describe("#set_vertex()", () => {
        it("sets vertex 2 of mock bezier to -1, 0 and returns same", () => {
            const bezier = create_mock_bezier();
            const newVertex = new Vector2(-1, 0);
            bezier.set_vertex(2, newVertex);
            assert.deepStrictEqual(bezier.get_vertex(2), newVertex);
        });
    });

    describe("#get_point_at_distance()", () => {
        it("gets point 0, 0 for mock bezier at distance 0", () => {
            const bezier = create_mock_bezier();
            assert.deepStrictEqual(bezier.get_point_at_distance(0), new Vector2(0, 0));
        });
    });
});
