async function fetchFilters() {
    const response = await fetch('filters.json');
    return response.json();
}

function parseSize(sizeString) {
    const [length, width, height] = sizeString.split("x").map(Number);
    return { length, width, height };
}

function calculateTrimArea(combinedLength, combinedWidth, target) {
    const combinedArea = combinedLength * combinedWidth;
    const targetArea = target.length * target.width;
    return Math.max(combinedArea - targetArea, 0);
}

function canCutAndCombine(filter, target) {
    const targetLongSide = Math.max(target.length, target.width);
    const targetShortSide = Math.min(target.length, target.width);

    if (filter.length * 2 >= targetLongSide && filter.width / 2 >= targetShortSide) {
        return { possible: true, newSize: { length: filter.length * 2, width: filter.width / 2 }, count: 2 };
    }
    if (filter.width * 2 >= targetLongSide && filter.length / 2 >= targetShortSide) {
        return { possible: true, newSize: { length: filter.length / 2, width: filter.width * 2 }, count: 2 };
    }
    return null;
}

async function calculateFilters() {
    const targetSize = document.getElementById("targetSize").value;
    const quantity = parseInt(document.getElementById("quantity").value);

    if (!targetSize || isNaN(quantity) || quantity < 1) {
        alert("Please enter a valid target size and quantity.");
        return;
    }

    const target = parseSize(targetSize);
    const filters = await fetchFilters();
    const combinations = [];

    filters.forEach((filter) => {
        const canCombine = canCutAndCombine(filter, target);
        if (canCombine && canCombine.possible) {
            const { newSize, count } = canCombine;
            const totalFiltersNeeded = Math.ceil(quantity / count);
            const trimArea = calculateTrimArea(newSize.length, newSize.width, target) * totalFiltersNeeded;

            combinations.push({
                targetSize: `${target.length}x${target.width}x${target.height}`,
                quantity,
                filters: [filter.filterID],
                assemblyOrientation: filter.orientation,
                cost: filter.price * totalFiltersNeeded,
                trimArea,
                dimensionDetails: `Use ${totalFiltersNeeded}x ${filter.filterID}, cut in half and combine to make ${newSize.length}x${newSize.width}, then trim to target size`
            });
        }
    });

    displayResults(combinations);
    if (combinations.length > 0) drawVisualization(combinations[0]);
}

function displayResults(combinations) {
    const resultsBody = document.getElementById("resultsBody");
    resultsBody.innerHTML = "";

    if (combinations.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="7">❌ No valid combinations found.</td></tr>`;
        return;
    }

    combinations.sort((a, b) => a.cost - b.cost).slice(0, 6).forEach(combo => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${combo.targetSize}</td>
            <td>${combo.quantity}</td>
            <td>${combo.filters.join(", ")}</td>
            <td>${combo.assemblyOrientation}</td>
            <td>$${combo.cost.toFixed(2)}</td>
            <td>${combo.trimArea} sq in</td>
            <td>${combo.dimensionDetails}</td>
        `;
        resultsBody.appendChild(row);
    });
}

function drawVisualization(combo) {
    const canvas = document.getElementById("filterCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rectX = 50, rectY = 50, rectWidth = 400, rectHeight = 200;
    ctx.fillStyle = "#b3e0ff";
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

    ctx.strokeStyle = "red";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.strokeRect(rectX + rectWidth / 2, rectY, rectWidth / 2, rectHeight);

    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(rectX, rectY, 20, rectHeight);
    ctx.fillRect(rectX + rectWidth - 20, rectY, 20, rectHeight);

    ctx.fillStyle = "black";
    ctx.fillText(combo.dimensionDetails, rectX + 10, rectY + rectHeight + 20);
}

// Attach event listener when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calculateBtn").addEventListener("click", calculateFilters);
});
