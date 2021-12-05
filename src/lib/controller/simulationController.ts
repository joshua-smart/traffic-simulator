import Model from "../model/model";
import View from "../view/view";
import StateMachine from "./stateMachine";
import { E } from './controller';

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
    }

    private run(time: number) {
        const timeStep = time - this.lastFrameTime;
        this.lastFrameTime = time;
        this.model.step_simulation(timeStep);
        this.view.redraw();

        if (this.runnning) requestAnimationFrame((time) => this.run(time));
    }

    public start() {
        this.model.start_simulation();
        this.view.set_draw_simulation(true);
        this.view.set_draw_vertices(false);
        this.view.set_draw_handles(false);
        this.view.redraw();
        this.runnning = true;
        this.run(this.lastFrameTime);
    }

    public pause() {
        this.runnning = false;
    }

    public stop() {
        this.model.stop_simulation();
        this.view.set_draw_simulation(false);
        this.view.set_draw_handles(true);
        this.view.set_draw_vertices(true);
        this.view.redraw();
        this.runnning = false;
    }

    public resume() {
        this.runnning = true;
        this.run(this.lastFrameTime);
    }
}
