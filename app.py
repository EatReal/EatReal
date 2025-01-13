import sys
import os

# Add the api directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

# Import the Flask app from generate_meal_plan
from api.generate_meal_plan import app

if __name__ == '__main__':
    app.run()