const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://eatreal-backend2.onrender.com';  // Updated to new backend URL

console.log('API URL configured as:', API_URL); // Debug log

console.log('Questionnaire.js loaded');

class NutritionQuestionnaire {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        
        /* Redundant debug logs
        console.log('Questionnaire initialized');
        console.log('Current question:', this.currentQuestion);
        */

        this.questions = [
            {
                id: 'goal',
                title: 'What brings you here today?',
                emoji: '🎯',
                type: 'choice',
                options: [
                    { value: 'weight_loss', label: 'I want to lose weight', emoji: '⚖️' },
                    { value: 'muscle_gain', label: 'I want to build muscle', emoji: '💪' },
                    { value: 'health', label: 'I want to eat healthier', emoji: '🥗' },
                    { value: 'energy', label: 'I want more energy', emoji: '⚡' }
                ]
            },
            {
                id: 'gender',
                title: 'What is your biological sex?',
                emoji: '👤',
                type: 'choice',
                options: [
                    { value: 'male', label: 'Male', emoji: '👨' },
                    { value: 'female', label: 'Female', emoji: '👩' }
                ]
            },
            {
                id: 'age',
                title: '🎂 How old are you?',
                type: 'number',
                placeholder: 'Enter your age',
                validation: value => {
                    const num = parseInt(value);
                    return num >= 16 && num <= 100;
                },
                errorMessage: 'Please enter a valid age between 16-100'
            },
            {
                id: 'height',
                title: 'How tall are you? (cm)',
                type: 'number',
                placeholder: 'Enter height in cm',
                validation: value => {
                    const num = parseInt(value);
                    return num >= 140 && num <= 220;
                },
                errorMessage: 'Please enter a valid height between 140-220 cm'
            },
            {
                id: 'current_weight',
                title: 'What is your current weight?',
                type: 'number',
                placeholder: 'kg',
                validation: value => {
                    const num = parseFloat(value);
                    return num >= 30 && num <= 250;
                },
                errorMessage: 'Please enter a valid weight between 30-250 kg'
            },
            {
                id: 'target_weight',
                title: 'What is your target weight?',
                type: 'number',
                placeholder: 'kg',
                validation: value => {
                    const num = parseFloat(value);
                    return num >= 30 && num <= 250;
                },
                errorMessage: 'Please enter a valid weight between 30-250 kg'
            },
            {
                id: 'activity',
                title: 'How active are you?',
                type: 'choice',
                options: [
                    { value: 'sedentary', label: 'Mostly sitting' },
                    { value: 'light', label: 'Light exercise 1-3 times/week' },
                    { value: 'moderate', label: 'Active 3-5 times/week' },
                    { value: 'very_active', label: 'Very active (almost daily)' }
                ]
            },
            {
                id: 'diet_preference',
                title: '🍽️ Any dietary preferences?',
                type: 'choice',
                options: [
                    { value: 'omnivore', label: '🍖 I eat everything' },
                    { value: 'vegetarian', label: '🥬 Vegetarian' },
                    { value: 'vegan', label: '🌱 Vegan' },
                    { value: 'pescatarian', label: '🐟 Pescatarian' },
                    { value: 'animal_based', label: '🥩 Animal Based' },
                ]
            },
            {
                id: 'allergies',
                title: '⚕️ Any food allergies?',
                type: 'choice',
                options: [
                    { value: 'none', label: '✅ No allergies' },
                    { value: 'nuts', label: '🥜 Nuts' },
                    { value: 'dairy', label: '🥛 Dairy' },
                    { value: 'gluten', label: '🌾 Gluten' }
                ]
            },
            {
                id: 'cooking_time',
                title: 'How much time can you spend cooking a day?',
                type: 'choice',
                options: [
                    { value: 'minimal', label: '30 mins or less' },
                    { value: 'moderate', label: '1 hour' },
                    { value: 'flexible', label: '1+ hours' }
                ]
            },
            {
                id: 'meal_prep',
                title: 'Are you interested in meal prepping?',
                type: 'choice',
                options: [
                    { value: 'yes', label: 'Yes, I want to prep meals' },
                    { value: 'no', label: 'No, I prefer cooking daily' }
                ]
            },
            {
                id: 'email',
                title: 'Where should we send your plan?',
                type: 'email',
                placeholder: 'your@email.com',
                validation: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                errorMessage: 'Please enter a valid email address'
            }
        ];
        
