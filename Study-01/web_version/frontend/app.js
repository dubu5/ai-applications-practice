// Created: 2026-10-11 14:35:00
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const recognizeBtn = document.getElementById('recognizeBtn');
const clearBtn = document.getElementById('clearBtn');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Initialize canvas
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const [x, y] = getMousePos(e);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    [lastX, lastY] = getTouchPos(touch);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const [x, y] = getTouchPos(touch);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
});

canvas.addEventListener('touchend', () => {
    isDrawing = false;
});

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
}

function getTouchPos(touch) {
    const rect = canvas.getBoundingClientRect();
    return [touch.clientX - rect.left, touch.clientY - rect.top];
}

recognizeBtn.addEventListener('click', async () => {
    const imageData = canvas.toDataURL('image/png');

    showLoading();

    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            throw new Error('Failed to recognize digit');
        }

        const result = await response.json();
        displayResult(result);
        hideLoading();
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
});

clearBtn.addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hideResult();
    hideError();
});

function displayResult(result) {
    const digit = result.digit;
    const confidence = result.confidence;
    const probabilities = result.probabilities;

    document.getElementById('digitResult').textContent = digit;
    document.getElementById('confidenceResult').textContent = confidence.toFixed(2);

    const probContainer = document.getElementById('probabilitiesContainer');
    probContainer.innerHTML = '';

    probabilities.forEach((prob, index) => {
        const percentage = (prob * 100).toFixed(2);
        const item = document.createElement('div');
        item.className = 'prob-item';
        item.innerHTML = `
            <span class="prob-label">${index}</span>
            <div class="prob-bar">
                <div class="prob-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="prob-value">${percentage}%</span>
        `;
        probContainer.appendChild(item);
    });

    showResult();
}

function showResult() {
    document.getElementById('resultContainer').style.display = 'block';
}

function hideResult() {
    document.getElementById('resultContainer').style.display = 'none';
}

function showLoading() {
    document.getElementById('loadingContainer').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingContainer').style.display = 'none';
}

function showError(message) {
    document.getElementById('errorMessage').textContent = 'Error: ' + message;
    document.getElementById('errorContainer').style.display = 'block';
}

function hideError() {
    document.getElementById('errorContainer').style.display = 'none';
}
