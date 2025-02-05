document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("filterForm");
    const resultsContainer = document.getElementById("results");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 400;

    let allMatches = {}; // Store matches grouped by file
    let currentPages = {}; // Track pagination per file

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const inputLength = parseFloat(document.getElementById("length").value);
        const inputWidth = parseFloat(document.getElementById("width").value);
        const inputHeight = parseFloat(document.getElementById("height").value);

        if (isNaN(inputLength) || isNaN(inputWidth) || isNaN(inputHeight)) return;

        const files = await loadFileList();
        allMatches = {};

        for (let file of files) {
            const data = await fetchFileData(file);
            const matches = findMatchingFilters(data, inputLength, inputWidth, inputHeight);
            if (matches.length > 0) {
                allMatches[file] = matches;
            }
        }

        displayResults(allMatches);

        const firstFile = Object.keys(allMatches)[0];
        if (firstFile && allMatches[firstFile].length > 0) {
            drawCanvas(inputLength, inputWidth, allMatches[firstFile][0]); // Draw first match
        }
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
        return filters
            .filter(f =>
                f.height === height &&
                (
                    (length <= f.length && width <= f.width) ||
                    (length <= f.width && width <= f.length)
                )
            )
            .sort((a, b) => a.price - b.price);
    }

    function displayResults(groupedResults) {
        resultsContainer.innerHTML = "";
        currentPages = {};

        for (const file in groupedResults) {
            currentPages[file] = 1;
            const section = document.createElement("div");
            section.classList.add("result-section");
            section.innerHTML = `
                <h3>${file.replace("data/", "").replace(".json", "").toUpperCase()}</h3>
                <ul id="list-${file}"></ul>
                <div class="pagination">
                    <button id="prev-${file}" disabled>Prev</button>
                    <span id="page-${file}">1</span>
                    <button id="next-${file}">Next</button>
                </div>
            `;
            resultsContainer.appendChild(section);
            updatePagination(file);
        }
    }

    function updatePagination(file) {
        const resultsPerPage = 5;
        const matches = allMatches[file] || [];
        const totalPages = Math.ceil(matches.length / resultsPerPage);
        const currentPage = currentPages[file];

        const listElement = document.getElementById(`list-${file}`);
        listElement.innerHTML = "";

        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, matches.length);

        for (let i = startIndex; i < endIndex; i++) {
            const filter = matches[i];
            const li = document.createElement("li");
            li.innerHTML = `
                <input type="radio" name="filterSelect-${file}" value="${i}" ${i === 0 ? "checked" : ""}>
                <label>Size: ${filter.length}x${filter.width}x${filter.height}, Price: $${filter.price}</label>
            `;
            listElement.appendChild(li);
        }

        document.querySelectorAll(`input[name="filterSelect-${file}"]`).forEach(radio => {
            radio.addEventListener("change", (event) => {
                const selectedIndex = parseInt(event.target.value);
                drawCanvas(
                    parseFloat(document.getElementById("length").value),
                    parseFloat(document.getElementById("width").value),
                    matches[selectedIndex]
                );
            });
        });

        document.getElementById(`prev-${file}`).disabled = currentPage === 1;
        document.getElementById(`next-${file}`).disabled = currentPage === totalPages;
        document.getElementById(`page-${file}`).textContent = `${currentPage} / ${totalPages}`;

        document.getElementById(`prev-${file}`).onclick = () => {
            if (currentPages[file] > 1) {
                currentPages[file]--;
                updatePagination(file);
            }
        };

        document.getElementById(`next-${file}`).onclick = () => {
            if (currentPages[file] < totalPages) {
                currentPages[file]++;
                updatePagination(file);
            }
        };
    }

    function drawCanvas(inputLength, inputWidth, selectedFilter) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!selectedFilter) return;

        const scale = 10;
        ctx.fillStyle = "blue"; // User requested size
        ctx.fillRect(50, 50, inputLength * scale, inputWidth * scale);

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Selected filter
        ctx.fillRect(50, 50, selectedFilter.length * scale, selectedFilter.width * scale);
    }
});
