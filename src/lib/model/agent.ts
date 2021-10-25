import Queue from '../queue';

export default class Agent {
    private distance: number;
    private speed: number;
    private route: Queue<number>;
}
