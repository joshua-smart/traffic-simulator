import Model from '../model/model';
import RoadNetwork from '../model/roadNetwork';
import Stack from '../stack';
import Vector2 from '../vector2';
import View from '../view/view';
import { E } from './controller';
import StateMachine from './stateMachine';

export default class RoadNetworkController {
    private model: Model;
    private view: View;

    private previousStates: Stack<RoadNetwork>;
    private futureStates: Stack<RoadNetwork>;

    private targetedVertex: number;

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
            const emptyTarget = (<HTMLElement>e.target).id === 'main-canvas';

            // Left click (empty): e3
            if (!shift && emptyTarget) stateMachine.transition(E.leftClickEmpty, e);
            // shift-Left click (empty): e7
            if (shift && emptyTarget)  stateMachine.transition(E.shiftLeftClickEmpty, e);
            // Left click (vertex): e8
            if (!shift && !emptyTarget) stateMachine.transition(E.leftClickVertex, e);
            // shift-Left click (vertex): e6
            if (shift && !emptyTarget) stateMachine.transition(E.shiftLeftClickVertex, e);
        }, false);
        // mousereleased: e4
        element.addEventListener('mouseup', (e) => stateMachine.transition(E.mouseUp, e));
        // mousemove: e5
        element.addEventListener('mousemove', (e) => stateMachine.transition(E.mouseMove, e));
        // scroll: e9
        element.addEventListener('wheel', (e) => stateMachine.transition(E.scroll, e));
        // undo: e10
        document.querySelector('#undo-button').addEventListener('click', () => stateMachine.transition(E.undo, null));
        // redo: e11
        document.querySelector('#redo-button').addEventListener('click', () => stateMachine.transition(E.redo, null));
    }

    public pan_display(e: Event): void {
        const {movementX, movementY} = <MouseEvent>e;
        this.view.pan_display(new Vector2(movementX, movementY));
        this.view.redraw();
    }

    public zoom_display(e: Event): void {
        const zoomStrength = 1.2;
        const {deltaY} = (<WheelEvent>e);
        const center = this.get_relative_screen_position(<WheelEvent>e);
        const factor = deltaY === 100 ? zoomStrength : 1/zoomStrength;

        this.view.zoom_display(center, factor);
        this.view.redraw();
    }

    public finish_new_connection(e: Event): void {
        this.user_action(() => {
            let dstId;
            if ((<HTMLElement>e.target).id === 'main-canvas') {
                const worldPosition = this.get_relative_world_position(<MouseEvent>e);
                dstId = this.model.add_vertex(worldPosition);
            } else {
                dstId = Number((<HTMLElement>e.target).getAttribute('vertexId'));
            }
            this.model.toggle_edge(this.targetedVertex, dstId);
            this.targetedVertex = null;
            this.view.remove_ghost_edge();
            this.view.redraw();
        });
    }

    public move_new_connection(e: Event): void {
        const screenPosition = this.get_relative_screen_position(<MouseEvent>e);
        this.view.set_ghost_edge(this.targetedVertex, screenPosition);
        this.view.redraw();
    }

    public create_isolated_vertex(e: Event): void {
        this.user_action(() => {
            const worldPosition = this.get_relative_world_position(<MouseEvent>e);
            this.model.add_vertex(worldPosition);
            this.view.redraw();
        });
    }

    public target_vertex(e: Event) {
        this.targetedVertex = Number((<HTMLElement>e.target).getAttribute('vertexId'));
    }

    public move_vertex(e: Event): void {
        const worldPosition = this.get_relative_world_position(<MouseEvent>e);
        this.model.set_vertex(this.targetedVertex, worldPosition);
        this.view.redraw();
    }

    public start_move_vertex(): void {
        this.user_action(() => {});
    }

    public remove_vertex(): void {
        this.user_action(() => {
            this.model.remove_vertex(this.targetedVertex);
            this.view.redraw();
        });
    }

    public undo(): void {
        // If no previous states, end function
        if (this.previousStates.is_empty()) return;
        // Copy currentState
        const currentState = this.model.copy_road_network();
        // Push currentState onto futureStates stack and enable redo
        this.futureStates.push(currentState);
        this.enable_redo_button();
        // Get latest state from previousStates stack and disable undo if it is now empty
        const newState = this.previousStates.pop();
        if (this.previousStates.is_empty()) this.disable_undo_button();
        // Apply new state and redraw
        this.model.apply_state(newState);
        this.view.redraw();
    }

    public redo(): void {
        // If no future states to redo, end function
        if (this.futureStates.is_empty()) return;
        // Copy current state
        const currentState = this.model.copy_road_network();
        // Push current state onto previousStates stack and enable undo
        this.previousStates.push(currentState);
        this.enable_undo_button();
        // Get latest state from futureStates and disable redo if it is now empty
        const newState = this.futureStates.pop();
        if (this.futureStates.is_empty()) this.disable_redo_button();
        // Apply new state and redraw
        this.model.apply_state(newState);
        this.view.redraw();
    }

    private user_action(action: () => void): void {
        // Copy current roadNetwork
        const currentState = this.model.copy_road_network();
        // Push currentState onto previousStates and enable undo
        this.previousStates.push(currentState);
        this.enable_undo_button();
        // Clear futureStates and disable redo
        this.futureStates.clear();
        this.disable_redo_button();
        action();
    }

    private get_relative_screen_position(e: MouseEvent): Vector2 {
        const {x, y} = e;
        return new Vector2(x, y - this.view.get_canvas_offset());
    }

    private get_relative_world_position(e: MouseEvent): Vector2 {
        const screenPosition = this.get_relative_screen_position(e);
        return this.view.to_world_space(screenPosition);
    }

    private disable_redo_button() {
        this.disable_button(document.querySelector('#redo-button'));
    }
    private enable_redo_button() {
        this.enable_button(document.querySelector('#redo-button'));
    }
    private disable_undo_button() {
        this.disable_button(document.querySelector('#undo-button'));
    }
    private enable_undo_button() {
        this.enable_button(document.querySelector('#undo-button'));
    }

    private enable_button(element: HTMLElement) {
        element.classList.remove('disabled');
        element.classList.add('active');
    }
    private disable_button(element: HTMLElement) {
        element.classList.remove('active');
        element.classList.add('disabled');
    }
}
