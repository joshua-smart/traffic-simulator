export default class Queue<Element> {
    private elements: Element[];

    constructor() {
        this.elements = [];
    }

    enqueue(element: Element): void {
        this.elements.push(element);
    }

    dequeue(): Element {
        return this.elements.shift();
    }

    is_empty(): boolean {
        return this.elements.length === 0;
    }
}
