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
  filters: string[]; // IDs of all filters used in the combination
  assemblyOrientation: "portrait" | "landscape";
  cost: number;
  trimArea: number; // Square inches of material trimmed
}

// Parse a size string like "15x42x1" into an object
const parseSize = (size: string): { length: number; width: number; height: number } => {
  const [length, width, height] = size.split("x").map(Number);
  return { length, width, height };
};

// Calculate the trim area
const calculateTrimArea = (combinedLength: number, combinedWidth: number, target: { length: number; width: number }): number => {
  const combinedArea = combinedLength * combinedWidth;
  const targetArea = target.length * target.width;
  return combinedArea - targetArea;
};

// Recursive function to find all valid combinations
const findCombinationsRecursive = (
  target: { length: number; width: number; height: number },
  filters: Filter[],
  usedFilters: Filter[] = [],
  orientation: "portrait" | "landscape" | null = null
): Combination[] => {
  const combinations: Combination[] = [];

  // Calculate the combined dimensions of the currently used filters
  const combinedLength = orientation === "landscape"
    ? usedFilters.reduce((sum, filter) => sum + filter.length, 0)
    : usedFilters[0]?.length || 0;

  const combinedWidth = orientation === "portrait"
    ? usedFilters.reduce((sum, filter) => sum + filter.width, 0)
    : usedFilters[0]?.width || 0;

  const combinedCost = usedFilters.reduce((sum, filter) => sum + filter.price, 0);

  // Check if the current combination meets the target size
  if (usedFilters.length > 0 && combinedLength >= target.length && combinedWidth >= target.width) {
    const trimArea = calculateTrimArea(combinedLength, combinedWidth, target);
    combinations.push({
      targetSize: `${target.length}x${target.width}x${target.height}`,
      filters: usedFilters.map((filter) => filter.filterID),
      assemblyOrientation: orientation || "portrait",
      cost: combinedCost,
      trimArea
    });
  }

  // Try adding each unused filter
  for (const filter of filters) {
    // Skip filters that don't match the height of the target
    if (filter.height !== target.height) continue;

    // Determine the orientation if not already set
    const newOrientation = orientation || filter.orientation;

    // Skip filters that don't align with the orientation
    if (newOrientation !== filter.orientation) continue;

    // Check if the filter can align with the combined size
    if (
      (newOrientation === "portrait" && combinedLength === filter.length) ||
      (newOrientation === "landscape" && combinedWidth === filter.width) ||
      usedFilters.length === 0 // Allow starting with any filter
    ) {
      // Recurse with this filter added to the combination
      const remainingFilters = filters.filter((f) => f !== filter);
      combinations.push(
        ...findCombinationsRecursive(target, remainingFilters, [...usedFilters, filter], newOrientation)
      );
    }
  }

  return combinations;
};

// Main function to find combinations
const findCombinations = (targetSize: string, filters: Filter[]): Combination[] => {
  const target = parseSize(targetSize);

  console.log("Target Size:", target);

  // Find all combinations recursively
  const combinations = findCombinationsRecursive(target, filters);

  // Handle cases where no combinations are found
  if (combinations.length === 0) {
    console.log("No valid combinations found for the target size:", targetSize);
    return [];
  }

  // Return up to 6 lowest-cost combinations
  return combinations.sort((a, b) => a.cost - b.cost).slice(0, 6);
};

// Read filters from filters.json
const filtersFilePath = path.resolve(__dirname, "filters.json");
const filters: Filter[] = JSON.parse(fs.readFileSync(filtersFilePath, "utf8"));

// Example usage
const targetSize = "15x60x1"; // Example: combining multiple filters for a large size
const results = findCombinations(targetSize, filters);

if (results.length === 0) {
  console.log(`No valid combinations could be found for target size ${targetSize}.`);
} else {
  console.log("Final Results:", results);
}
