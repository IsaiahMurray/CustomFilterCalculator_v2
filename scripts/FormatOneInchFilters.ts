import * as fs from "fs";
import * as path from "path";

interface Filter {
  length: number;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  price: number;
  filterID: string;
}

// Function to determine orientation
const getOrientation = (length: number, height: number): "portrait" | "landscape" => {
  return length >= 20 && height >= 30 ? "landscape" : "portrait";
};

// Function to process raw data from file and write JSON output
const processFilters = (inputFilePath: string, outputFilePath: string): void => {
  try {
    // Read the raw data file
    const rawData = fs.readFileSync(inputFilePath, "utf8").trim().split("\n");

    // Parse raw data into JSON objects
    const filters: Filter[] = [];
    rawData.forEach((line, index) => {
      try {
        const [size, priceStr] = line.split(" $");
        if (!size || !priceStr) throw new Error("Malformed line");
        
        const [length, width, height] = size.split(" X ").map(Number);
        if (isNaN(length) || isNaN(width) || isNaN(height)) throw new Error("Invalid dimensions");
        
        const price = parseFloat(priceStr);
        if (isNaN(price)) throw new Error("Invalid price");

        const orientation = getOrientation(length, height);
        const filterID = `${length}.${width}.${height}`;

        filters.push({ length, width, height, orientation, price, filterID });
      } catch (err) {
        console.warn(`Skipping line ${index + 1}: ${line} (${err.message})`);
      }
    });

    // Write the JSON output to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(filters, null, 2));
    console.log(`Processed ${filters.length} filters and saved to ${outputFilePath}`);
  } catch (error) {
    console.error("Error processing filters:", error.message);
  }
};

// Paths to the input and output files
const inputFilePath = path.resolve(__dirname, "1Inchfilters.txt");
const outputFilePath = path.resolve(__dirname, "filters.json");

// Process the file
processFilters(inputFilePath, outputFilePath);
