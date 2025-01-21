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

// Function to process raw data from file
const processFilters = (filePath: string): void => {
  try {
    // Read the raw data file
    const rawData = fs.readFileSync(filePath, "utf8").trim().split("\n");

    // Parse raw data into JSON objects
    const filters: Filter[] = rawData.map((line) => {
      const [size, priceStr] = line.split(" $");
      const [length, width, height] = size.split(" X ").map(Number);
      const price = parseFloat(priceStr);
      const orientation = getOrientation(length, height);
      const filterID = `${length}.${width}.${height}`;
      
      return { length, width, height, orientation, price, filterID };
    });

    // Output the result to the console
    console.log(JSON.stringify(filters, null, 2));
  } catch (error) {
    console.error("Error processing filters:", error.message);
  }
};

// Path to the raw data file (replace with your file path)
const filePath = path.resolve(__dirname, "filters.txt");

// Process the file
processFilters(filePath);
