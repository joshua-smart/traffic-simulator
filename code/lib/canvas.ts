export default class Canvas {
    private element: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(rootElement: HTMLElement, width: number, height: number) {
        this.element = document.createElement('canvas');
        rootElement.appendChild(this.element);

        this.element.width = this.element.clientWidth;
        this.element.height = this.element.clientHeight;

        this.context = this.element.getContext('2d');
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#5e5e5e';
    }

    public draw_line(x1: number, y1: number, x2: number, y2: number) {
        this.context.beginPath();

        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);

        this.context.stroke();
    }
}
