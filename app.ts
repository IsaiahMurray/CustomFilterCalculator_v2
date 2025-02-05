import * as fs from "fs";

interface Filter {
  length: number;
  width: number;
  height: number;
  orientation: string;
  price: number;
  filterID: string;
}

interface SplitFilter extends Filter {
  originalFilterID: string;
  qty: number;
}

function splitFilters(inputFile: string, outputFile: string): void {
  const data: Filter[] = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  let splitData: SplitFilter[] = [];

  // First split by length
  data.forEach((filter) => {
    let newLength = filter.length / 2;
    let newWidth = filter.width;
    let newOrientation = filter.orientation;

    if (newLength < 4) return; // Skip if new length is less than 4 inches

    if (newLength > newWidth) {
      [newWidth, newLength] = [newLength, newWidth];
      newOrientation = newOrientation === "portrait" ? "landscape" : "portrait";
    }

    splitData.push({
      length: newLength,
      width: newWidth,
      height: filter.height,
      orientation: newOrientation,
      price: filter.price,
      filterID: `${newLength}x${newWidth}x${filter.height}`,
      originalFilterID: filter.filterID,
      qty: 2,
    });
  });

  // Then split by width
  splitData = splitData
    .flatMap((filter) => {
      let newWidth = filter.width / 2;
      let newLength = filter.length;
      let newOrientation = filter.orientation;

      if (newWidth < 4) return [filter]; // Skip if new width is less than 4 inches

      if (newLength > newWidth) {
        [newWidth, newLength] = [newLength, newWidth];
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
          filterID: `${newLength}x${newWidth}x${filter.height}`,
          originalFilterID: filter.originalFilterID,
          qty: 2,
        },
      ];
    })
    .filter(Boolean); // Remove any undefined entries

  // Remove duplicates
  const uniqueFilters = new Map();
  splitData.forEach((filter) => {
    uniqueFilters.set(filter.filterID, filter);
  });

  fs.writeFileSync(
    outputFile,
    JSON.stringify(Array.from(uniqueFilters.values()), null, 2)
  );
  console.log(`File saved as ${outputFile}`);
}

function splitByThree(inputFile: string, outputFile: string): void {
  const data: Filter[] = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  let splitData: SplitFilter[] = [];

  data.forEach((filter) => {
    let newLength = filter.length / 3;
    if (newLength < 4) return;

    for (let i = 0; i < 3; i++) {
      splitData.push({
        length: newLength,
        width: filter.width,
        height: filter.height,
        orientation: filter.orientation,
        price: filter.price,
        filterID: `${newLength}x${filter.width}x${filter.height}`,
        originalFilterID: filter.filterID,
        qty: 3,
      });
    }
  });

  fs.writeFileSync(outputFile, JSON.stringify(splitData, null, 2));
}

function splitByFour(inputFile: string, outputFile: string): void {
  const data: Filter[] = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  let splitData: SplitFilter[] = [];

  data.forEach((filter) => {
    let newLength = filter.length / 4;
    if (newLength < 4) return;

    for (let i = 0; i < 4; i++) {
      splitData.push({
        length: newLength,
        width: filter.width,
        height: filter.height,
        orientation: filter.orientation,
        price: filter.price,
        filterID: `${newLength}x${filter.width}x${filter.height}`,
        originalFilterID: filter.filterID,
        qty: 4,
      });
    }
  });

  fs.writeFileSync(outputFile, JSON.stringify(splitData, null, 2));
}

function splitCross(inputFile: string, outputFile: string): void {
  const data: Filter[] = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  let splitData: SplitFilter[] = [];

  data.forEach((filter) => {
    let newLength = filter.length / 2;
    let newWidth = filter.width / 2;

    if (newLength < 4 || newWidth < 4) return;

    for (let i = 0; i < 4; i++) {
      splitData.push({
        length: newLength,
        width: newWidth,
        height: filter.height,
        orientation: filter.orientation,
        price: filter.price,
        filterID: `${newLength}x${newWidth}x${filter.height}`,
        originalFilterID: filter.filterID,
        qty: 4,
      });
    }
  });

  fs.writeFileSync(outputFile, JSON.stringify(splitData, null, 2));
}
splitFilters("filters1Inch.json", "splitFilters1Inch.json");
splitByThree("filters1Inch.json", "triSplitFilters1Inch.json");
splitByFour("filters1Inch.json", "quadSplitFilters1Inch.json");
splitCross("filters1Inch.json", "crossSplitFilters1Inch.json");
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
