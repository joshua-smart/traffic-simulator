import Model from '../model/model';
import View from '../view/view';
import RoadNetworkController from './roadNetworkController';
import SimulationController from './simulationController';
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
    movingVertex,
    movingHandle
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
    leftClickHandle,
    scroll,
    undo,
    redo,
    save,
    load
}

export default class Controller {
    private roadNetworkController: RoadNetworkController;
    private simulationController: SimulationController;

    private stateMachine: StateMachine<Event>;

    constructor(model: Model, view: View) {
        this.roadNetworkController = new RoadNetworkController(model, view);
        this.simulationController = new SimulationController(model, view);

        this.stateMachine = new StateMachine<Event>(0);

        this.initialise_state_machine();
        this.roadNetworkController.assign_listeners(this.stateMachine);
        this.simulationController.assign_listeners(this.stateMachine);
    }

    private initialise_state_machine(): void {
        // [previousStateId, eventId, nextStateId, callback]
        const transitions: [S, E, S, (e: Event) => void][] = [
            [S.idle,                   E.scroll,               S.idle,                   e => this.roadNetworkController.zoom_display(e)],
            [S.idle,                   E.undo,                 S.idle,                   () => this.roadNetworkController.undo()],
            [S.idle,                   E.redo,                 S.idle,                   () => this.roadNetworkController.redo()],
            [S.idle,                   E.save,                 S.idle,                   () => this.roadNetworkController.save()],
            [S.idle,                   E.load,                 S.idle,                   () => this.roadNetworkController.load()],
            [S.idle,                   E.start,                S.simuationActive,        () => this.simulationController.start()],
            [S.idle,                   E.leftClickEmpty,       S.panningDisplay,         null],
            [S.idle,                   E.shiftLeftClickVertex, S.vertexShiftClicked,     e => this.roadNetworkController.target_vertex(e)],
            [S.idle,                   E.shiftLeftClickEmpty,  S.creatingIsolatedVertex, null],
            [S.idle,                   E.leftClickVertex,      S.vertexClicked,          e => this.roadNetworkController.target_vertex(e)],
            [S.simuationActive,        E.stop,                 S.idle,                   () => this.simulationController.stop()],
            [S.simuationActive,        E.pause,                S.simulationPaused,       () => this.simulationController.pause()],
            [S.simulationPaused,       E.stop,                 S.idle,                   () => this.simulationController.stop()],
            [S.simulationPaused,       E.start,                S.simuationActive,        () => this.simulationController.resume()],
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
            [S.movingVertex,           E.mouseMove,            S.movingVertex,           e => this.roadNetworkController.move_vertex(e)],
            [S.idle,                   E.leftClickHandle,      S.movingHandle,           e => this.roadNetworkController.target_handle(e)],
            [S.movingHandle,           E.mouseMove,            S.movingHandle,           e => this.roadNetworkController.move_handle(e)],
            [S.movingHandle,           E.mouseUp,              S.idle,                   null]
        ];

        transitions.forEach(([previousStateId, eventId, nextStateId, callback]) => {
            this.stateMachine.add_rule(previousStateId, eventId, nextStateId, callback);
        });
    }
}
