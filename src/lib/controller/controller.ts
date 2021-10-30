import Model from '../model/model';
import View from '../view/view';
import RoadNetworkController from './roadNetworkController';
import StateMachine from './stateMachine';

export enum S {
    idle,
    simuationActive,
    simulationPaused,
    panningDisplay,
    vertexShiftClicked,
    creatingEdge,
    creatingIsolatedVertex,
    vertexClicked,
    movingVertex
}

export enum E {
    start,
    pause,
    stop,
    leftClickEmpty,
    mouseUp,
    mouseMove,
    shiftLeftClickVertex,
    shiftLeftClickEmpty,
    leftClickVertex,
    scroll,
    undo,
    redo,
    save,
    load
}

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
        const transitions: [S, E, S, (e: Event) => void][] = [
            [S.idle,                   E.scroll,               S.idle,                   e => this.roadNetworkController.zoom_display(e)],
            [S.idle,                   E.undo,                 S.idle,                   () => this.roadNetworkController.undo()],
            [S.idle,                   E.redo,                 S.idle,                   () => this.roadNetworkController.redo()],
            [S.idle,                   E.save,                 S.idle,                   () => this.roadNetworkController.save()],
            [S.idle,                   E.load,                 S.idle,                   () => this.roadNetworkController.load()],
            [S.idle,                   E.start,                S.simuationActive,        null/*start_simulation*/],
            [S.idle,                   E.leftClickEmpty,       S.panningDisplay,         null],
            [S.idle,                   E.shiftLeftClickVertex, S.vertexShiftClicked,     e => this.roadNetworkController.target_vertex(e)],
            [S.idle,                   E.shiftLeftClickEmpty,  S.creatingIsolatedVertex, null],
            [S.idle,                   E.leftClickVertex,      S.vertexClicked,          e => this.roadNetworkController.target_vertex(e)],
            [S.simuationActive,        E.stop,                 S.idle,                   null/*stop_simulation*/],
            [S.simuationActive,        E.pause,                S.simulationPaused,       null/*pause_simulation*/],
            [S.simulationPaused,       E.stop,                 S.idle,                   null/*stop_simulation*/],
            [S.simulationPaused,       E.start,                S.simuationActive,        null],
            [S.panningDisplay,         E.mouseUp,              S.idle,                   null],
            [S.panningDisplay,         E.mouseMove,            S.panningDisplay,         e => this.roadNetworkController.pan_display(e)],
            [S.vertexShiftClicked,     E.mouseUp,              S.idle,                   () => this.roadNetworkController.remove_vertex()],
            [S.vertexShiftClicked,     E.mouseMove,            S.creatingEdge,           e => this.roadNetworkController.target_vertex(e)],
            [S.creatingEdge,           E.mouseUp,              S.idle,                   e => this.roadNetworkController.finish_new_connection(e)],
            [S.creatingEdge,           E.mouseMove,            S.creatingEdge,           e => this.roadNetworkController.move_new_connection(e)],
            [S.creatingIsolatedVertex, E.mouseUp,              S.idle,                   e => this.roadNetworkController.create_isolated_vertex(e)],
            [S.vertexClicked,          E.mouseUp,              S.idle,                   null],
            [S.vertexClicked,          E.mouseMove,            S.movingVertex,           () => this.roadNetworkController.start_move_vertex()],
            [S.movingVertex,           E.mouseUp,              S.idle,                   null],
            [S.movingVertex,           E.mouseMove,            S.movingVertex,           e => this.roadNetworkController.move_vertex(e)]
        ];

        transitions.forEach(([previousStateId, eventId, nextStateId, callback]) => {
            this.stateMachine.add_rule(previousStateId, eventId, nextStateId, callback);
        });
    }
}
