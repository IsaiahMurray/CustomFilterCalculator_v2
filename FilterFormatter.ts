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

