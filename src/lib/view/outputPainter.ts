import { SimulationOutput } from "../model/simulationRecorder";

export default class OutputPainter {

    private formats: {[key: string]: (input: number) => string};

    constructor() {
        this.formats = {
            'agentCount': (input) => `${input}`,
            'simTimer': (input) => `${(input / 1000).toFixed(2)}<span class="text-sm">s</span>`,
            'avgAliveTime': (input) => `${(input / 1000).toFixed(2)}<span class="text-sm">s</span>`,
            'avgDistance': (input) => `${input.toFixed(2)}<span class="text-sm">m</span>`,
            'avgMaxSpeed': (input) => `${input.toFixed(2)}<span class="text-sm">ms<sup>-1</sup></span>`,
            'avgMinSpeed': (input) => `${input.toFixed(2)}<span class="text-sm">ms<sup>-1</sup></span>`,
            'avgStopTime': (input) => `${(input / 1000).toFixed(2)}<span class="text-sm">s</span>`
        };
    }

    public draw(simulationOutput: SimulationOutput): void {
        Object.keys(simulationOutput).forEach(id => {
            const element = document.querySelector(`#${id}`);
            const value = simulationOutput[id];
            if (isNaN(value)) return;
            const text = this.formats[id](value);
            element.innerHTML = `${text}`;
        });
    }
}
