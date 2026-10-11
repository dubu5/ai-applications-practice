import tkinter as tk
from tkinter import messagebox
import numpy as np
from PIL import Image, ImageDraw
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import io

class DigitRecognitionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Handwritten Digit Recognition")
        self.root.geometry("600x700")

        # Build and train model
        self.build_and_load_model()

        # Create canvas for drawing
        self.canvas = tk.Canvas(
            root,
            width=280,
            height=280,
            bg='white',
            cursor='cross'
        )
        self.canvas.pack(pady=20)

        # Bind mouse events
        self.canvas.bind('<Button-1>', self.start_draw)
        self.canvas.bind('<B1-Motion>', self.draw)
        self.canvas.bind('<ButtonRelease-1>', self.end_draw)

        # Image for processing
        self.image = Image.new('L', (280, 280), color=255)
        self.draw_obj = ImageDraw.Draw(self.image)

        # Button frame
        button_frame = tk.Frame(root)
        button_frame.pack(pady=20)

        # Recognize button
        recognize_btn = tk.Button(
            button_frame,
            text='Recognize Digit',
            command=self.recognize_digit,
            width=15,
            height=2,
            font=('Arial', 12)
        )
        recognize_btn.pack(side=tk.LEFT, padx=10)

        # Clear button
        clear_btn = tk.Button(
            button_frame,
            text='Clear Canvas',
            command=self.clear_canvas,
            width=15,
            height=2,
            font=('Arial', 12)
        )
        clear_btn.pack(side=tk.LEFT, padx=10)

        # Result label
        self.result_label = tk.Label(
            root,
            text='Draw a digit (0-9) and click "Recognize Digit"',
            font=('Arial', 14),
            fg='blue'
        )
        self.result_label.pack(pady=20)

        # Confidence label
        self.confidence_label = tk.Label(
            root,
            text='',
            font=('Arial', 12),
            fg='green'
        )
        self.confidence_label.pack(pady=10)

    def build_and_load_model(self):
        """Build and train a simple CNN model for digit recognition."""
        # Load MNIST dataset
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

        # Build model
        self.model = keras.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.Flatten(),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(10, activation='softmax')
        ])

        # Compile model
        self.model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        print("Training model... This may take a minute...")

        # Train model
        self.model.fit(
            x_train, y_train,
            epochs=5,
            batch_size=128,
            validation_split=0.1,
            verbose=1
        )

        # Evaluate model
        test_loss, test_accuracy = self.model.evaluate(x_test, y_test, verbose=0)
        print(f"Test accuracy: {test_accuracy * 100:.2f}%")

    def start_draw(self, event):
        """Start drawing when mouse is pressed."""
        self.last_x = event.x
        self.last_y = event.y

    def draw(self, event):
        """Draw on canvas as mouse moves."""
        # Draw on tkinter canvas
        self.canvas.create_line(
            self.last_x, self.last_y, event.x, event.y,
            width=8, fill='black', capstyle=tk.ROUND, smooth=tk.TRUE
        )

        # Draw on PIL image
        self.draw_obj.line(
            [(self.last_x, self.last_y), (event.x, event.y)],
            fill=0,
            width=8
        )

        self.last_x = event.x
        self.last_y = event.y

    def end_draw(self, event):
        """End drawing when mouse is released."""
        pass

    def preprocess_image(self):
        """Convert drawn image to MNIST format."""
        # Convert PIL image to numpy array
        img_array = np.array(self.image)

        # Invert (make background white, digit black)
        img_array = 255 - img_array

        # Resize to 28x28
        img_pil = Image.fromarray(img_array)
        img_pil = img_pil.resize((28, 28), Image.Resampling.LANCZOS)

        # Convert to numpy array and normalize
        img_array = np.array(img_pil).astype('float32') / 255.0
        img_array = img_array.reshape(1, 28, 28, 1)

        return img_array

    def recognize_digit(self):
        """Recognize the digit drawn on canvas."""
        try:
            # Preprocess image
            processed_image = self.preprocess_image()

            # Make prediction
            prediction = self.model.predict(processed_image, verbose=0)
            predicted_digit = np.argmax(prediction[0])
            confidence = prediction[0][predicted_digit] * 100

            # Update result label
            self.result_label.config(
                text=f'Predicted Digit: {predicted_digit}',
                fg='darkgreen'
            )

            # Update confidence label
            self.confidence_label.config(
                text=f'Confidence: {confidence:.2f}%'
            )

        except Exception as e:
            messagebox.showerror('Error', f'Error recognizing digit: {str(e)}')

    def clear_canvas(self):
        """Clear the canvas and image."""
        self.canvas.delete('all')
        self.image = Image.new('L', (280, 280), color=255)
        self.draw_obj = ImageDraw.Draw(self.image)
        self.result_label.config(text='Canvas cleared. Draw a new digit.')
        self.confidence_label.config(text='')

def main():
    """Main function to run the application."""
    root = tk.Tk()
    app = DigitRecognitionApp(root)
    root.mainloop()

if __name__ == '__main__':
    main()
