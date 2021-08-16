export default class FiniteStateMachine<Payload>{
    private transitionTable: Map<number, {newStateId: number, callbackId: number}>;
    private callbackTable: Map<number, (payload: Payload) => void>;
    private stateId: number;

    private readonly getTransitionId = (stateId: number, eventId: number) => (2 ** stateId) * (3 ** eventId);

    constructor(initialState: number) {
        this.transitionTable = new Map<number, {newStateId: number, callbackId: number}>();
        this.callbackTable = new Map<number, (payload: Payload) => void>();
        this.stateId = initialState;
    }

    public transition(eventId: number, payload: Payload): void {
        const transitionId = this.getTransitionId(this.stateId, eventId);

        if (!this.transitionTable.has(transitionId)) { return; }
        const {newStateId, callbackId} = this.transitionTable.get(transitionId);
        this.stateId = newStateId;

        if(this.callbackTable.has(callbackId)) {
            this.callbackTable.get(callbackId)(payload);
        } else if (callbackId != -1) {
            throw new Error(`CallbackId: [${callbackId}] not implemented`);
        }

        document.querySelector('#TEMP').innerHTML = `state: ${this.stateId}`;
    }

    public add_rule(initialStateId: number, eventId: number, newStateId: number, callbackId = -1): void {
        const transitionId: number = this.getTransitionId(initialStateId, eventId);
        this.transitionTable.set(transitionId, {newStateId, callbackId});
    }

    public add_callback(callbackId: number, callbackFunction: (payload: Payload) => void): void {
        this.callbackTable.set(callbackId, callbackFunction);
    }
}