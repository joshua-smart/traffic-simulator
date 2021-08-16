export default class FiniteStateMachine {
    constructor(initialState) {
        this.transitionTable = new Map();
        this.callbackTable = new Map();
        this.stateId = initialState;
        this.getTransitionId = (stateId, eventId) => (2 ** stateId) * (3 ** eventId);
    }
    transition(eventId, payload) {
        const transitionId = this.getTransitionId(this.stateId, eventId);
        if (!this.transitionTable.has(transitionId)) {
            return;
        }
        const { newStateId, callbackId } = this.transitionTable.get(transitionId);
        this.stateId = newStateId;
        if (this.callbackTable.has(callbackId)) {
            this.callbackTable.get(callbackId)(payload);
        }
        console.log(`state: ${this.stateId}`);
    }
    add_rule(initialStateId, eventId, newStateId, callbackId = -1) {
        const transitionId = this.getTransitionId(initialStateId, eventId);
        this.transitionTable.set(transitionId, { newStateId, callbackId });
    }
    add_callback(callbackId, callbackFunction) {
        this.callbackTable.set(callbackId, callbackFunction);
    }
}
