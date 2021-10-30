import Model from '../model/model';
import RoadNetwork from '../model/roadNetwork';
import Stack from '../stack';
import Vector2 from '../vector2';
import View from '../view/view';
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

            // Left click (empty)
            if (!shift && emptyTarget) stateMachine.transition(3, e);
            // shift-Left click (empty)
            if (shift && emptyTarget)  stateMachine.transition(7, e);
            // Left click (vertex)
            if (!shift && !emptyTarget) stateMachine.transition(8, e);
            // shift-Left click (vertex)
            if (shift && !emptyTarget) stateMachine.transition(6, e);
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

        document.querySelector('#undo-button').addEventListener('click', () => {
            stateMachine.transition(10, null);
        });

        document.querySelector('#redo-button').addEventListener('click', () => {
            stateMachine.transition(11, null);
        });
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
        if (this.previousStates.is_empty()) return;
        const currentState = this.model.copy_road_network();
        this.futureStates.push(currentState);
        const newState = this.previousStates.pop();
        this.model.apply_state(newState);
        this.view.redraw();
    }

    public redo(): void {
        // Maybe alert or error message here...
        if (this.futureStates.is_empty()) return;

        const currentState = this.model.copy_road_network();
        this.previousStates.push(currentState);
        const newState = this.futureStates.pop();
        this.model.apply_state(newState);
        this.view.redraw();
    }

    private user_action(action: () => void): void {
        const currentState = this.model.copy_road_network();
        this.previousStates.push(currentState);
        this.futureStates.clear();
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
}
