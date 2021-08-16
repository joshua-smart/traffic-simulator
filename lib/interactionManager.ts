import RoadNetwork from "./roadNetwork.js";
import Canvas from "./canvas.js";
import Vector2 from "./vector2.js";
import FiniteStateMachine from "./finiteStateMachine.js";

export default class InteractionManager {
    private mouseInteractionFSM: FiniteStateMachine;

    constructor(canvas: Canvas, roadNetwork: RoadNetwork) {
        this.initialiseMouseInteraction(canvas, roadNetwork)
            .then(() => {});


        window.addEventListener('resize', () => {
            canvas.draw(roadNetwork);
        });
    }

    private async initialiseMouseInteraction(canvas: Canvas, roadNetwork: RoadNetwork) {
        const response = await fetch('./assets/mouseInteractionRules.json');
        const {initialState, rules} = await response.json();
        this.mouseInteractionFSM = new FiniteStateMachine(initialState);

        for(const [initialStateId, eventId, newStateId, callback] of rules) {
            this.mouseInteractionFSM.add_rule(initialStateId, eventId, newStateId);

        }

        // this.mouseInteractionFSM.add_callback('move-canvas', (event: MouseEvent) => {
        //     const deltaPos: Vector2 = new Vector2(event.movementX, event.movementY);
        //     canvas.move_origin(deltaPos);
        //     canvas.draw(roadNetwork);
        // });

        const canvasRootElement: HTMLDivElement = canvas.get_canvas_root_element();

        canvasRootElement.addEventListener('mousedown', event => {
            // @ts-ignore
            const targetClassName = event.target.className;

            if (targetClassName == 'road-network-canvas' && event.shiftKey) { this.mouseInteractionFSM.transition(1, event); }
            if (targetClassName == 'road-network-canvas') { this.mouseInteractionFSM.transition(0, event); }
            else if (targetClassName == 'vertex' && event.shiftKey) { this.mouseInteractionFSM.transition(3, event); }
            else if (targetClassName == 'vertex') { this.mouseInteractionFSM.transition(2, event); }
        });

        canvasRootElement.addEventListener('mouseup', event => this.mouseInteractionFSM.transition(5, event));
        canvasRootElement.addEventListener('mousemove', event => this.mouseInteractionFSM.transition(4, event));

        canvasRootElement.addEventListener('wheel', event => {
            console.log(event);
        });
    }
}