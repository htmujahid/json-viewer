import { filterValue } from "../utils/filter";
import JsonParser from "./JsonParser";

export class JSONViewerFactory {

    createJSONViewer({
        json,
        root,
        filter,
        maxLevel,
        columnAt,
    }: {
        json: any;
        root: string;
        filter: string;
        maxLevel: number;
        columnAt: number;
    }) {
        const jsonViewer = new JsonViewer();

        jsonViewer.setJSON(json);
        jsonViewer.setRoot(root);
        jsonViewer.setMaxLevel(maxLevel);
        jsonViewer.setColumnAt(columnAt);

        filterValue(jsonViewer, filter);

        jsonViewer.init();

        return jsonViewer;
    }
}

export default class JsonViewer {
    root: string;
    jsonContainer: HTMLElement;
    json: any;
    maxLevel: number;
    columnAt: number;

    constructor() {
        this.root = "";
        this.jsonContainer = document.createElement("pre");
        this.jsonContainer.classList.add("json-viewer");
        this.maxLevel = -1;
        this.columnAt = -1;
    }

    init() {
        this.jsonContainer.innerHTML = "";

        const jsonParser = new JsonParser();
        
        jsonParser.parseJSON(
            this.jsonContainer,
            this.json,
            this.maxLevel,
            this.columnAt,
            0,
            this.root
        );
    }

    setJSON(json: any) {
        this.json = json;
    }

    setRoot(root: string) {
        this.root = root;
    }

    setMaxLevel(maxLvl: number) {
        this.maxLevel = maxLvl;
    }

    setColumnAt(colAt: number) {
        this.columnAt = colAt;
    }

    getJSON() {
        return this.json;
    }

    getRoot() {
        return this.root;
    }

    getMaxLevel() {
        return this.maxLevel;
    }

    getColumnAt() {
        return this.columnAt;
    }

    getJSONContainer() {
        return this.jsonContainer;
    }
}