        this.container = document.getElementById('questionContainer');
        if (!this.container) {
            console.error('Question container not found!');
            return;
        }
        this.init();
    }

    init() {
        this.showQuestion(0);
    }

    showQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        this.currentQuestion = index;
        const question = this.questions[index];
        const html = this.generateQuestionHTML(question);
        
        // Create new question element
        const questionElement = document.createElement('div');
        questionElement.className = 'question';
        questionElement.innerHTML = html;

        // Replace or add question
        this.container.innerHTML = '';
        this.container.appendChild(questionElement);

        // Trigger animation
        requestAnimationFrame(() => {
            questionElement.classList.add('active');
        });

        this.attachEventListeners(question);
    }

    generateQuestionHTML(question) {
        return `
            <div class="question-header">
                <span class="emoji">${question.emoji || ''}</span>
                <h2>${question.title || ''}</h2>
            </div>
            ${this.generateInputHTML(question)}
            <div class="progress-indicator">
                ${this.questions.map((_, index) => `
                    <div class="progress-dot ${index === this.currentQuestion ? 'active' : ''}" 
                         data-question="${index}"></div>
                `).join('')}
            </div>
        `;
    }

    generateInputHTML(question) {
        if (question.type === 'choice') {
            return `
                <div class="options-container">
                    ${question.options.map(option => `
                        <button class="option-button" data-value="${option.value}">
                            <span class="option-emoji">${option.emoji || ''}</span>
                            <span class="option-label">${option.label || ''}</span>
                        </button>
                    `).join('')}
                </div>
            `;
        } else {
            return `
                <div class="input-wrapper">
                    <input type="${question.type}" 
                           class="input-field" 
                           placeholder="${question.placeholder || ''}"
                           value="${this.answers[question.id] || ''}"
                    >
                    <button class="continue-button">Continue →</button>
                    <div class="error-message">${question.errorMessage || ''}</div>
                </div>
            `;
        }
    }

    attachEventListeners(question) {
        // Handle option buttons
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleAnswer(button.dataset.value);
            });
        });

        // Handle continue button for input fields
        const continueButton = document.querySelector('.continue-button');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                const input = document.querySelector('.input-field');
                if (input) {
                    this.handleAnswer(input.value);
                }
            });
        }

        // Handle progress dots navigation
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetQuestion = parseInt(dot.dataset.question);
                if (targetQuestion < this.currentQuestion) {
                    this.showQuestion(targetQuestion);
                }
            });
        });
    }

    handleAnswer(value) {
        console.log('handleAnswer called with value:', value);
        console.log('Current question:', this.questions[this.currentQuestion]);
        
        const question = this.questions[this.currentQuestion];
        
        if (question.validation && !question.validation(value)) {
            console.log('Validation failed');
            const errorMessage = document.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.classList.add('visible');
            }
            return;
        }

        this.answers[question.id] = value;
        console.log('Updated answers:', this.answers);
        
        // Show BMI insight after weight question
        if (question.id === 'current_weight') {
            console.log('Current weight question detected');
            this.showBMIInsight();
        }
        
        // Update BMI chart after target weight
        if (question.id === 'target_weight') {
            console.log('Target weight question detected');
            this.updateWithTargetBMI();
        }

        if (this.currentQuestion < this.questions.length - 1) {
            this.showQuestion(this.currentQuestion + 1);
        } else {
            this.submitQuestionnaire();
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    generateNutritionPlan() {
        const plan = {
            dailyCalories: this.calculateDailyCalories(),
            macros: this.calculateMacros(),
            mealPlan: this.generateMealPlan(),
            recommendations: this.generateRecommendations()
        };
        
        return this.formatEmailContent(plan);
    }

    calculateDailyCalories() {
        // Basic BMR calculation using Harris-Benedict equation
        const weight = parseFloat(this.answers.current_weight);
        const height = parseFloat(this.answers.height);
        const age = parseInt(this.answers.age);
        const gender = this.answers.gender;
        
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Activity multiplier
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            very_active: 1.725
        };

        return Math.round(bmr * activityMultipliers[this.answers.activity]);
    }

    calculateMacros() {
        const calories = this.calculateDailyCalories();
        const goal = this.answers.goal;
        
        let macros = {
            protein: 0,
            carbs: 0,
            fats: 0
        };

        switch(goal) {
            case 'weight_loss':
                macros.protein = Math.round((calories * 0.4) / 4); // 40% protein
                macros.carbs = Math.round((calories * 0.3) / 4);  // 30% carbs
                macros.fats = Math.round((calories * 0.3) / 9);   // 30% fats
                break;
            case 'muscle_gain':
                macros.protein = Math.round((calories * 0.35) / 4); // 35% protein
                macros.carbs = Math.round((calories * 0.45) / 4);  // 45% carbs
                macros.fats = Math.round((calories * 0.2) / 9);    // 20% fats
                break;
            case 'maintenance':
                macros.protein = Math.round((calories * 0.3) / 4);  // 30% protein
                macros.carbs = Math.round((calories * 0.4) / 4);   // 40% carbs
                macros.fats = Math.round((calories * 0.3) / 9);    // 30% fats
                break;
            case 'endurance':
                macros.protein = Math.round((calories * 0.25) / 4); // 25% protein
                macros.carbs = Math.round((calories * 0.55) / 4);  // 55% carbs
                macros.fats = Math.round((calories * 0.2) / 9);    // 20% fats
                break;
            case 'keto':
                macros.protein = Math.round((calories * 0.25) / 4); // 25% protein
                macros.carbs = Math.round((calories * 0.05) / 4);  // 5% carbs
                macros.fats = Math.round((calories * 0.7) / 9);    // 70% fats
                break;
            default:
                macros.protein = Math.round((calories * 0.3) / 4);  // 30% protein
                macros.carbs = Math.round((calories * 0.4) / 4);   // 40% carbs
                macros.fats = Math.round((calories * 0.3) / 9);    // 30% fats
        }

        return macros;
    }

    generateMealPlan() {
        // Basic meal plan based on preferences and restrictions
        const mealPlan = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };

        // Add meal suggestions based on dietary preferences
        if (this.answers.diet_preference === 'vegan') {
            mealPlan.breakfast = ['Oatmeal with fruits', 'Tofu scramble', 'Smoothie bowl'];
            // ... add more meal suggestions
        }

        return mealPlan;
    }

    formatEmailContent(plan) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <img src="cid:logo" alt="Eat Real Logo" style="width: 100px; margin: 20px auto; display: block;">
                <h1 style="color: #333; text-align: center;">Your Personalized Nutrition Plan</h1>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2>Daily Targets</h2>
                    <p>Calories: ${plan.dailyCalories} kcal</p>
                    <p>Protein: ${plan.macros.protein}g</p>
                    <p>Carbs: ${plan.macros.carbs}g</p>
                    <p>Fats: ${plan.macros.fats}g</p>
                </div>

                <div style="margin: 20px 0;">
                    <h2>Suggested Meals</h2>
                    <!-- Add meal suggestions -->
                </div>

                <div style="background: #f0f7ff; padding: 20px; border-radius: 8px;">
                    <h2>Tips for Success</h2>
                    <!-- Add personalized tips -->
                </div>
            </div>
        `;
    }

    generatePromptForGPT() {
        const answers = this.answers;
        return `Generate a detailed 1-week meal plan for someone with the following profile:

