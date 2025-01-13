import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.generate_meal_plan import app

if __name__ == "__main__":
    app.run() 