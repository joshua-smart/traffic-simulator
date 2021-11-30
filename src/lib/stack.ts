export default class Stack<Element> {
    private elements: Element[];
    private length: number;

    constructor() {
        this.elements = [];
        this.length = 0;
    }

    // Set element at index = length and increment length
    public push(element: Element): void {
        this.elements[this.length] = element;
        this.length++;
    }

    // Get top element and decrement length
    public pop(): Element {
        const topElement = this.peek();
        this.length--;
        return topElement;
    }

    // If stack currently has no elements
    public is_empty(): boolean {
        return this.length === 0;
    }

    // Pop all elements from the stack
    public clear(): void {
        while(!this.is_empty()) {
            this.pop();
        }
    }

    // Get top element of stack
    public peek(): Element {
        return this.elements[this.length - 1];
    }

    // Get current size of stack
    public get_size(): number {
        return this.length;
    }
}
