import FiniteStateMachine from "./finiteStateMachine.js";
export default class InteractionManager {
    constructor(canvas, roadNetwork) {
        this.initialiseMouseInteraction(canvas, roadNetwork)
            .then(() => { });
        window.addEventListener('resize', () => {
            canvas.draw(roadNetwork);
        });
    }
    async initialiseMouseInteraction(canvas, roadNetwork) {
        const response = await fetch('./assets/mouseInteractionRules.json');
        const { initialState, rules } = await response.json();
        this.mouseInteractionFSM = new FiniteStateMachine(initialState);
        for (const [initialStateId, eventId, newStateId, callback] of rules) {
            this.mouseInteractionFSM.add_rule(initialStateId, eventId, newStateId);
        }
        // this.mouseInteractionFSM.add_callback('move-canvas', (event: MouseEvent) => {
        //     const deltaPos: Vector2 = new Vector2(event.movementX, event.movementY);
        //     canvas.move_origin(deltaPos);
        //     canvas.draw(roadNetwork);
        // });
        const canvasRootElement = canvas.get_canvas_root_element();
        canvasRootElement.addEventListener('mousedown', event => {
            // @ts-ignore
            const targetClassName = event.target.className;
            if (targetClassName == 'road-network-canvas' && event.shiftKey) {
                this.mouseInteractionFSM.transition(1, event);
            }
            if (targetClassName == 'road-network-canvas') {
                this.mouseInteractionFSM.transition(0, event);
            }
            else if (targetClassName == 'vertex' && event.shiftKey) {
                this.mouseInteractionFSM.transition(3, event);
            }
            else if (targetClassName == 'vertex') {
                this.mouseInteractionFSM.transition(2, event);
            }
        });
        canvasRootElement.addEventListener('mouseup', event => this.mouseInteractionFSM.transition(5, event));
        canvasRootElement.addEventListener('mousemove', event => this.mouseInteractionFSM.transition(4, event));
        canvasRootElement.addEventListener('wheel', event => {
            console.log(event);
        });
    }
}
