"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
function splitFilters(inputFile, outputFile) {
    var data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
    var splitData = [];
    // First split by length
    data.forEach(function (filter) {
        var _a;
        var newLength = filter.length / 2;
        var newWidth = filter.width;
        var newOrientation = filter.orientation;
        if (newLength < 4)
            return; // Skip if new length is less than 4 inches
        if (newLength > newWidth) {
            _a = [newLength, newWidth], newWidth = _a[0], newLength = _a[1];
            newOrientation = newOrientation === "portrait" ? "landscape" : "portrait";
        }
        splitData.push({
            length: newLength,
            width: newWidth,
            height: filter.height,
            orientation: newOrientation,
            price: filter.price,
            filterID: "".concat(newLength, "x").concat(newWidth, "x").concat(filter.height),
            originalFilterID: filter.filterID,
            qty: 2,
        });
    });
    // Then split by width
    splitData = splitData
        .flatMap(function (filter) {
        var _a;
        var newWidth = filter.width / 2;
        var newLength = filter.length;
        var newOrientation = filter.orientation;
        if (newWidth < 4)
            return [filter]; // Skip if new width is less than 4 inches
        if (newLength > newWidth) {
            _a = [newLength, newWidth], newWidth = _a[0], newLength = _a[1];
            newOrientation =
                newOrientation === "portrait" ? "landscape" : "portrait";
        }
        return [
            filter,
            {
                length: newLength,
                width: newWidth,
                height: filter.height,
                orientation: newOrientation,
                price: filter.price,
                filterID: "".concat(newLength, "x").concat(newWidth, "x").concat(filter.height),
                originalFilterID: filter.originalFilterID,
                qty: 2,
            },
        ];
    })
        .filter(Boolean); // Remove any undefined entries
    // Remove duplicates
    var uniqueFilters = new Map();
    splitData.forEach(function (filter) {
        uniqueFilters.set(filter.filterID, filter);
    });
    fs.writeFileSync(outputFile, JSON.stringify(Array.from(uniqueFilters.values()), null, 2));
    console.log("File saved as ".concat(outputFile));
}
splitFilters("filters1Inch.json", "splitFilters1Inch.json");
/* Files
! filters.json
 {
    "length": 10,
    "width": 10,
    "height": 1,
    "orientation": "portrait",
    "price": 2.4,
    "filterID": "10x10x1"
  },

! splitFilters.json
 {
    "length": 5,
    "width": 10,
    "height": 1,
    "orientation": "portrait",
    "price": 2.4,
    "filterID": "5.10.1"
    "originalFilterID": "10x10x1"
    "qty": 2
  },
! triSplitFilters.json
{
    "length": 10,
    "width": 16,
    "height": 1,
    "orientation": "horizontal",
    "price": 3.79,
    "filterID": "10x16x1"
    "originalFilterID": "16x30x1"
    "qty": 3
  },
  {
    "length": 10,
    "width": 16,
    "height": 1,
    "orientation": "portrait",
    "price": 3.79,
    "filterID": "5.33x30x1"
    "originalFilterID": "16x30x1"
    "qty": 3
  },

! quadSplitFilters.json
{
    "length": 5,
    "width": 5,
    "height": 1,
    "orientation": "portrait",
    "price": 3.81,
    "filterID": "5x5x1"
    "originalFilterID": "20x20x1"
    "qty": 4
  },

*/
