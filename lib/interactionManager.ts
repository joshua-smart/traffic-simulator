import RoadNetwork from "./roadNetwork.js";
import Canvas from "./canvas.js";
import Vector2 from "./vector2.js";
import FiniteStateMachine from "./finiteStateMachine.js";

export default class InteractionManager {
    private mouseInteractionFSM: FiniteStateMachine<MouseEvent | WheelEvent>;
    private selectedVertexId: number;

    constructor(canvas: Canvas, roadNetwork: RoadNetwork) {
        this.initialiseMouseInteraction(canvas, roadNetwork).then(() => {});


        window.addEventListener('resize', () => {
            canvas.draw(roadNetwork);
        });
    }

    private async initialiseMouseInteraction(canvas: Canvas, roadNetwork: RoadNetwork) {
        const {initialStateId, rules} = await (await fetch('./assets/mouse_interaction_rules.json')).json();
        this.mouseInteractionFSM = new FiniteStateMachine<MouseEvent | WheelEvent>(initialStateId);

        for(const [initialStateId, eventId, newStateId, callbackId] of rules) {
            this.mouseInteractionFSM.add_rule(initialStateId, eventId, newStateId, callbackId);
        }

        // Callback[0]: move canvas
        this.mouseInteractionFSM.add_callback(0, (event: MouseEvent) => {
            canvas.origin = new Vector2(event.movementX, event.movementY).add(canvas.origin);
            canvas.draw(roadNetwork);
        });

        // Callback[1]: zoom canvas
        this.mouseInteractionFSM.add_callback(1, (event: WheelEvent) => {
            const zoomMultiplier = 2 ** (event.deltaY * -0.002);
            const mousePosition = InteractionManager.extract_screen_mouse_position(event, canvasRootElement);
            canvas.origin = canvas
                .origin
                .sub(mousePosition)
                .mult(zoomMultiplier)
                .add(mousePosition);
            canvas.scale *= zoomMultiplier;
            canvas.draw(roadNetwork);
        });

        //Callback[2]: move selected vertex
        this.mouseInteractionFSM.add_callback(2, (event: MouseEvent) => {
            const vertexId = InteractionManager.extract_target_vertex_id(event);
            if(vertexId != undefined) this.selectedVertexId = vertexId;

            const mouseWorldPosition = InteractionManager.extract_world_mouse_position(event, canvasRootElement, canvas);
            roadNetwork.set_vertex(this.selectedVertexId, mouseWorldPosition);
            canvas.draw(roadNetwork);
        });

        //Callback[3]: created isolated node
        this.mouseInteractionFSM.add_callback(3, (event: MouseEvent) => {
            const mouseWorldPosition = InteractionManager.extract_world_mouse_position(event, canvasRootElement, canvas);
            roadNetwork.add_vertex(mouseWorldPosition);
            canvas.draw(roadNetwork);
        });

        //Callback[4]: shift-click vertex
        this.mouseInteractionFSM.add_callback(4, (event: MouseEvent) => {
            this.selectedVertexId = InteractionManager.extract_target_vertex_id(event);
        });

        //Callback[5]: end new edge creation
        this.mouseInteractionFSM.add_callback(5, (event: MouseEvent) => {
            const targetElement = <HTMLElement>event.target;

            if (targetElement.className == 'vertex') {
                const endVertexId = InteractionManager.extract_target_vertex_id(event);
                const existingEdgeValue = roadNetwork.get_edge(this.selectedVertexId, endVertexId);
                const newEdgeValue = existingEdgeValue ? 0 : 1;
                roadNetwork.add_edge(this.selectedVertexId, endVertexId, newEdgeValue);
            }

            canvas.draw(roadNetwork);
        });

        const canvasRootElement: HTMLDivElement = canvas.get_canvas_root_element();
        canvasRootElement.addEventListener('mousedown', event => {
            const targetClassName = (<HTMLElement>event.target).className;

            if (targetClassName == 'road-network-canvas' && event.shiftKey) { this.mouseInteractionFSM.transition(1, event); }
            if (targetClassName == 'road-network-canvas') { this.mouseInteractionFSM.transition(0, event); }
            else if (targetClassName == 'vertex' && event.shiftKey) { this.mouseInteractionFSM.transition(3, event); }
            else if (targetClassName == 'vertex') { this.mouseInteractionFSM.transition(2, event); }
        });

        canvasRootElement.addEventListener('mouseup', event => this.mouseInteractionFSM.transition(5, event));
        canvasRootElement.addEventListener('mousemove', event => this.mouseInteractionFSM.transition(4, event));
        canvasRootElement.addEventListener('wheel', event => this.mouseInteractionFSM.transition(6, event));
    }

    private static extract_screen_mouse_position(event: MouseEvent, element: HTMLElement): Vector2 {
        return new Vector2(event.x - element.offsetLeft, event.y - element.offsetTop);
    }

    private static extract_world_mouse_position(event: MouseEvent, element: HTMLElement, canvas: Canvas): Vector2 {
        const screenPosition = InteractionManager.extract_screen_mouse_position(event, element);
        return canvas.screen_to_world_position(screenPosition);
    }

    private static extract_target_vertex_id(event: MouseEvent): number {
        const targetElement = <HTMLElement>event.target;
        const vertexIdString = targetElement.id.slice(6);
        if (vertexIdString) {
            return Number(vertexIdString);
        }
        return undefined;
    }
}