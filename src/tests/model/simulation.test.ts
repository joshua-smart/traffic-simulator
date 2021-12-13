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

            assert.deepStrictEqual(simulation['sources'], []);
            assert.deepStrictEqual(simulation['exits'], []);
        });

        it("gets correct source and exit vertices for mock network", () => {
            const simulation = create_mock_simulation();

            assert.deepStrictEqual(simulation['sources'], [0]);
            assert.deepStrictEqual(simulation['exits'], [1, 2]);
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
