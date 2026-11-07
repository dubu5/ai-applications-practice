# CLAUDE.md

# Created: 2026-10-11 14:30:00

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A handwritten digit recognition application built with Python and tkinter GUI. Users can draw digits (0-9) on a canvas, and a trained CNN model predicts the digit with confidence scores. The model is trained on the MNIST dataset at startup.

## How to Run

**Prerequisites:**
- Python 3.8+
- Required packages: `tensorflow`, `pillow`, `numpy`, `tkinter` (usually comes with Python)

**Installation:**
```bash
pip install tensorflow pillow numpy
```

**Running the application:**
```bash
python digit_recognition.py
```

Or use the provided batch file (Windows):
```
Run_Digit_Recognition.bat
```

**Note:** First run trains the model on MNIST (takes ~1 minute). Subsequent runs will use the trained model.

## Project Structure

- **digit_recognition.py** — Main application file containing the `DigitRecognitionApp` class and model training logic
- **CLAUDE.md** — This file

## Architecture

The application is a single-file GUI application with integrated ML. Key components:

### DigitRecognitionApp Class
- **`__init__`** — Initializes the GUI (canvas for drawing, buttons, labels) and trains the model
- **`build_and_load_model()`** — Loads MNIST dataset, builds a 3-layer CNN, trains for 5 epochs
- **Canvas drawing methods** (`start_draw`, `draw`, `end_draw`) — Handles mouse events to capture user input
- **`preprocess_image()`** — Converts the 280×280 drawn image to 28×28 MNIST format (invert, resize, normalize)
- **`recognize_digit()`** — Runs inference and displays predicted digit and confidence
- **`clear_canvas()`** — Resets canvas and labels

### Model Architecture
A 3-layer CNN trained on MNIST:
- Conv2D (32 filters) → MaxPool → Conv2D (64 filters) → MaxPool → Conv2D (64 filters) → Flatten
- Dense (64, ReLU) → Dropout (0.5) → Dense (10, softmax)
- Trained for 5 epochs with 128 batch size, 10% validation split

## Key Libraries

- **TensorFlow/Keras** — Deep learning framework for model training and inference
- **PIL (Pillow)** — Image processing (drawing, resizing, normalization)
- **NumPy** — Array operations and data transformation
- **tkinter** — Cross-platform GUI toolkit for canvas and buttons

## Common Development Tasks

**Modify model architecture** — Edit `build_and_load_model()` to change layer counts, filter sizes, or epochs.

**Change canvas size** — Adjust the `width` and `height` parameters in the Canvas creation, and update the preprocessing in `preprocess_image()` if needed.

**Improve UI** — Modify button styling, layout, or add new controls in `__init__`.

**Debug predictions** — Add `print()` statements in `recognize_digit()` to log intermediate values or save drawn images to disk before prediction.

## Notes

- The model trains on app startup; training is blocking and will freeze the GUI. For production, train asynchronously.
- The drawn canvas is 280×280 but resized to 28×28 (MNIST standard) for prediction.
- Images are inverted during preprocessing so that the drawn black digit on white background becomes white on black (MNIST convention).
