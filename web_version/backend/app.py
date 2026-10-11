# Created: 2026-10-11 14:35:00
import os
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

model = None

def build_and_load_model():
    """Build and train a CNN model using MNIST dataset - matching desktop version."""
    global model

    print("Loading MNIST dataset...")
    try:
        import tensorflow as tf
        from tensorflow import keras

        (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

        # Normalize data
        x_train = x_train.astype('float32') / 255.0
        x_test = x_test.astype('float32') / 255.0

        # Reshape data
        x_train = x_train.reshape(-1, 28, 28, 1)
        x_test = x_test.reshape(-1, 28, 28, 1)

        # Convert labels to one-hot
        y_train = keras.utils.to_categorical(y_train, 10)
        y_test = keras.utils.to_categorical(y_test, 10)

        # Build model - same as desktop
        model = keras.Sequential([
            keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Conv2D(64, (3, 3), activation='relu'),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Conv2D(64, (3, 3), activation='relu'),
            keras.layers.Flatten(),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.5),
            keras.layers.Dense(10, activation='softmax')
        ])

        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        print("Training model... This may take a minute...")

        # Train model with fewer epochs for faster training
        model.fit(
            x_train, y_train,
            epochs=3,
            batch_size=128,
            validation_split=0.1,
            verbose=1
        )

        # Evaluate model
        test_loss, test_accuracy = model.evaluate(x_test, y_test, verbose=0)
        print(f"Test accuracy: {test_accuracy * 100:.2f}%")

    except ImportError:
        print("ERROR: TensorFlow not installed")
        raise

def preprocess_image(image_data):
    """Convert canvas image to MNIST format - EXACTLY matching desktop version."""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        img = Image.open(BytesIO(image_bytes))

        # Convert to grayscale if needed
        if img.mode != 'L':
            img = img.convert('L')

        # Convert PIL image to numpy array
        img_array = np.array(img)

        # Invert (make background white, digit black) - SAME AS DESKTOP
        img_array = 255 - img_array

        # Resize to 28x28 - SAME AS DESKTOP
        img_pil = Image.fromarray(img_array)
        img_pil = img_pil.resize((28, 28), Image.Resampling.LANCZOS)

        # Convert to numpy array and normalize - SAME AS DESKTOP
        img_array = np.array(img_pil).astype('float32') / 255.0
        img_array = img_array.reshape(1, 28, 28, 1)

        return img_array

    except Exception as e:
        print(f"Preprocessing error: {e}")
        raise

@app.route('/')
def index():
    """Serve the main page."""
    return send_from_directory('../frontend', 'index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict digit from canvas image."""
    try:
        data = request.json
        image_data = data.get('image')

        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400

        # Preprocess image - MATCHING DESKTOP VERSION EXACTLY
        processed_image = preprocess_image(image_data)

        # Make prediction
        prediction = model.predict(processed_image, verbose=0)
        predicted_digit = int(np.argmax(prediction[0]))
        confidence = float(prediction[0][predicted_digit] * 100)

        return jsonify({
            'digit': predicted_digit,
            'confidence': confidence,
            'probabilities': prediction[0].tolist()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    print("Initializing model...")
    build_and_load_model()
    print("Model ready. Starting server...")
    app.run(debug=False, host='0.0.0.0', port=5000)
