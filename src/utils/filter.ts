import JsonViewer from "../core/JsonViewer";

export function filterValue(jsonViewer: JsonViewer, filter: string) {
    if (!filter) {
        return;
    }
    
    let data = jsonViewer.getJSON();
    let filterArray = filter.split("/");

    if (filterArray[0] === jsonViewer.getRoot() || filterArray[0] === "") {
        filterArray.splice(0, 1);
        if (filterArray[0] === jsonViewer.getRoot()) {
            filterArray.splice(0, 1);
        }
    }

    if (filterArray[filterArray.length - 1] === "") {
        filterArray.splice(filterArray.length - 1, 1);
    }    

    filterArray.forEach((filter) => {
        data = data[filter];
    });
    
    if (typeof data === "object") {
        jsonViewer.setRoot(filterArray[filterArray.length - 1]);
    } else {
        jsonViewer.setRoot("");
        data = {
            [filterArray[filterArray.length - 1]]: data,
        };
    }

    if (!data) {
        jsonViewer.setRoot("Error");
        data = {
            404: "Data Not Found",
        };
    }

    jsonViewer.setJSON(data);
}