Goal: ${answers.goal.replace('_', ' ')}
Gender: ${answers.gender}
Age: ${answers.age}
Height: ${answers.height}cm
Current Weight: ${answers.current_weight}kg
Target Weight: ${answers.target_weight}kg
Activity Level: ${answers.activity.replace('_', ' ')}
Diet Preference: ${answers.diet_preference.replace('_', ' ')}
Allergies: ${answers.allergies.replace('_', ' ')}
Cooking Time Available: ${answers.cooking_time.replace('_', ' ')}
Meal Prep Preference: ${answers.meal_prep}

Please provide:
1. Daily calorie target and macronutrient breakdown
2. A 7-day meal plan with breakfast, lunch, dinner, and snacks
3. For each meal, include:
   - Recipe name
   - Introduction explaining why this meal was chosen (e.g., "This meal was selected because it provides essential protein and healthy fats needed for muscle recovery, while its complex carbohydrates offer sustained energy throughout the day.")
   - Detailed macronutrients (Protein, Carbs, Fats in grams)
   - How this specific meal supports their ${answers.goal.replace('_', ' ')} goal
4. Weekly grocery list organized by category (Produce, Proteins, Pantry)
5. Meal prep tips specific to their ${answers.cooking_time} cooking time preference

Format each day as:
DAY [number]:
Breakfast:
[Introduction explaining why this meal was chosen]
[meal] 
| P: [X]g, C: [X]g, F: [X]g

