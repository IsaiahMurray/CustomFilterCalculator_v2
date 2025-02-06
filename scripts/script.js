// Updated script.js to display only file names in results
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("filterForm");
    const resultsContainer = document.getElementById("results");
    let canvasContainer = document.getElementById("canvasContainer");

    if (!form || !resultsContainer) {
        console.error("Missing required elements in the DOM.");
        return;
    }

    if (!canvasContainer) {
        canvasContainer = document.createElement("div");
        canvasContainer.id = "canvasContainer";
        document.body.appendChild(canvasContainer);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const inputLength = parseFloat(document.getElementById("length").value);
        const inputWidth = parseFloat(document.getElementById("width").value);
        const inputHeight = parseFloat(document.getElementById("height").value);

        if (isNaN(inputLength) || isNaN(inputWidth) || isNaN(inputHeight)) return;

        const files = await loadFileList();
        let allMatches = {};

        for (let file of files) {
            const data = await fetchFileData(file);
            const matches = findMatchingFilters(data, inputLength, inputWidth, inputHeight);
            if (matches.length > 0) {
                allMatches[file] = matches;
            }
        }

        displayResults(allMatches, inputLength, inputWidth, inputHeight);
    });

    async function loadFileList() {
        try {
            const response = await fetch("data/files.json");
            const { files } = await response.json();
            return files;
        } catch (error) {
            console.error("Error loading file list:", error);
            return [];
        }
    }

    async function fetchFileData(file) {
        try {
            const response = await fetch(file);
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            return [];
        }
    }

    function findMatchingFilters(filters, length, width, height) {
        return filters.filter(f => f.height === height && (
            (length <= f.length && width <= f.width) ||
            (length <= f.width && width <= f.length)
        ));
    }

    function displayResults(groupedResults, inputLength, inputWidth, inputHeight) {
        resultsContainer.innerHTML = "";
        canvasContainer.innerHTML = "";

        for (const file in groupedResults) {
            const fileName = file.split("/").pop().replace(".json", "").toUpperCase();
            const section = document.createElement("div");
            section.classList.add("result-section");
            section.innerHTML = `<h3>${fileName}</h3><ul></ul>`;
            const listElement = section.querySelector("ul");

            groupedResults[file].forEach((filter, index) => {
                const li = document.createElement("li");
                li.innerHTML = `<input type='radio' name='filterSelection' value='${index}'> ${generateMessage(file, filter, inputLength, inputWidth, inputHeight)}`;
                listElement.appendChild(li);
            });

            section.addEventListener("change", (event) => {
                const selectedIndex = event.target.value;
                addCanvasForFilter(file, groupedResults[file][selectedIndex], inputLength, inputWidth);
            });

            resultsContainer.appendChild(section);
            addCanvasForFilter(file, groupedResults[file][0], inputLength, inputWidth);
        }
    }

    function generateMessage(file, filter, inputLength, inputWidth, inputHeight) {
        if (file.includes("SplitFilters")) {
            return `Cut a ${filter.originalFilter} to make a ${filter.filterID}, then cut down to make a ${inputLength}x${inputWidth}x${inputHeight} \n Price: ${filter.price}`;
        }
        if (file.includes("CombinedFilters")) {
            return `Cut a ${filter.originalFilter} and combine to make a ${filter.filterID}, then cut down to make a ${inputLength}x${inputWidth}x${inputHeight} \n Price: ${filter.price}`;
        }
        if (file.includes("filters.json")) {
            return `Cut a ${filter.filterID} down to make a ${inputLength}x${inputWidth}x${inputHeight} \n Price: ${filter.price}`;
        }
        return `Use a ${filter.filterOne} and a ${filter.filterTwo} to make a ${filter.filterID} then cut down to make a ${inputLength}x${inputWidth}x${inputHeight} filter. \n Price: ${filter.price}`;
    }

    function addCanvasForFilter(file, filter, inputLength, inputWidth) {
        canvasContainer.innerHTML = "";
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 200;
        canvasContainer.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "blue";
        ctx.fillRect(50, 50, inputLength * 10, inputWidth * 10);

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(50, 50, filter.length * 10, filter.width * 10);
    }
});
