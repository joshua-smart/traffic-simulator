import Model from "../model/model";
import View from "../view/view";

export default class SimulationController {
    private model: Model;
    private view: View;

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;
    }

    public start() {
        // Stop drawing vertices
        // Tell simulation to start
    }

    public pause() {

    }

    public stop() {
        
    }
}
