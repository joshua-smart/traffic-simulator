import Model from "../model/model";
import View from "../view/view";
import StateMachine from "./stateMachine";
import { E } from './controller';
import IOManager from "./ioManager";

export default class SimulationController {
    private model: Model;
    private view: View;

    // Boolean flag for simulation
    private runnning: boolean = false;
    private lastFrameTime: number = 0;

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;
    }

    // Bind elements to state machine transitions
    public assign_listeners(stateMachine: StateMachine<Event>) {
        // Bind start, pause and stop button listeners to state machine transitions
        document.querySelector('#start-button').addEventListener('click', () => stateMachine.transition(E.start, null));
        document.querySelector('#pause-button').addEventListener('click', () => stateMachine.transition(E.pause, null));
        document.querySelector('#stop-button').addEventListener('click', () => stateMachine.transition(E.stop, null));

        // Bind events for excel and csv download buttons, do not trigger event if the button is disabled
        document.querySelector('#download-excel').addEventListener('click', () => {
            if (document.querySelector('#download-excel').classList.contains('disabled')) return;
            const data = this.model.get_output();
            IOManager.save_ouput_as_excel(data);
        });
        document.querySelector('#download-csv').addEventListener('click', () => {
            if (document.querySelector('#download-csv').classList.contains('disabled')) return;
            const data = this.model.get_output();
            IOManager.save_ouput_as_csv(data);
        });
    }

    // Main loop for the simulation
    private run(time: number) {
        const timeStep = (time - this.lastFrameTime)/1000;
        this.lastFrameTime = time;
        this.model.step_simulation(timeStep);
        this.view.redraw();

        // Make recursive frame call if the simulation is still running
        if (this.runnning) return requestAnimationFrame((time) => this.run(time));
    }

    // Initialise a new simulation and start main loop
    public start() {
        this.model.start_simulation();
        // Set view to draw simulation/output and not vertices/handles
        this.view.set_draw('simulation', true);
        this.view.set_draw('vertices', false);
        this.view.set_draw('handles', false);
        this.view.set_draw('output', true);
        this.view.redraw();
        this.runnning = true;
        // Set lastFrameTime to current time
        this.lastFrameTime = performance.now();
        this.run(performance.now());
    }

    public pause() {
        this.runnning = false;
    }

    // Stop main loop
    public stop() {
        // Set view to draw vertices/handles and not simulation/output
        this.view.set_draw('simulation', false);
        this.view.set_draw('handles', true);
        this.view.set_draw('vertices', true);
        this.view.set_draw('output', false);
        this.view.redraw();
        this.runnning = false;
    }

    // Restart main loop
    public resume() {
        this.runnning = true;
        // Set lastFrameTime to current time
        this.lastFrameTime = performance.now();
        this.run(performance.now());
    }
}
