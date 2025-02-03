type Filter = {
    length: number;
    width: number;
    height: number;
    orientation: string;
    price: number;
    filterID: string;
  };

  let filters: Filter[] = [];

async function loadFilters() {
  const response = await fetch('filters.json');
  filters = await response.json();
}

loadFilters();