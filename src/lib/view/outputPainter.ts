import { SimulationOutput } from "../model/simulation";
import { round } from "lodash";

export default class OutputPainter {

    constructor() {

    }

    public draw(simulationOutput: SimulationOutput): void {
        Object.keys(simulationOutput).forEach(id => {
            const element = document.querySelector(`#${id}`);
            const value = round(simulationOutput[id], 2);
            element.innerHTML = `${value}`;
        });
    }
}
