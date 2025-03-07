const fs = require('fs');
const json2csv = require('json2csv').parse;

function transformFilters(filters) {
    const formattedFilters = filters.map(filter => {
        return {
            ...filter,
            filter_id: filter.filterID,
            original_filter: filter.originalFilter.replace(/\./g, 'x'),
        };
    }).map(({ filterID, originalFilter, ...rest }) => rest);
    const csv = json2csv(formattedFilters);

    // Save to file
    fs.writeFileSync('triple_split.csv', csv);
}

// Example usage:
const filters = [
    {
      "length": 4,
      "width": 48,
      "height": 1,
      "orientation": "portrait",
      "price": 3.12,
      "filterID": "4x48x1",
      "originalFilterID": "12x48x1",
      "qty": 3
    },
    {
      "length": 4,
      "width": 60,
      "height": 1,
      "orientation": "portrait",
      "price": 4.41,
      "filterID": "4x60x1",
      "originalFilterID": "12x60x1",
      "qty": 3
    },
    {
      "length": 4,
      "width": 50,
      "height": 1,
      "orientation": "portrait",
      "price": 4.16,
      "filterID": "4x50x1",
      "originalFilterID": "12.5x50x1",
      "qty": 3
    }
  ]
// transformFilters(filters);

const write2csv = () => {
    const data = [
        {
          "length": 4,
          "width": 48,
          "height": 1,
          "orientation": "portrait",
          "price": 3.12,
          "filter_id": "4x48x1",
          "original_filter_id": "12x48x1",
          "qty": 3
        },
        {
          "length": 4,
          "width": 60,
          "height": 1,
          "orientation": "portrait",
          "price": 4.41,
          "filter_id": "4x60x1",
          "original_filter_id": "12x60x1",
          "qty": 3
        },
        {
          "length": 4,
          "width": 50,
          "height": 1,
          "orientation": "portrait",
          "price": 4.16,
          "filter_id": "4x50x1",
          "original_filter_id": "12.5x50x1",
          "qty": 3
        }
      ];
    const csv = json2csv(data);
    fs.writeFileSync('triple_split.csv', csv);
}
write2csv();