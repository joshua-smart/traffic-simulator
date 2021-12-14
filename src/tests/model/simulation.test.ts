import { create_mock_road_network } from './roadNetwork.test';
import assert = require("assert");
import RoadNetwork from '../../lib/model/roadNetwork';
import Simulation from '../../lib/model/simulation';


describe("simulation test suite", () => {

    const create_empty_simulation = () => {
        return new Simulation(new RoadNetwork());
    };

    const create_mock_simulation = () => {
        return new Simulation(create_mock_road_network());
    };

    describe("#constructor()", () => {
        it("instantiates simulation class", () => {
            create_empty_simulation();
        });

        it("gets correct source and exit vertices for empty network", () => {
            const simulation = create_empty_simulation();

            const expectedSources = [];
            const expectedExits = new Map<number, number[]>();

            assert.deepStrictEqual(simulation['sources'], expectedSources);
            assert.deepStrictEqual(simulation['exits'], expectedExits);
        });

        it("gets correct source and exit vertices for mock network", () => {
            const simulation = create_mock_simulation();

            const expectedSources = [0];
            const expectedExits = new Map<number, number[]>();
            expectedExits.set(0, [1, 2]);

            assert.deepStrictEqual(simulation['sources'], expectedSources);
            assert.deepStrictEqual(simulation['exits'], expectedExits);
        });
    });

    describe("#step()", () => {
        it("can step empty simulation", () => {
            const simulation = create_empty_simulation();

            simulation.step(1);
        });

        it("can step mock simulation", () => {
            const simulation = create_mock_simulation();

            simulation.step(1);
        });
    });
});
