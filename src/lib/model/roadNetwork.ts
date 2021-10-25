import Graph from './graph';
import Vector2 from '../vector2';

type Vertex = Vector2;
type Edge = {srcTangent: Vector2, dstTangent: Vector2};

export default class RoadNetwork extends Graph<Vertex, Edge>{
    constructor() {
        super();
    }
}
