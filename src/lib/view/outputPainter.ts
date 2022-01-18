import { SimulationOutput } from "../model/simulationRecorder";

export default class OutputPainter {

    private formats: Map<string, (input: number) => string>;

    constructor() {
        const raw = (input: number) => `${input}`;
        const seconds = (input: number) => `${input.toFixed(2)}<span class="text-sm">s</span>`;
        const metres = (input: number) => `${input.toFixed(2)}<span class="text-sm">m</span>`;
        const metresPerSecond = (input: number) => `${input.toFixed(2)}<span class="text-sm">ms<sup>-1</sup></span>`;

        this.formats = new Map<string, (input: number) => string>([
            ['agentCount', raw],
            ['dataPoints', raw],
            ['simTimer', seconds],
            ['avgAliveTime', seconds],
            ['avgDistance', metres],
            ['avgMaxSpeed', metresPerSecond],
            ['avgMinSpeed', metresPerSecond],
            ['avgStopTime', seconds]
        ]);
    }

    public draw(simulationOutput: SimulationOutput): void {
        if (!simulationOutput) return;
        Object.keys(simulationOutput).forEach(id => {
            const element = document.querySelector(`#${id}`);
            const value = simulationOutput[id];
            if (isNaN(value)) return;
            const text = this.formats.get(id)(value);
            element.innerHTML = `${text}`;
        });
        this.enableDownload();
    }

    private enableDownload(): void {
        document.querySelector('#download-excel').classList.remove('disabled');
        document.querySelector('#download-excel').classList.add('active');

        document.querySelector('#download-csv').classList.remove('disabled');
        document.querySelector('#download-csv').classList.add('active');
    }
}
