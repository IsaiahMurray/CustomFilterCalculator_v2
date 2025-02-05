"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// Function to determine orientation
var getOrientation = function (length, height) {
    return length >= 20 && height >= 30 ? "landscape" : "portrait";
};
// Function to process raw data from file and write JSON output
var processFilters = function (inputFilePath, outputFilePath) {
    try {
        // Read the raw data file
        var rawData = fs.readFileSync(inputFilePath, "utf8").trim().split("\n");
        // Parse raw data into JSON objects
        var filters_1 = [];
        rawData.forEach(function (line, index) {
            try {
                var _a = line.split(" $"), size = _a[0], priceStr = _a[1];
                if (!size || !priceStr)
                    throw new Error("Malformed line");
                var _b = size.split(" X ").map(Number), length_1 = _b[0], width = _b[1], height = _b[2];
                if (isNaN(length_1) || isNaN(width) || isNaN(height))
                    throw new Error("Invalid dimensions");
                var price = parseFloat(priceStr);
                if (isNaN(price))
                    throw new Error("Invalid price");
                var orientation_1 = getOrientation(length_1, height);
                var filterID = "".concat(length_1, ".").concat(width, ".").concat(height);
                filters_1.push({ length: length_1, width: width, height: height, orientation: orientation_1, price: price, filterID: filterID });
            }
            catch (err) {
                console.warn("Skipping line ".concat(index + 1, ": ").concat(line, " (").concat(err.message, ")"));
            }
        });
        // Write the JSON output to a file
        fs.writeFileSync(outputFilePath, JSON.stringify(filters_1, null, 2));
        console.log("Processed ".concat(filters_1.length, " filters and saved to ").concat(outputFilePath));
    }
    catch (error) {
        console.error("Error processing filters:", error.message);
    }
};
// Paths to the input and output files
var inputFilePath = path.resolve(__dirname, "1Inchfilters.txt");
var outputFilePath = path.resolve(__dirname, "filters.json");
// Process the file
processFilters(inputFilePath, outputFilePath);
