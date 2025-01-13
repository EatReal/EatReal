from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import os
from dotenv import find_dotenv, load_dotenv
import logging
import base64
from email.utils import formataddr

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add this debug line
dotenv_path = find_dotenv()
logger.debug(f"Loading .env from: {dotenv_path}")

# Load environment variables without setting keys
load_dotenv(dotenv_path, override=True)

# Load environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
EMAIL_USERNAME = os.getenv('EMAIL_USERNAME')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

# Debug print to check values
logger.debug(f"OPENAI_API_KEY: {OPENAI_API_KEY[:5]}..." if OPENAI_API_KEY else "None")
logger.debug(f"EMAIL_USERNAME: {EMAIL_USERNAME}")
logger.debug(f"EMAIL_PASSWORD: {'*' * len(EMAIL_PASSWORD) if EMAIL_PASSWORD else 'None'}")

# Verify environment variables are loaded
if not all([OPENAI_API_KEY, EMAIL_USERNAME, EMAIL_PASSWORD]):
    missing_vars = []
    if not OPENAI_API_KEY:
        missing_vars.append("OPENAI_API_KEY")
    if not EMAIL_USERNAME:
        missing_vars.append("EMAIL_USERNAME")
    if not EMAIL_PASSWORD:
        missing_vars.append("EMAIL_PASSWORD")
    logger.error(f"Missing environment variables: {', '.join(missing_vars)}")
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

logger.debug(f"API Key loaded (first 5 chars): {OPENAI_API_KEY[:5] if OPENAI_API_KEY else 'None'}")

# Make sure we're setting it for the openai client
openai.api_key = OPENAI_API_KEY

# Define prompts
targets_prompt = """
Create daily nutritional targets in this exact format:
CALORIES: [range]
PROTEIN: [percentage]
CARBS: [percentage]
FATS: [percentage]
"""

meal_plan_prompt = """
Create a 7-day meal plan with this exact format for each day:
DAY [number]:
Breakfast: [meal] | P: [X]g, C: [X]g, F: [X]g
Lunch: [meal] | P: [X]g, C: [X]g, F: [X]g
Dinner: [meal] | P: [X]g, C: [X]g, F: [X]g
Snacks: [meal] | P: [X]g, C: [X]g, F: [X]g
"""

app = Flask(__name__)
CORS(app)

