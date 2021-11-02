import Agent from "./agent";
import RoadNetwork from "./roadNetwork";

export default class Simulation {
    private roadNetwork: RoadNetwork;
    private agents: Agent[];

    constructor(roadNetwork: RoadNetwork) {
        this.roadNetwork = roadNetwork;
    }
}
