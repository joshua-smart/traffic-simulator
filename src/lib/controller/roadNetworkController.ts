import Model from '../model/model';
import RoadNetwork from '../model/roadNetwork';
import Stack from '../stack';
import View from '../view/view';

export default class RoadNetworkController {
    private model: Model;

    private previousStates: Stack<RoadNetwork>;
    private futureStates: Stack<RoadNetwork>;

    constructor(model: Model, view: View) {
        this.model = model;

        this.previousStates = new Stack<RoadNetwork>();
        this.futureStates = new Stack<RoadNetwork>();
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
