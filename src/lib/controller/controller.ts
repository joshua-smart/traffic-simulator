import Model from '../model/model';
import View from '../view/view';
import RoadNetworkController from './roadNetworkController';

export default class Controller {
    private model: Model;
    private view: View;
    private graphController: RoadNetworkController;

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;
        this.graphController = new RoadNetworkController(model, view);
    }
}
