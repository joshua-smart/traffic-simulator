import Model from '../model/model';
import RoadNetwork from '../model/roadNetwork';
import Stack from '../stack';
import View from '../view/view';
import StateMachine from './stateMachine';

export default class RoadNetworkController {
    private model: Model;
    private view: View;

    private previousStates: Stack<RoadNetwork>;
    private futureStates: Stack<RoadNetwork>;

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;

        this.previousStates = new Stack<RoadNetwork>();
        this.futureStates = new Stack<RoadNetwork>();
    }

    public assign_listeners(stateMachine: StateMachine<Event>) {
        const element = this.view.get_canvas_element();

        element.addEventListener('mousedown', (e) => {
            // Isolate left-click events
            if (e.buttons !== 1) return;

            const shift = e.shiftKey;
            const emptyTarget = (<HTMLElement>e.target).id === 'road-network-canvas';

            // Left click (empty)
            if (!shift && emptyTarget) stateMachine.transition(3, e);
            // shift-Left click (empty)
            if (shift && emptyTarget)  stateMachine.transition(7, e);
            // Left click (vertex)
            if (!shift && !emptyTarget) stateMachine.transition(6, e);
            // shift-Left click (vertex)
            if (shift && !emptyTarget) stateMachine.transition(8, e);
        }, false);

        element.addEventListener('mouseup', (e) => {
            stateMachine.transition(4, e);
        });

        element.addEventListener('mousemove', (e) => {
            stateMachine.transition(5, e);
        });

        element.addEventListener('wheel', (e) => {
            stateMachine.transition(9, e);
        });
    }
    private undo(): void {
        const currentState = this.model.copy_road_network();
        this.futureStates.push(currentState);
        const newState = this.previousStates.pop();
        this.model.apply_state(newState);
    }

    private redo(): void {
        // Maybe alert or error message here...
        if (this.futureStates.is_empty()) return;

        const currentState = this.model.copy_road_network();
        this.previousStates.push(currentState);
        const newState = this.futureStates.pop();
        this.model.apply_state(newState);
    }

    private user_action(action: () => void): void {
        const currentState = this.model.copy_road_network();
        this.previousStates.push(currentState);
        this.futureStates.clear();
        action();
    }
}
