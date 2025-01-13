import os
import sys
from debug import debug_info

print("=== Starting WSGI initialization ===")
debug_info()

try:
    from api.generate_meal_plan import app
    print("Successfully imported app")
except Exception as e:
    print(f"Error importing app: {e}")
    print(f"Python path: {sys.path}")
    raise

if __name__ == "__main__":
    app.run() 