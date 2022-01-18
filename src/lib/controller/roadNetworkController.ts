import Model from '../model/model';
import RoadNetwork from '../model/roadNetwork';
import Stack from '../stack';
import Vector2 from '../vector2';
import View from '../view/view';
import { E } from './controller';
import IOManager from './ioManager';
import StateMachine from './stateMachine';

export default class RoadNetworkController {
    private model: Model;
    private view: View;

    // Stacks for undo/redo functions
    private previousStates: Stack<RoadNetwork>;
    private futureStates: Stack<RoadNetwork>;

    // Mouse interaction attributes
    private targetedVertex: number;
    private targetedHandle: {srcId: number, dstId: number, position: 'start' | 'end'};

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;

        // Initialise empty stacks
        this.previousStates = new Stack<RoadNetwork>();
        this.futureStates = new Stack<RoadNetwork>();
    }

    // Assign listeners to stateMachine transitions
    public assign_listeners(stateMachine: StateMachine<Event>) {
        const element = this.view.get_canvas_element();

        element.addEventListener('mousedown', (e) => {
            // Isolate left-click events
            if (e.buttons !== 1) return;

            const shift = e.shiftKey;
            const targetClass = (<HTMLElement>e.target).className;

            switch (targetClass) {
                case ('canvas'): {
                    if (!shift) stateMachine.transition(E.leftClickEmpty, e);
                    else stateMachine.transition(E.shiftLeftClickEmpty, e);
                    break;
                }
                case ('vertex'): {
                    if (!shift) stateMachine.transition(E.leftClickVertex, e);
                    else stateMachine.transition(E.shiftLeftClickVertex, e);
                    break;
                }
                case ('handle'): {
                    if(!shift) stateMachine.transition(E.leftClickHandle, e);
                    break;
                }
            }
        });

        element.addEventListener('mouseup', (e) => stateMachine.transition(E.mouseUp, e));
        element.addEventListener('mousemove', (e) => stateMachine.transition(E.mouseMove, e));
        element.addEventListener('wheel', (e) => stateMachine.transition(E.scroll, e));

        document.querySelector('#undo-button').addEventListener('click', () => stateMachine.transition(E.undo, null));
        document.querySelector('#redo-button').addEventListener('click', () => stateMachine.transition(E.redo, null));

        document.querySelector('#save-button').addEventListener('click', () => stateMachine.transition(E.save, null));
        document.querySelector('#load-button').addEventListener('click', () => stateMachine.transition(E.load, null));
    }

    // Translate display by distance moved by mouse
    public pan_display(e: Event): void {
        const {movementX, movementY} = <MouseEvent>e;
        this.view.pan_display(new Vector2(movementX, movementY));
        this.view.redraw();
    }

    // Zoom display by factor centered on mouse position
    public zoom_display(e: Event): void {
        const zoomStrength = 1.2;
        const {deltaY} = (<WheelEvent>e);
        const center = this.get_relative_screen_position(<WheelEvent>e);
        // map (-100, 100) to (1/zoomStrength, zoomStrength)
        const factor = deltaY > 0 ? 1/zoomStrength : zoomStrength;

        this.view.zoom_display(center, factor);
        this.view.redraw();
    }

    // Set vertexTarget to id of vertex targeted by the mouse
    public target_vertex(e: Event) {
        this.targetedVertex = Number((<HTMLElement>e.target).getAttribute('vertexId'));
    }

    // Draw ghost edge between targetedVertex and mouse position
    public move_new_connection(e: Event): void {
        const screenPosition = this.get_relative_screen_position(<MouseEvent>e);
        this.view.set_ghost_edge(this.targetedVertex, screenPosition);
        this.view.redraw();
    }

    // If not targeting a vertex, create a new vertex and connect it, otherwise connect to new targeted vertex
    public finish_new_connection(e: Event): void {
        this.user_action(() => {
            let dstId: number;
            // If not targeting a vertex
            if ((<HTMLElement>e.target).id === 'main-canvas') {
                const worldPosition = this.get_relative_world_position(<MouseEvent>e);
                // Create new vertex
                dstId = this.model.add_vertex(worldPosition);
            } else {
                // Get index of targeted vertex
                dstId = Number((<HTMLElement>e.target).getAttribute('vertexId'));
            }
            // Add edge
            this.model.toggle_edge(this.targetedVertex, dstId);
            // Unset targetedVertex and ghost edge
            this.targetedVertex = null;
            this.view.remove_ghost_edge();
            this.view.redraw();
        });
    }

    // Create new vertex with no connections
    public create_isolated_vertex(e: Event): void {
        this.user_action(() => {
            const worldPosition = this.get_relative_world_position(<MouseEvent>e);
            this.model.add_vertex(worldPosition);
            this.view.redraw();
        });
    }

    // Move the targeted vertex to the mouse position
    public move_vertex(e: Event): void {
        const worldPosition = this.get_relative_world_position(<MouseEvent>e);
        this.model.set_vertex(this.targetedVertex, worldPosition);
        this.view.redraw();
    }

    // Indicates the start of a vertex move event, for compatibility with undo/redo
    public start_move_vertex(): void {
        this.user_action();
    }

    // Remove the targeted vertex from the road network
    public remove_vertex(): void {
        this.user_action(() => {
            this.model.remove_vertex(this.targetedVertex);
            this.view.redraw();
        });
    }

    // Set targetedHandle to handle at mouse position
    public target_handle(e: Event): void {
        this.user_action(() => {
            const element = <HTMLElement>e.target;
            this.targetedHandle = {
                srcId: Number(element.getAttribute('srcId')),
                dstId: Number(element.getAttribute('dstId')),
                position: <'start' | 'end'>element.getAttribute('position')
            };
        });
    }

    // Move targetedHandle to mouse position
    public move_handle(e: Event): void {
        const worldPosition = this.get_relative_world_position(<MouseEvent>e);
        this.model.set_handle(this.targetedHandle, worldPosition);
        this.view.redraw();
    }

    // Undo last action
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

    // Reverse last undo
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

    // Wrapper for other event handlers, for compatibility with undo/redo
    private user_action(action?: () => void): void {
        // Copy current roadNetwork
        const currentState = this.model.copy_road_network();
        // Push currentState onto previousStates and enable undo
        this.previousStates.push(currentState);
        this.enable_undo_button();
        // Clear futureStates and disable redo
        this.futureStates.clear();
        this.disable_redo_button();
        // Perform action
        if (action) action();
    }

    // Save the current road network state to a local file
    public save(): void {
        const roadNetwork = this.model.copy_road_network();
        IOManager.save_road_network(roadNetwork);
    }

    // Load a road network from a local file
    public load(): void {
        IOManager.load_road_network(roadNetwork => {
            this.model.apply_state(roadNetwork);
            this.view.redraw();
        });
    }

    // Get the position of the mouse relative to top right of canvas inline with pixel scaling
    private get_relative_screen_position(e: MouseEvent): Vector2 {
        const {x, y} = e;
        return new Vector2(x, y - this.view.get_canvas_offset());
    }

    // Get the position of the mouse relative to the view transform, in world space
    private get_relative_world_position(e: MouseEvent): Vector2 {
        const screenPosition = this.get_relative_screen_position(e);
        return this.view.to_world_space(screenPosition);
    }

    // Methods for enabling/disabling the use of undo/redo buttons to indicate availability in the stacks
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

    // Helper methods for enabling/disabling buttons
    private enable_button(element: HTMLElement) {
        element.classList.remove('disabled');
        element.classList.add('active');
    }
    private disable_button(element: HTMLElement) {
        element.classList.remove('active');
        element.classList.add('disabled');
    }
}
