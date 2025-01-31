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
  quantity: number;
  filters: string[]; // IDs of all filters used in the combination
  assemblyOrientation: "portrait" | "landscape";
  cost: number;
  trimArea: number; // Square inches of material trimmed
  dimensionDetails: string; // Explanation of how the filters contribute
}

// Parse a size string like "9.25x47.25x1" into an object
const parseSize = (size: string): { length: number; width: number; height: number } => {
  const [length, width, height] = size.split("x").map(Number);
  return { length, width, height };
};

// Calculate the trim area
const calculateTrimArea = (combinedLength: number, combinedWidth: number, target: { length: number; width: number }): number => {
  const combinedArea = combinedLength * combinedWidth;
  const targetArea = target.length * target.width;
  return Math.max(combinedArea - targetArea, 0);
};

// Check if a single filter can be cut and combined to form the target filter
const canCutAndCombine = (filter: Filter, target: { length: number; width: number }): { possible: boolean, newSize: { length: number, width: number }, count: number } | null => {
  const targetLongSide = Math.max(target.length, target.width);
  const targetShortSide = Math.min(target.length, target.width);

  // If we cut the filter along its length and double it, does it match or exceed the longest target side?
  // And does its width, when divided by 2, match or exceed the short side of the target?
  if (filter.length * 2 >= targetLongSide && filter.width / 2 >= targetShortSide) {
    return {
      possible: true,
      newSize: { length: filter.length * 2, width: filter.width / 2 },
      count: 2
    };
  }

  // Try the opposite: cut the filter along its width, double it, and compare.
  if (filter.width * 2 >= targetLongSide && filter.length / 2 >= targetShortSide) {
    return {
      possible: true,
      newSize: { length: filter.length / 2, width: filter.width * 2 },
      count: 2
    };
  }

  return null;
};

// Find valid filter combinations including cut & combine
const findCombinations = (targetSize: string, quantity: number, filters: Filter[]): Combination[] => {
  const target = parseSize(targetSize);
  const combinations: Combination[] = [];

  console.log("🔍 Target Size:", target, "Quantity:", quantity);

  filters.forEach((filter) => {
    const canCombine = canCutAndCombine(filter, target);
    if (canCombine && canCombine.possible) {
      const { newSize, count } = canCombine;
      const totalFiltersNeeded = Math.ceil(quantity / count);
      const trimArea = calculateTrimArea(newSize.length, newSize.width, target) * totalFiltersNeeded;

      combinations.push({
        targetSize: `${target.length}x${target.width}x${target.height}`,
        quantity,
        filters: [filter.filterID],
        assemblyOrientation: filter.orientation,
        cost: filter.price * totalFiltersNeeded,
        trimArea,
        dimensionDetails: `Use ${totalFiltersNeeded}x ${filter.filterID}, cut in half and combine to make ${newSize.length}x${newSize.width}, then trim to target size`
      });
    }
  });

  if (combinations.length === 0) {
    console.log(`❌ No valid combinations found for ${quantity}x ${targetSize}`);
    return [];
  }

  return combinations.sort((a, b) => a.cost - b.cost).slice(0, 6);
};

// Read filters from filters.json
const filtersFilePath = path.resolve(__dirname, "filters.json");
const filters: Filter[] = JSON.parse(fs.readFileSync(filtersFilePath, "utf8"));

// Example usage
const targetSize = "9.25x47.25x1"; // Example: looking for 10 filters of this size
const quantity = 10;
const results = findCombinations(targetSize, quantity, filters);

if (results.length === 0) {
  console.log(`❌ No valid combinations could be found for ${quantity} of size ${targetSize}.`);
} else {
  console.log("✅ Final Results:", results);
}
