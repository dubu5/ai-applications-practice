# CLAUDE.md

# Created: 2026-10-11 14:30:00

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web-based handwritten digit recognition application. Users draw digits (0-9) on a canvas in their browser, and a trained CNN model predicts the digit with confidence scores. Built with a frontend (HTML/CSS/JavaScript) and backend API (Flask/FastAPI or Node.js).

## Architecture Overview

The web version follows a client-server architecture:

### Frontend
- HTML5 Canvas API for drawing digit input
- JavaScript for canvas interaction and API calls
- CSS for styling and responsive UI
- Sends canvas image data to the backend for prediction

### Backend
- REST API endpoint that accepts canvas image data
- Loads pre-trained MNIST model
- Preprocesses the image and runs inference
- Returns predicted digit and confidence score
- Handles model loading and caching for performance

### Model
- Pre-trained 3-layer CNN on MNIST dataset
- Loaded once at server startup to avoid retraining on each request
- Same architecture as desktop version (Conv2D layers, MaxPooling, Dense layers)

## Project Structure

- **frontend/** — HTML, CSS, JavaScript files
  - `index.html` — Main page with canvas and UI
  - `style.css` — Styling
  - `app.js` — Canvas interaction and API communication
- **backend/** — API server (choose framework: Flask, FastAPI, Express, etc.)
  - `app.py` (or `server.js`) — Main server file
  - `model.py` (or `model.js`) — Model loading and inference logic
  - `requirements.txt` (or `package.json`) — Dependencies
- **CLAUDE.md** — This file

## Development Setup

**Prerequisites:**
- Python 3.8+ (if using Python backend) or Node.js 14+ (if using Node.js backend)
- Required packages: `tensorflow`, `pillow`, `numpy`, `flask` (or equivalent for chosen framework)

**Installation:**
```bash
# Backend setup (Python example)
cd backend
pip install -r requirements.txt

# Frontend is static, served by backend
```

**Running:**
```bash
cd backend
python app.py
# Server runs on http://localhost:5000 (or configured port)
# Open browser and navigate to http://localhost:5000
```

## Key Design Decisions

- **Model pre-training** — Train the model once and save weights, load at server startup (no retraining per request)
- **Stateless API** — Each prediction request is independent; no session state
- **Image preprocessing on backend** — Ensures consistent preprocessing between training and inference
- **CORS handling** — Allow frontend to call backend API from same/different domains

## Common Development Tasks

**Modify frontend canvas** — Edit `index.html` and `app.js` to change canvas size, colors, or brush width.

**Change backend framework** — Swap Flask/FastAPI/Express, but keep the model inference logic in a separate module.

**Save/Load pre-trained model** — Use `model.save()` and `keras.models.load_model()` to avoid retraining on startup.

**Add model validation on startup** — Check model accuracy on MNIST test set before accepting requests.

**Deploy to production** — Use WSGI server (Gunicorn) or containerize with Docker for scaling.

## Notes

- The frontend canvas is larger than MNIST (typically 280×280), so the backend must preprocess to 28×28
- Model loading at startup can take several seconds; consider showing a loading spinner
- In production, run backend and frontend separately (CDN for static files, cloud service for API)
- Add error handling for network failures and invalid input on the frontend
