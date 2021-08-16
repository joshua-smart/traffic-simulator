export default class FiniteStateMachine {
    private transitionTable: Map<number, {newStateId: number, callbackId: number}>;
    private callbackTable: Map<number, (payload: object) => void>;
    private stateId: number;
    public readonly getTransitionId: (stateId: number, eventId: number) => number;

    constructor(initialState: number) {
        this.transitionTable = new Map<number, {newStateId: number, callbackId: number}>();
        this.callbackTable = new Map<number, (payload: object) => void>();
        this.stateId = initialState;

        this.getTransitionId = (stateId, eventId) => (2 ** stateId) * (3 ** eventId);
    }

    public transition(eventId: number, payload: object): void {
        const transitionId = this.getTransitionId(this.stateId, eventId);

        if (!this.transitionTable.has(transitionId)) { return; }
        const {newStateId, callbackId} = this.transitionTable.get(transitionId);
        this.stateId = newStateId;

        if(this.callbackTable.has(callbackId)) {
            this.callbackTable.get(callbackId)(payload);
        }

        console.log(`state: ${this.stateId}`);
    }

    public add_rule(initialStateId: number, eventId: number, newStateId: number, callbackId: number = -1): void {
        const transitionId: number = this.getTransitionId(initialStateId, eventId);
        this.transitionTable.set(transitionId, {newStateId, callbackId});
    }

    public add_callback(callbackId: number, callbackFunction: (payload: object) => void): void {
        this.callbackTable.set(callbackId, callbackFunction);
    }
}