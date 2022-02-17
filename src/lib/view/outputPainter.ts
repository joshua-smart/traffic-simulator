import { SimulationOutput } from "../model/simulationRecorder";

export default class OutputPainter {

    private formats: Map<string, (input: number) => string>;

    constructor() {
        // Create map for format functions, format functions take numeric inputs and return strings the enforce fixed decimal places and units
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
        // Iterate over object key, apply format function and draw to screen
        Object.keys(simulationOutput).forEach(id => {
            // Get element containing the data in the UI
            const element = document.querySelector(`#${id}`);
            // Get current value of this parameter in the simulationOutput
            const value = simulationOutput[id];
            // If the value is NaN, do not update the display
            if (isNaN(value)) return;
            // Get and apply the format function for this parameter, writing this to the UI
            const text = this.formats.get(id)(value);
            element.innerHTML = `${text}`;
        });
        // Once simulationOutput has been updated once, allow the user to save the simulation output data
        this.enableDownload();
    }

    // When data is available, enable download buttons
    private enableDownload(): void {
        document.querySelector('#download-excel').classList.remove('disabled');
        document.querySelector('#download-excel').classList.add('active');

        document.querySelector('#download-csv').classList.remove('disabled');
        document.querySelector('#download-csv').classList.add('active');
    }
}
