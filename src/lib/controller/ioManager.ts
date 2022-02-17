import RoadNetwork from "../model/roadNetwork";
import { saveAs } from 'file-saver';
import Vector2 from "../vector2";
import { SimulationOutput } from "../model/simulationRecorder";
import { utils, writeFile, Sheet } from 'xlsx';

// Specifies the objects that must be contained in a valid road network json file
export type JSONRoadNetwork = {
    adjacencyMatrix: {
        t1: {x: number, y: number}, t2: {x: number, y: number}
    }[][],
    vertices: {x: number, y: number}[]
};

export default class IOManager {

    // Save current road network to a file
    public static save_road_network(roadNetwork: RoadNetwork): void {
        // Convert roadNetwork to json representation
        const json = JSON.stringify(roadNetwork);
        // Prompt the native saveas dialog and allow the user to save the file
        const file = new File([json], 'my road network.json', {type: 'application/json;charset=utf-8'});
        saveAs(file);
    }

    // Request file from the user and load it into the current roadNetwork
    public static async load_road_network(callback: (roadNetwork: RoadNetwork) => void) {
        // Create temporary element to start a file load event
        const fileInput = <HTMLInputElement>document.querySelector('#file-input');
        // Prompt the native file upload dialog
        fileInput.click();
        fileInput.onchange = async () => {
            // Catch errors on invalid files
            try {
                const file = fileInput.files[0];
                // Convert text to JSON
                const json = <JSONRoadNetwork>JSON.parse(await file.text());
                // Convert json to RoadNetwork
                const roadNetwork = this.json_to_road_network(json);
                callback(roadNetwork);
            } catch {
                // Display error alert to user
                alert('File could not be loaded');
            }
        };
    }

    // Apply data in JSON object to a blank RoadNetwork and return
    public static json_to_road_network(json: JSONRoadNetwork) {
        const roadNetwork = new RoadNetwork();

        // Set vertices
        for(const jsonVertex of json.vertices) {
            const vertex = new Vector2(jsonVertex.x, jsonVertex.y);
            roadNetwork.add_vertex(vertex);
        }

        // Set edges
        for(let srcId = 0; srcId < roadNetwork.size(); srcId++) {
            for(let dstId = 0; dstId < roadNetwork.size(); dstId++) {
                const jsonEdge = json.adjacencyMatrix[srcId][dstId];
                if (jsonEdge) {
                    const t1 = new Vector2(jsonEdge.t1.x, jsonEdge.t1.y);
                    const t2 = new Vector2(jsonEdge.t2.x, jsonEdge.t2.y);

                    roadNetwork.set_edge(srcId, dstId, {t1, t2});
                }
            }
        }

        return roadNetwork;
    }

    // Generate xlsx Sheet object from simulation output data
    private static generate_sheet_from_output(data: SimulationOutput[]): Sheet {
        const filteredData = data.map(row => {
            // Remove dataPoint entry from object
            const { dataPoints, ...filteredRow } = row;
            // If an entry is NaN
            Object.keys(filteredRow).forEach(key => {
                if (!isNaN(filteredRow[key])) return;
                filteredRow[key] = 'NaN';
            });
            return filteredRow;
        });
        return utils.json_to_sheet(filteredData);
    }

    // Save output data to .xlsx file
    public static save_ouput_as_excel(data: SimulationOutput[]): void {
        const workbook = utils.book_new();
        const sheet = this.generate_sheet_from_output(data);
        utils.book_append_sheet(workbook, sheet, 'Sheet1');
        writeFile(workbook, 'myData.xlsx');
    }

    // Save output data to .csv file
    public static save_ouput_as_csv(data: SimulationOutput[]): void {
        const workbook = utils.book_new();
        const sheet = this.generate_sheet_from_output(data);
        utils.book_append_sheet(workbook, sheet, 'Sheet1');
        writeFile(workbook, 'myData.csv');
    }
}
