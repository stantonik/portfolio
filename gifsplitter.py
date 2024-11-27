import os
import sys
from PIL import Image

def split_gif_to_webp(input_gif, output_dir):
    """
    Splits a GIF into individual frames and saves each as a WebP image.

    Args:
        input_gif (str): Path to the input GIF file.
        output_dir (str): Directory to save the WebP frames.
    """
    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Open the GIF
    try:
        gif = Image.open(input_gif)
    except IOError as e:
        print(f"Error opening GIF: {e}")
        return

    frame_number = 0

    # Iterate through each frame in the GIF
    try:
        while True:
            # Save the current frame as a WebP image
            frame_file = os.path.join(output_dir, f"frame_{frame_number:03d}.webp")
            gif.save(frame_file, format="WEBP")
            print(f"Saved frame {frame_number} as {frame_file}")

            frame_number += 1
            gif.seek(frame_number)  # Move to the next frame
    except EOFError:
        # End of frames in GIF
        print("All frames have been processed.")
    finally:
        gif.close()

if __name__ == "__main__":
    # Check for proper usage
    if len(sys.argv) != 3:
        print("Usage: python split_gif_to_webp.py <input_gif> <output_dir>")
        sys.exit(1)

    # Get input GIF and output directory from arguments
    input_gif = sys.argv[1]
    output_dir = sys.argv[2]

    # Validate input file
    if not os.path.isfile(input_gif):
        print(f"Error: Input file '{input_gif}' does not exist.")
        sys.exit(1)

    # Validate output directory
    if not os.path.exists(output_dir):
        print(f"Output directory '{output_dir}' does not exist. Creating it...")
        os.makedirs(output_dir)

    # Call the function
    split_gif_to_webp(input_gif, output_dir)

