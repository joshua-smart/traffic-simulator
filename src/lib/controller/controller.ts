import Model from '../model/model';
import View from '../view/view';
import RoadNetworkController from './roadNetworkController';
import StateMachine from './stateMachine';

export default class Controller {
    private model: Model;
    private view: View;
    private roadNetworkController: RoadNetworkController;

    private stateMachine: StateMachine<Event>;

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;
        this.roadNetworkController = new RoadNetworkController(model, view);

        this.stateMachine = new StateMachine<Event>(0);

        this.initialise_state_machine();
        this.roadNetworkController.assign_listeners(this.stateMachine);
    }

    private initialise_state_machine(): void {
        // [previousStateId, eventId, nextStateId, callback]
        const transitions: [number, number, number, (e: Event) => void][] = [
            [0, 9, 0, e => this.roadNetworkController.zoom_display(e)],
            [0, 0, 1, null/*start_simulation*/],
            [0, 3, 3, null],
            [0, 6, 4, e => this.roadNetworkController.target_vertex(e)],
            [0, 7, 6, null],
            [0, 8, 7, e => this.roadNetworkController.target_vertex(e)],
            [1, 2, 0, null/*stop_simulation*/],
            [1, 1, 2, null/*pause_simulation*/],
            [2, 2, 0, null/*stop_simulation*/],
            [2, 0, 1, null],
            [3, 4, 0, null],
            [3, 5, 3, e => this.roadNetworkController.pan_display(e)],
            [4, 4, 0, () => this.roadNetworkController.remove_vertex()],
            [4, 5, 5, e => this.roadNetworkController.target_vertex(e)],
            [5, 4, 0, e => this.roadNetworkController.finish_new_connection(e)/*finish_new_connection*/],
            [5, 5, 5, e => this.roadNetworkController.move_new_connection(e)/*move_new_connection*/],
            [6, 4, 0, e => this.roadNetworkController.create_isolated_vertex(e)/*create_isolated_vertex*/],
            [7, 4, 0, null],
            [7, 5, 8, e => this.roadNetworkController.move_vertex(e)/*start_moving_vertex*/],
            [8, 4, 0, null],
            [8, 5, 8, e => this.roadNetworkController.move_vertex(e)/*move_vertex*/]
        ];

        transitions.forEach(([previousStateId, eventId, nextStateId, callback]) => {
            this.stateMachine.add_rule(previousStateId, eventId, nextStateId, callback);
        });
    }
}
