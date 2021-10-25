export default class Stack<Element> {
    private elements: Element[];

    constructor() {
        this.elements = [];
    }

    push(element: Element): void {
        this.elements.push(element);
    }

    pop(): Element {
        return this.elements.pop();
    }

    is_empty(): boolean {
        return this.elements.length === 0;
    }
}
