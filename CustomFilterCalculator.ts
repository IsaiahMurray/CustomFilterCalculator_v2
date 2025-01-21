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

interface Combination {
  targetSize: string;
  filter1: string;
  filter2?: string;
  assemblyOrientation: "portrait" | "landscape";
  cost: number;
  trimArea: number; // Square inches of material trimmed
}

// Parse a size string like "15x42x1" into an object
const parseSize = (size: string): { length: number; width: number; height: number } => {
  const [length, width, height] = size.split("x").map(Number);
  return { length, width, height };
};

// Check if the target can fit within the filter (in any orientation)
const canCutDown = (filter: Filter, target: { length: number; width: number; height: number }): boolean => {
  return (
    filter.height === target.height &&
    ((filter.length >= target.length && filter.width >= target.width) || // Portrait
      (filter.length >= target.width && filter.width >= target.length)) // Landscape
  );
};

// Calculate the trim area
const calculateTrimArea = (combinedLength: number, combinedWidth: number, target: { length: number; width: number }): number => {
  const combinedArea = combinedLength * combinedWidth;
  const targetArea = target.length * target.width;
  return combinedArea - targetArea;
};

// Main function to find combinations
const findCombinations = (targetSize: string, filters: Filter[]): Combination[] => {
  const target = parseSize(targetSize);
  const combinations: Combination[] = [];

  console.log("Target Size:", target);

  // Step 1: Check single filters that can be cut down
  filters.forEach((filter) => {
    if (canCutDown(filter, target)) {
      const orientation = filter.length >= filter.width ? "portrait" : "landscape";
      const trimArea = calculateTrimArea(filter.length, filter.width, target);
      combinations.push({
        targetSize,
        filter1: filter.filterID,
        assemblyOrientation: orientation,
        cost: filter.price,
        trimArea
      });
    }
  });

  // Step 2: Check combinations of two filters
  for (let i = 0; i < filters.length; i++) {
    for (let j = i + 1; j < filters.length; j++) {
      const filter1 = filters[i];
      const filter2 = filters[j];

      // Filters must have the same height
      if (filter1.height === target.height && filter2.height === target.height) {
        // Portrait orientation: Matching lengths, sum widths
        if (filter1.length === filter2.length) {
          const combinedLength = filter1.length;
          const combinedWidth = filter1.width + filter2.width;

          if (combinedLength >= target.length && combinedWidth >= target.width) {
            const trimArea = calculateTrimArea(combinedLength, combinedWidth, target);
            const cost = filter1.price + filter2.price; // Sum of the two prices
            combinations.push({
              targetSize,
              filter1: filter1.filterID,
              filter2: filter2.filterID,
              assemblyOrientation: "portrait",
              cost,
              trimArea
            });
          }
        }

        // Landscape orientation: Matching widths, sum lengths
        if (filter1.width === filter2.width) {
          const combinedLength = filter1.length + filter2.length;
          const combinedWidth = filter1.width;

          if (combinedLength >= target.length && combinedWidth >= target.width) {
            const trimArea = calculateTrimArea(combinedLength, combinedWidth, target);
            const cost = filter1.price + filter2.price; // Sum of the two prices
            combinations.push({
              targetSize,
              filter1: filter1.filterID,
              filter2: filter2.filterID,
              assemblyOrientation: "landscape",
              cost,
              trimArea
            });
          }
        }
      }
    }
  }

  // Debugging: Log all combinations found
  console.log("All Combinations Found:", combinations);

  // Step 3: Handle cases where no combinations are found
  if (combinations.length === 0) {
    console.log("No valid combinations found for the target size:", targetSize);
    return [];
  }

  // Step 4: Return up to 6 lowest-cost combinations
  return combinations
    .sort((a, b) => a.cost - b.cost)
    .slice(0, 6);
};

// Read filters from filters.json
const filtersFilePath = path.resolve(__dirname, "filters.json");
const filters: Filter[] = JSON.parse(fs.readFileSync(filtersFilePath, "utf8"));

// Example usage
const targetSize = "15x42x1";
const results = findCombinations(targetSize, filters);
console.log("Final Results:", results);

if (results.length === 0) {
  console.log(`No valid combinations could be found for target size ${targetSize}.`);
} else {
  console.log("Final Results:", results);
}