var _this = this;
var filter = {
    length: 10,
    width: 20,
    height: 5,
    orientation: "portrait",
    price: 50,
    getId: function () {
        return "".concat(_this.length, "x").concat(_this.width, "x").concat(_this.height);
    },
    getVerticalSplit: function () {
        return "".concat(_this.length / 2, "x").concat(_this.width, "x").concat(_this.height);
    },
    getHorizontalSplit: function () {
        return "".concat(_this.length, "x").concat(_this.width / 2, "x").concat(_this.height);
    },
};
console.log(filter.getVerticalSplit()); // Output: "5x20x5"
// let filters: Filter[] = [];
// async function loadFilters() {
//   const response = await fetch("filters.json");
//   filters = await response.json();
// }
// loadFilters();
console.log("Hi");