Lunch:
[Introduction explaining why this meal was chosen]
[meal] 
| P: [X]g, C: [X]g, F: [X]g

Dinner:
[Introduction explaining why this meal was chosen]
[meal] 
| P: [X]g, C: [X]g, F: [X]g

Snacks:
[Introduction explaining why this meal was chosen]
[meal] 
| P: [X]g, C: [X]g, F: [X]g

Make sure each meal:
1. Supports their ${answers.goal.replace('_', ' ')} goal
2. Fits within their ${answers.cooking_time} cooking time preference
3. Avoids any ${answers.allergies} allergens
4. Matches their ${answers.diet_preference.replace('_', ' ')} dietary preference
5. Includes meal prep suggestions if they selected 'yes'`;
    }

    showLoadingScreen() {
        this.container.innerHTML = `
            <div class="loading-screen">
                <div class="loading-spinner"></div>
                <h2>Generating your personalized nutrition plan...</h2>
                <p>This may take a few moments</p>
            </div>
        `;
    }

    showErrorScreen(error) {
        this.container.innerHTML = `
            <div class="error-screen">
                <h2>Oops! Something went wrong</h2>
                <p>${error}</p>
                <button onclick="location.reload()" class="retry-button">Try Again</button>
                <a href="index.html" class="back-button">← Back to Home</a>
            </div>
        `;
    }

    async submitQuestionnaire() {
        try {
            this.showLoadingScreen();
            const prompt = this.generatePromptForGPT();
            
            const response = await fetch(`${API_URL}/api/generate-meal-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    email: this.answers.email,
                    userProfile: this.answers
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (response.ok) {
                this.showSuccessScreen();
            } else {
                throw new Error(data.error || 'Failed to generate meal plan');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showErrorScreen(error.message);
        }
    }

    showSuccessScreen() {
        this.container.innerHTML = `
            <div class="success-screen">
                <h2>🎉 Success!</h2>
                <p>Your personalized meal plan has been sent to your email.</p>
                <p>Please check your inbox in the next few minutes.</p>
            </div>
        `;
    }

    calculateBMI(weight) {
        const height = parseFloat(this.answers.height) / 100; // Convert cm to meters
        if (!weight || !height) return null;
        
        const bmi = weight / (height * height);
        return {
            value: bmi.toFixed(1),
            category: this.getBMICategory(bmi)
        };
    }

    getBMICategory(bmi) {
        if (bmi < 18.5) return { label: 'Underweight', color: '#FFA726' };
        if (bmi < 24.9) return { label: 'Healthy', color: '#66BB6A' };
        if (bmi < 29.9) return { label: 'Overweight', color: '#FFA726' };
        return { label: 'Obese', color: '#EF5350' };
    }

    showBMIInsight() {
        console.log('showBMIInsight called');
        const currentBMI = this.calculateBMI(parseFloat(this.answers.current_weight));
        console.log('Current weight:', this.answers.current_weight);
        console.log('Current BMI:', currentBMI);

        const insightHTML = `
            <div class="insight-popup">
                <button class="close-button" aria-label="Close insight"></button>
                <div class="insight-header">
                    <span class="insight-icon">💡</span>
                    <h3>Your BMI Insight</h3>
                </div>
                <div class="bmi-value">
                    <span class="number">${currentBMI.value}</span>
                    <span class="label">BMI</span>
                </div>
                <div class="bmi-category" style="color: ${currentBMI.category.color}">
                    ${currentBMI.category.label}
                </div>
                <p class="bmi-description">
                    BMI is a simple measure of body weight relative to height. While it's not perfect, 
                    it can be a useful starting point for understanding your health status.
                </p>
            </div>
        `;

        // Get the insight container
        const insightContainer = document.getElementById('insightContainer');
        if (!insightContainer) {
            console.error('No insight container found');
            return;
        }

        // Clear existing insights
        insightContainer.innerHTML = '';

        // Add new insight
        const popup = document.createElement('div');
        popup.innerHTML = insightHTML;
        insightContainer.appendChild(popup.firstElementChild);

        // Add interactivity after the popup is added
        const addedPopup = document.querySelector('.insight-popup');
        if (addedPopup) {
            this.makeInsightInteractive(addedPopup);
        }

        // Add active class after a brief delay
        setTimeout(() => {
            const addedPopup = document.querySelector('.insight-popup');
            if (addedPopup) {
                addedPopup.classList.add('active');
                
                // Update with target BMI when available
                this.updateWithTargetBMI();
            }
        }, 10);
    }

    // New method to update with target BMI
    updateWithTargetBMI() {
        console.log('Updating with target BMI');
        const currentBMI = this.calculateBMI(parseFloat(this.answers.current_weight));
        const targetBMI = this.calculateBMI(parseFloat(this.answers.target_weight));
        
        console.log('Target weight:', this.answers.target_weight);
        console.log('Target BMI:', targetBMI);

        if (!targetBMI) return;

        const popup = document.querySelector('.insight-popup');
        if (!popup) return;

        // Create chart data
        const chartWidth = 240;
        const chartHeight = 100;
        const startPoint = { x: 20, y: chartHeight - 20 };
        const endPoint = { x: chartWidth - 20, y: 20 };
        
        const pathD = `M ${startPoint.x} ${startPoint.y} 
                       C ${startPoint.x + 100} ${startPoint.y},
                         ${endPoint.x - 100} ${endPoint.y},
                         ${endPoint.x} ${endPoint.y}`;

        const chartHTML = `
            <svg class="bmi-chart" viewBox="0 0 ${chartWidth} ${chartHeight}">
                <path class="bmi-chart-line" d="${pathD}"/>
                <circle class="bmi-point" cx="${startPoint.x}" cy="${startPoint.y}"/>
                <circle class="bmi-point" cx="${endPoint.x}" cy="${endPoint.y}"/>
                <text class="bmi-point-label" x="${startPoint.x - 10}" y="${startPoint.y + 20}">
                    ${currentBMI.value}
                </text>
                <text class="bmi-point-label" x="${endPoint.x - 10}" y="${endPoint.y - 10}">
                    ${targetBMI.value}
                </text>
            </svg>
            <div class="bmi-target">
                <span class="label">Target BMI:</span>
                <span class="number">${targetBMI.value}</span>
                <span style="color: ${targetBMI.category.color}">${targetBMI.category.label}</span>
            </div>
        `;

        // Insert chart before description
        const description = popup.querySelector('.bmi-description');
        const chartContainer = document.createElement('div');
        chartContainer.innerHTML = chartHTML;
        description.parentNode.insertBefore(chartContainer, description);

        // Start fade out timer after target BMI is shown
        setTimeout(() => {
            console.log('Starting fade out');
            popup.style.opacity = '0';
            
            // Remove from DOM after fade animation completes
            setTimeout(() => {
                popup.remove();
            }, 300); // 300ms for fade animation
        }, 10000); // 10 seconds
    }

    // Add new method for interactivity
    makeInsightInteractive(popup) {
        let pos = { x: 0, y: 0 };
        let scale = 1;
        let isDragging = false;

        // Close button functionality
        const closeButton = popup.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 300);
        });

        // Mouse drag functionality
        popup.addEventListener('mousedown', initDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);

        // Touch functionality
        popup.addEventListener('touchstart', initDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', stopDrag);

        // Pinch zoom functionality
        let initialDistance = 0;
        
        function getDistance(touches) {
            return Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY
            );
        }

        popup.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = getDistance(e.touches);
            }
        });

        popup.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = getDistance(e.touches);
                const delta = currentDistance - initialDistance;
                scale = Math.min(Math.max(scale + delta * 0.01, 0.5), 2);
                popup.style.transform = `translate(-50%, -50%) scale(${scale})`;
                initialDistance = currentDistance;
            }
        });

        function initDrag(e) {
            e.preventDefault();
            isDragging = true;
            const event = e.touches ? e.touches[0] : e;
            pos = {
                x: event.clientX - popup.offsetLeft,
                y: event.clientY - popup.offsetTop
            };
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const event = e.touches ? e.touches[0] : e;
            popup.style.left = `${event.clientX - pos.x}px`;
            popup.style.top = `${event.clientY - pos.y}px`;
            popup.style.transform = `scale(${scale})`;
        }

        function stopDrag() {
            isDragging = false;
        }

        // Prevent default touch behaviors
        popup.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NutritionQuestionnaire();
}); 

async function submitQuestionnaire(data) {
    console.log('Starting submission...');
    console.log('API URL:', API_URL);
    console.log('Data being sent:', data);

    try {
        const response = await fetch(`${API_URL}/api/generate-meal-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log('Parsed response:', jsonResponse);
            return jsonResponse;
        } catch (e) {
            console.error('JSON parse error:', e);
            console.log('Non-JSON response received:', responseText);
            throw new Error('Invalid JSON response');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
} 