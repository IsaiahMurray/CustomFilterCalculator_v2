interface IFilter {
  length: number;
  width: number;
  height: number;
  orientation: string;
  price: number;
}

interface Filter extends IFilter {
  getId: () => string;
  getVerticalSplit: () => string;
  getHorizontalSplit: () => string;

}

const filter: Filter = {
  length: 10,
  width: 20,
  height: 5,
  orientation: "portrait",
  price: 50,
  getId: () => {
    return `${this.length}x${this.width}x${this.height}`;
  },
  getVerticalSplit: () => {
    return `${this.length / 2}x${this.width}x${this.height}`;
  },
  getHorizontalSplit: () => {
    return `${this.length}x${this.width / 2}x${this.height}`;
  },
};

console.log(filter.getVerticalSplit()); // Output: "5x20x5"

// let filters: Filter[] = [];

// async function loadFilters() {
//   const response = await fetch("filters.json");
//   filters = await response.json();
// }

// loadFilters();

console.log("Hi")