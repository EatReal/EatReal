import base64

# Replace with your logo path
logo_path = "assets/images/EatRealLogo.png"

try:
    with open(logo_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode()
        
        # Save to a text file
        with open("encoded_logo.txt", "w") as text_file:
            text_file.write(f"ENCODED_LOGO = '''{encoded_string}'''")
        print("Base64 encoded logo has been saved to 'encoded_logo.txt'")
except Exception as e:
    print(f"Error: {str(e)}")