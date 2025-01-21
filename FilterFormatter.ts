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

