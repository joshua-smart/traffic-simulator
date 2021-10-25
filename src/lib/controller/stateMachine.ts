export default class StateMachine<Payload> {
    private transitions: Map<number, {newStateId: number, callback: (payload: Payload) => void}>;
    private currentStateId: number;

    constructor(initalStateId: number) {
        this.transitions = new Map<number, {newStateId: number, callback: (payload: Payload) => void}>();
        this.currentStateId = initalStateId;
    }

    private static get_transition_id(stateId: number, eventId: number) {
        // This uses the cantor pairing function to map every pair of integers to unique values en.wikipedia.org/wiki/Pairing_function#Cantor_pairing_function
        return 0.5 * (stateId + eventId) * (stateId + eventId + 1) + eventId;
    }

    public add_rule(previousStateId: number, eventId: number, newStateId: number, callback: (payload: Payload) => void) {
        const transitionId = StateMachine.get_transition_id(previousStateId, eventId);
        this.transitions.set(transitionId, {newStateId, callback});
    }

    public transition(eventId: number, payload: Payload) {
        const transitionId = StateMachine.get_transition_id(this.currentStateId, eventId);
        if(!this.transitions.has(transitionId)) return;

        const {newStateId, callback} = this.transitions.get(transitionId);

        this.currentStateId = newStateId;
        callback(payload);
    }
}
