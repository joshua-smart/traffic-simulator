import Model from "../model/model";
import View from "../view/view";
import StateMachine from "./stateMachine";
import { E } from './controller';

export default class SimulationController {
    private model: Model;
    private view: View;

    private runnning: boolean = false;

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
    }

    private run() {
        this.model.step_simulation();
        this.view.redraw();

        if (this.runnning) requestAnimationFrame(() => this.run());
    }

    public start() {
        this.model.start_simulation();
        this.runnning = true;
        this.run();
    }

    public pause() {
        this.runnning = false;
    }

    public stop() {
        this.model.stop_simulation();
        this.runnning = false;
    }

    public resume() {
        this.runnning = true;
        this.run();
    }
}
