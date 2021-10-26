export default class Stack<Element> {
    private elements: Element[];

    constructor() {
        this.elements = [];
    }

    public push(element: Element): void {
        this.elements.push(element);
    }

    public pop(): Element {
        return this.elements.pop();
    }

    public is_empty(): boolean {
        return this.elements.length === 0;
    }

    public clear(): void {
        while(!this.is_empty()) {
            this.pop();
        }
    }
}
