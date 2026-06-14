from rembg import remove
from PIL import Image

def remove_background(input_path, output_path):
    print(f"Processing {input_path}...")
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    input_file = r"c:\Users\panya\Desktop\crm_xeno\client\public\milkshake.png"
    remove_background(input_file, input_file)
