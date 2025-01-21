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

// Read filters from filters.json
const filtersFilePath = path.resolve(__dirname, "filters.json");
const filters: Filter[] = JSON.parse(fs.readFileSync(filtersFilePath, "utf8"));

