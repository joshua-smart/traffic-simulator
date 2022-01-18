import StateMachine from "../lib/controller/stateMachine";

describe("state machine test suite", () => {
    let stateMachine: StateMachine<number>;

    it("instantiate state machine class", () => {
        stateMachine = new StateMachine<number>(0);
    });

    it("add rule (0, 0) -> (1, () => {})", () => {
        stateMachine.add_rule(0, 0, 1);
    });

    it("transition with event 0", () => {
        stateMachine.transition(0, null);
    });

    it("transition with unbound event 1", () => {
        stateMachine.transition(1, null);
    });
});
