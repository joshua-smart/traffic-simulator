import Model from "../model/model";
import View from "../view/view";
import StateMachine from "./stateMachine";
import { E } from './controller';
import IOManager from "./ioManager";

export default class SimulationController {
    private model: Model;
    private view: View;

    private runnning: boolean = false;

    private lastFrameTime: number = 0;

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;
    }

    public assign_listeners(stateMachine: StateMachine<Event>) {
        document.querySelector('#start-button').addEventListener('click', () => {
            stateMachine.transition(E.start, null);
        });

        document.querySelector('#pause-button').addEventListener('click', () => {
            stateMachine.transition(E.pause, null);
        });

        document.querySelector('#stop-button').addEventListener('click', () => {
            stateMachine.transition(E.stop, null);
        });

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

    private run(time: number) {
        const timeStep = (time - this.lastFrameTime)/1000;
        this.lastFrameTime = time;
        this.model.step_simulation(timeStep);
        this.view.redraw();

        if (this.runnning) return requestAnimationFrame((time) => this.run(time));
    }

    public start() {
        this.model.start_simulation();
        this.view.set_draw('simulation', true);
        this.view.set_draw('vertices', false);
        this.view.set_draw('handles', false);
        this.view.set_draw('output', true);
        this.view.redraw();
        this.runnning = true;
        this.lastFrameTime = performance.now();
        this.run(performance.now());
    }

    public pause() {
        this.runnning = false;
    }

    public stop() {
        // this.model.stop_simulation();
        this.view.set_draw('simulation', false);
        this.view.set_draw('handles', true);
        this.view.set_draw('vertices', true);
        this.view.set_draw('output', false);
        this.view.redraw();
        this.runnning = false;
    }

    public resume() {
        this.runnning = true;
        this.lastFrameTime = performance.now();
        this.run(performance.now());
    }
}