@app.route('/api/generate-meal-plan', methods=['POST'])
def generate_meal_plan():
    try:
        data = request.json
        user_profile = data.get('userProfile', {})
        user_email = data.get('email')
        
        # Generate each component separately with appropriate token limits
        daily_targets = get_openai_response(targets_prompt, max_tokens=500)
        if daily_targets.startswith('Error:'):
            return jsonify({"success": False, "error": daily_targets}), 500

        meal_plan = get_openai_response(meal_plan_prompt, max_tokens=2000)
        if meal_plan.startswith('Error:'):
            return jsonify({"success": False, "error": meal_plan}), 500

        # Only generate grocery list if meal plan was successful
        grocery_list = get_openai_response(
            f"Based on this meal plan, create a categorized grocery list:\n{meal_plan}\n\n"
            "Format as:\nPRODUCE:\n- [item] (quantity)\nPROTEINS:\n- [item] (quantity)\n"
            "PANTRY:\n- [item] (quantity)",
            max_tokens=1000
        )
        if grocery_list.startswith('Error:'):
            return jsonify({"success": False, "error": grocery_list}), 500

        # Generate prep tips with truncated meal plan if necessary
        prep_tips = get_openai_response(
            "Create 5 specific meal prep tips for this meal plan. "
            "Format each tip on a new line starting with a number. "
            "Focus on time-saving and storage tips.",
            max_tokens=1000
        )
        if prep_tips.startswith('Error:'):
            return jsonify({"success": False, "error": prep_tips}), 500

        # Generate email content
        html_content = generate_html_email(
            daily_targets=daily_targets,
            meal_plan=meal_plan,
            grocery_list=grocery_list,
            prep_tips=prep_tips,
            user_profile=user_profile
        )

        if send_email(user_email, html_content):
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Failed to send email"}), 500

    except Exception as e:
        logger.error(f"Error in generate_meal_plan: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/test', methods=['GET'])
def test_meal_plan():
    test_data = {
        'userProfile': {
            'goal': 'weight_loss',
            'gender': 'male',
            'age': 30,
            'height': 180,
            'current_weight': 85,
            'target_weight': 75,
            'activity': 'moderate',
            'diet_preference': 'omnivore',
            'allergies': 'none',
            'cooking_time': 'moderate',
            'meal_prep': 'yes',
        },
        'email': 'j47fleming@gmail.com'
    }
    
    try:
        # Generate each component separately
        daily_targets = get_openai_response(targets_prompt, max_tokens=500)
        if daily_targets.startswith('Error:'):
            return jsonify({"success": False, "error": daily_targets}), 500

        meal_plan = get_openai_response(create_personalized_prompt(test_data['userProfile']), max_tokens=2000)
        if meal_plan.startswith('Error:'):
            return jsonify({"success": False, "error": meal_plan}), 500

        grocery_list = get_openai_response(
            f"Based on this meal plan:\n{meal_plan}\n\nCreate a categorized grocery list with quantities in this format:\n"
            "PRODUCE:\n- [item] (quantity)\nPROTEINS:\n- [item] (quantity)\nPANTRY:\n- [item] (quantity)",
            max_tokens=1000
        )

        prep_tips = get_openai_response(
            "Create 5 specific meal prep tips for this meal plan. Format as numbered list.",
            max_tokens=1000
        )

        # Pass user_profile to generate_html_email
        html_content = generate_html_email(
            daily_targets=daily_targets,
            meal_plan=meal_plan,
            grocery_list=grocery_list,
            prep_tips=prep_tips,
            user_profile=test_data['userProfile']
        )

        # For testing, return the HTML content directly instead of sending email
        return html_content

    except Exception as e:
        logger.error(f"Error in test_meal_plan: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

def create_personalized_prompt(user_profile):
    """Create a personalized prompt based on user profile"""
    return f"""
Based on the following profile:
- Goal: {user_profile.get('goal').replace('_', ' ')}
- Gender: {user_profile.get('gender')}
- Age: {user_profile.get('age')}
- Height: {user_profile.get('height')}cm
- Current Weight: {user_profile.get('current_weight')}kg
- Target Weight: {user_profile.get('target_weight')}kg
- Activity Level: {user_profile.get('activity').replace('_', ' ')}
- Dietary Preference: {user_profile.get('diet_preference').replace('_', ' ')}
- Allergies: {user_profile.get('allergies')}
- Cooking Time: {user_profile.get('cooking_time')} per day
- Meal Prep: {user_profile.get('meal_prep')}

Create a 7-day meal plan that:
1. Supports their weight loss journey from {user_profile.get('current_weight')}kg to {user_profile.get('target_weight')}kg
2. Can be prepared within their {user_profile.get('cooking_time')} time preference
3. Avoids any allergens ({user_profile.get('allergies')})
4. Includes meal prep suggestions if they selected 'yes'
5. Matches their {user_profile.get('diet_preference')} dietary preference

Format each day exactly as:
DAY [number]:
Breakfast: [detailed meal] | P: [X]g, C: [X]g, F: [X]g
Lunch: [detailed meal] | P: [X]g, C: [X]g, F: [X]g
Dinner: [detailed meal] | P: [X]g, C: [X]g, F: [X]g
Snacks: [detailed meal] | P: [X]g, C: [X]g, F: [X]g
"""

def get_openai_response(prompt, max_tokens=2000):
    """Helper function to get OpenAI API response with error handling"""
    try:
        logger.debug(f"Sending prompt to OpenAI (length: {len(prompt)})")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-16k",  # Using 16k model for longer responses
            messages=[
                {"role": "system", "content": "You are a precise nutritionist. Respond only in the exact format requested."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=max_tokens
        )
        
        # Add error checking for the response
        if not response or not hasattr(response, 'choices') or len(response.choices) == 0:
            logger.error("OpenAI API returned invalid response structure")
            return "Error: Invalid API response structure"
            
        content = response.choices[0].message['content'].strip()
        if not content:
            logger.error("OpenAI API returned empty content")
            return "Error: Empty response from API"
            
        logger.debug(f"Received response from OpenAI (length: {len(content)})")
        return content
        
    except IndexError as e:
        logger.error(f"IndexError in OpenAI response: {str(e)}")
        return "Error: Failed to process API response"
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return f"Error: {str(e)}"

def generate_html_email(daily_targets, meal_plan, grocery_list, prep_tips, user_profile):
    """Generate HTML email with structured sections"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }}
            
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }}
            
            .header {{
                background-color: #45B26B;
                padding: 20px;
                text-align: center;
            }}
            
            .logo {{
                width: 120px;
                height: auto;
                margin-bottom: 20px;
            }}
            
            .header h1 {{
                color: white;
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }}
            
            .content {{
                padding: 40px 20px;
            }}
            
            .section {{
                margin-bottom: 30px;
            }}
            
            .section-title {{
                color: #45B26B;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 15px;
                border-bottom: 2px solid #45B26B;
                padding-bottom: 5px;
            }}
            
            .meal-day {{
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                padding: 25px;
                margin-bottom: 30px;
            }}
            
            .day-intro {{
                color: #666;
                font-style: italic;
                margin-bottom: 15px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 6px;
            }}
            
            .macro-badge {{
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                margin-right: 8px;
                background: #e9ecef;
                color: #495057;
            }}
            
            .meal-emoji {{
                font-size: 20px;
                margin-right: 8px;
            }}
            
            .category-title {{
                color: #45B26B;
                font-size: 18px;
                margin: 15px 0 10px;
                display: flex;
                align-items: center;
            }}
            
            .meal-title {{
                color: #45B26B;
                font-weight: 600;
                margin-bottom: 10px;
            }}
            
            .meal-table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }}
            
            .meal-table th {{
                background: #45B26B;
                color: white;
                padding: 10px;
                text-align: left;
            }}
            
            .meal-table td {{
                padding: 10px;
                border-bottom: 1px solid #eee;
            }}
            
            .macros-box {{
                background: #f0f7f1;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }}
            
            .grocery-list {{
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
            }}
            
            .tips {{
                background: #fff5e6;
                border-radius: 8px;
                padding: 20px;
                margin-top: 30px;
            }}
            
            .footer {{
                background: #333;
                color: white;
                text-align: center;
                padding: 20px;
                font-size: 12px;
            }}
            
            .intro-section {{
                background: #f8f9fa;
                border-left: 4px solid #45B26B;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                line-height: 1.6;
            }}
            
            .intro-section p {{
                color: #666;
                margin: 10px 0;
            }}
            
            .highlight {{
                color: #45B26B;
                font-weight: 600;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="data:image/png;base64,{get_base64_logo()}" alt="Eat Real" class="logo">
                <h1>Your Personalized Nutrition Plan</h1>
            </div>
            
            <div class="content">
                <div class="intro-section">
                    <p>Welcome to your personalized nutrition journey! Based on your profile, we've created a meal plan that:</p>
                    <p>🎯 Supports your <span class="highlight">weight loss goal</span> from {user_profile.get('current_weight')}kg to {user_profile.get('target_weight')}kg</p>
                    <p>💪 Matches your <span class="highlight">{user_profile.get('activity').replace('_', ' ')}</span> activity level</p>
                    <p>🍽️ Follows your <span class="highlight">{user_profile.get('diet_preference').replace('_', ' ')}</span> dietary preference</p>
                    <p>⏰ Fits within your <span class="highlight">{user_profile.get('cooking_time')}</span> cooking time preference</p>
                    <p>🔄 Includes {user_profile.get('meal_prep')} meal prep options</p>
                </div>

                <div class="section">
                    <h2 class="section-title">Daily Targets</h2>
                    {format_daily_targets(daily_targets)}
                </div>

                <div class="section">
                    <h2 class="section-title">Your 7-Day Meal Plan</h2>
                    {format_meal_plan(meal_plan)}
                </div>

                <div class="section">
                    <h2 class="section-title">Grocery List</h2>
                    {format_grocery_list(grocery_list)}
                </div>

                <div class="section">
                    <h2 class="section-title">Meal Prep Tips</h2>
                    {format_prep_tips(prep_tips)}
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def get_base64_logo():
    """Convert logo to base64 for email embedding"""
    import os
    import base64
    
    try:
        # Get the absolute path to the logo
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        logo_path = os.path.join(project_root, 'assets', 'images', 'EatRealLogo.png')
        
        with open(logo_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode()
    except Exception as e:
        logger.error(f"Error loading logo: {str(e)}")
        return ""

def format_meal_plan(meal_plan_text):
    """Format the meal plan text into structured HTML"""
    try:
        logger.debug(f"Formatting meal plan: {meal_plan_text}")
        if not meal_plan_text:
            return "<p>Error: Empty meal plan</p>"

        formatted_html = "<div class='meal-plan'>"
        current_day = None
        
        for line in meal_plan_text.splitlines():
            line = line.strip()
            if not line:
                continue
                
            if line.startswith("DAY"):
                if current_day:
                    formatted_html += "</div>"
                current_day = line
                formatted_html += f"""
                    <div class="meal-day">
                        <h3>{current_day}</h3>
                """
            elif ":" in line:
                meal_type, details = line.split(":", 1)
                formatted_html += f"""
                    <div class="meal-item">
                        <h4>{meal_type.strip()}</h4>
                        <p>{details.strip()}</p>
                    </div>
                """
        
        if current_day:  # Close the last day div if exists
            formatted_html += "</div>"
        formatted_html += "</div>"
        return formatted_html
            
    except Exception as e:
        logger.error(f"Error formatting meal plan: {str(e)}")
        return "<p>Error formatting meal plan</p>"

def format_macro_badges(macros):
    """Format macros as attractive badges"""
    macro_parts = macros.split(",")
    badges_html = ""
    for part in macro_parts:
        nutrient, amount = part.strip().split(":")
        badges_html += f'<span class="macro-badge">{nutrient.strip()}: {amount.strip()}</span>'
    return badges_html

def format_grocery_list(grocery_list):
    """Format the grocery list with categories"""
    try:
        logger.debug(f"Formatting grocery list: {grocery_list}")
        if not grocery_list:
            return "<p>Error: Empty grocery list</p>"

        formatted_html = '<div class="grocery-list">'
        current_category = None
        
        for line in grocery_list.splitlines():
            line = line.strip()
            if not line:
                continue
                
            if line.endswith(':'):  # Category header
                if current_category:
                    formatted_html += "</ul>"
                current_category = line
                formatted_html += f"""
                    <h3>{current_category}</h3>
                    <ul>
                """
            elif line.startswith('-'):
                formatted_html += f"<li>{line[1:].strip()}</li>"
        
        if current_category:  # Close the last category if exists
            formatted_html += "</ul>"
        formatted_html += "</div>"
        return formatted_html
            
    except Exception as e:
        logger.error(f"Error formatting grocery list: {str(e)}")
        return "<p>Error formatting grocery list</p>"

def format_prep_tips(tips_text):
    """Format the meal prep tips"""
    try:
        logger.debug(f"Formatting prep tips: {tips_text}")
        if not tips_text:
            return "<p>Error: Empty prep tips</p>"

        formatted_html = '<div class="prep-tips"><ol>'
        for line in tips_text.splitlines():
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                formatted_html += f"<li>{line.lstrip('123456789.- ')}</li>"
        formatted_html += '</ol></div>'
        return formatted_html
            
    except Exception as e:
        logger.error(f"Error formatting prep tips: {str(e)}")
        return "<p>Error formatting prep tips</p>"

def send_email(user_email, html_content):
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Your Personalized Nutrition Plan"
        msg['From'] = formataddr(("EatReal", EMAIL_USERNAME))
        msg['To'] = user_email
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(msg)
            logger.debug("Email sent successfully")
        return True
    except Exception as e:
        logger.error(f"Email sending error: {str(e)}")
        return False

def format_daily_targets(targets_text):
    """Format the daily targets section"""
    try:
        logger.debug(f"Formatting daily targets: {targets_text}")
        if not targets_text or "CALORIES:" not in targets_text:
            return "<p>Error: Invalid daily targets format</p>"

        # Split the text into lines and find the relevant lines
        lines = targets_text.split('\n')
        calories = next((line.split('CALORIES:')[1].strip() for line in lines if 'CALORIES:' in line), 'N/A')
        protein = next((line.split('PROTEIN:')[1].strip() for line in lines if 'PROTEIN:' in line), 'N/A')
        carbs = next((line.split('CARBS:')[1].strip() for line in lines if 'CARBS:' in line), 'N/A')
        fats = next((line.split('FATS:')[1].strip() for line in lines if 'FATS:' in line), 'N/A')
        
        return f"""
        <div class="macros-box">
            <table class="meal-table">
                <tr>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Carbs</th>
                    <th>Fats</th>
                </tr>
                <tr>
                    <td>{calories}</td>
                    <td>{protein}</td>
                    <td>{carbs}</td>
                    <td>{fats}</td>
                </tr>
            </table>
        </div>
        """
    except Exception as e:
        logger.error(f"Error formatting daily targets: {str(e)}")
        return "<p>Error formatting daily targets</p>"

if __name__ == '__main__':
    # Verify environment before starting
    logger.info("Starting server with configuration:")
    logger.info(f"OpenAI API Key present: {bool(OPENAI_API_KEY)}")
    logger.info(f"Email username present: {bool(EMAIL_USERNAME)}")
    logger.info(f"Email password present: {bool(EMAIL_PASSWORD)}")
    
    app.run(debug=False, port=5000)  # Set debug=False to prevent reloading 