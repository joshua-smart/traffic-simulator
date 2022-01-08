import { SimulationOutput } from "../model/simulation";
import { round } from "lodash";

export default class OutputPainter {

    private formats: {[key: string]: (input: number) => string};

    constructor() {
        this.formats = {
            'agentCount': (input) => `${input}`,
            'simTimer': (input) => `${(input / 1000).toFixed(2)}s`,
            'avgAliveTime': (input) => `${(input / 1000).toFixed(2)}s`,
            'avgDistance': (input) => `${input.toFixed(2)}m`,
            'avgMaxSpeed': (input) => `${input.toFixed(2)}mps`,
            'avgMinSpeed': (input) => `${input.toFixed(2)}mps`,
            'avgStopTime': (input) => `${(input / 1000).toFixed(2)}s`
        };
    }

    public draw(simulationOutput: SimulationOutput): void {
        Object.keys(simulationOutput).forEach(id => {
            const element = document.querySelector(`#${id}`);
            const value = this.formats[id](simulationOutput[id]);
            element.innerHTML = `${value}`;
        });
    }
}
