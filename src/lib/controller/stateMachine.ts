export default class StateMachine<Payload> {
    private transitions: Map<number, {newStateId: number, callback: (payload: Payload) => void}>;
    private currentStateId: number;

    constructor(initalStateId: number) {
        this.transitions = new Map<number, {newStateId: number, callback: (payload: Payload) => void}>();
        this.currentStateId = initalStateId;
    }

    // Use the cantor pairing function to map every pair of integers (stateId, eventId) to a unique value (transitionId) en.wikipedia.org/wiki/Pairing_function#Cantor_pairing_function
    private static get_transition_id(stateId: number, eventId: number) {
        return 0.5 * (stateId + eventId) * (stateId + eventId + 1) + eventId;
    }

    // Generate transitionId for state and event combo and add transition data to transitions Map
    public add_rule(previousStateId: number, eventId: number, newStateId: number, callback: (payload: Payload) => void) {
        const transitionId = StateMachine.get_transition_id(previousStateId, eventId);
        this.transitions.set(transitionId, {newStateId, callback});
    }

    // If the transition exists, update state to newState and call callback, passing payload if specified
    public transition(eventId: number, payload: Payload) {
        const transitionId = StateMachine.get_transition_id(this.currentStateId, eventId);
        if(!this.transitions.has(transitionId)) return;

        const {newStateId, callback} = this.transitions.get(transitionId);

        this.currentStateId = newStateId;
        if (callback) callback(payload);
    }
}
