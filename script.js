// Personal Fitness Tracker - JavaScript Functionality

// Data storage using localStorage
let fitnessData = {
    dailyEntries: {},
    weightHistory: [],
    measurements: [],
    goals: {
        calories: 2000,
        protein: 150,
        targetWeight: 165
    },
    reminders: {
        meals: ['08:00', '12:00', '18:00'],
        weighIn: '07:00'
    }
};

// Load data from localStorage on startup
function loadData() {
    const saved = localStorage.getItem('fitnessTrackerData');
    if (saved) {
        fitnessData = { ...fitnessData, ...JSON.parse(saved) };
    }
    updateDashboard();
    updateFoodLog();
    updateProgress();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('fitnessTrackerData', JSON.stringify(fitnessData));
}

// Get today's date in YYYY-MM-DD format
function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Navigation functionality
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Dashboard Functions
function updateDashboard() {
    const today = getToday();
    const todayEntries = fitnessData.dailyEntries[today] || [];

    let totalCals = 0;
    let totalProtein = 0;

    todayEntries.forEach(entry => {
        totalCals += entry.calories || 0;
        totalProtein += entry.protein || 0;
    });

    // Update dashboard goals
    document.getElementById('calories-current').textContent = totalCals;
    document.getElementById('protein-current').textContent = totalProtein + 'g';

    // Update water count (placeholder - would need water logging feature)
    document.getElementById('water-current').textContent = '6';

    // Update recent food list
    const foodList = document.getElementById('today-food-list');
    if (todayEntries.length > 0) {
        foodList.innerHTML = todayEntries.map(entry =>
            `<div class="food-item">${entry.name}: ${entry.calories} cal, ${entry.protein}g protein</div>`
        ).join('');
    } else {
        foodList.textContent = 'No food logged yet today';
    }
}

function logWater() {
    alert('Water logged! 💧 (This would increment your water counter)');
}

// Food Logging Functions
function searchFood() {
    const query = document.getElementById('food-search').value;
    if (query) {
        // Simple search - in a real app, this would query a food database
        alert(`Searching for: ${query}\n\nIn a full version, this would show nutrition data from a food database.`);
    }
}

function addFoodEntry() {
    const today = getToday();

    const entry = {
        name: document.getElementById('food-name').value,
        calories: parseInt(document.getElementById('food-calories').value) || 0,
        protein: parseInt(document.getElementById('food-protein').value) || 0,
        carbs: parseInt(document.getElementById('food-carbs').value) || 0,
        fat: parseInt(document.getElementById('food-fat').value) || 0,
        timestamp: new Date().toISOString()
    };

    if (!entry.name || entry.calories === 0) {
        alert('Please enter food name and calories');
        return;
    }

    if (!fitnessData.dailyEntries[today]) {
        fitnessData.dailyEntries[today] = [];
    }

    fitnessData.dailyEntries[today].push(entry);
    saveData();

    // Clear form
    document.getElementById('food-name').value = '';
    document.getElementById('food-calories').value = '';
    document.getElementById('food-protein').value = '';
    document.getElementById('food-carbs').value = '';
    document.getElementById('food-fat').value = '';

    updateFoodLog();
    updateDashboard();

    alert(`Added ${entry.name} - ${entry.calories} calories!`);
}

function updateFoodLog() {
    const today = getToday();
    const todayEntries = fitnessData.dailyEntries[today] || [];
    const entriesList = document.getElementById('food-entries-list');

    if (todayEntries.length > 0) {
        entriesList.innerHTML = todayEntries.map((entry, index) => `
            <div class="food-entry">
                <span>${entry.name}</span>
                <span>${entry.calories} cal • ${entry.protein}g protein</span>
                <button onclick="deleteFoodEntry(${index})" class="delete-btn">×</button>
            </div>
        `).join('');
    } else {
        entriesList.innerHTML = '<p>No food entries yet today</p>';
    }

    // Update daily totals
    const totalCals = todayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const totalProtein = todayEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);

    document.getElementById('daily-total-cals').textContent = totalCals;
    document.getElementById('daily-total-protein').textContent = totalProtein + 'g';
}

function deleteFoodEntry(index) {
    const today = getToday();
    if (fitnessData.dailyEntries[today] && fitnessData.dailyEntries[today][index]) {
        fitnessData.dailyEntries[today].splice(index, 1);
        saveData();
        updateFoodLog();
        updateDashboard();
    }
}

// Progress Tracking Functions
function logWeight() {
    const weight = parseFloat(document.getElementById('current-weight').value);

    if (!weight || weight <= 0) {
        alert('Please enter a valid weight');
        return;
    }

    const entry = {
        weight: weight,
        date: getToday(),
        timestamp: new Date().toISOString()
    };

    fitnessData.weightHistory.push(entry);
    saveData();
    updateProgress();

    document.getElementById('current-weight').value = '';

    alert(`Weight logged: ${weight} lbs! 📊`);
}

function logMeasurements() {
    const waist = parseFloat(document.getElementById('waist-measurement').value);
    const chest = parseFloat(document.getElementById('chest-measurement').value);

    if (!waist || !chest) {
        alert('Please enter both waist and chest measurements');
        return;
    }

    const entry = {
        waist: waist,
        chest: chest,
        date: getToday(),
        timestamp: new Date().toISOString()
    };

    fitnessData.measurements.push(entry);
    saveData();
    updateProgress();

    document.getElementById('waist-measurement').value = '';
    document.getElementById('chest-measurement').value = '';

    alert(`Measurements logged! 📏`);
}

function updateProgress() {
    // Update weight history
    const weightList = document.getElementById('weight-history-list');

    if (fitnessData.weightHistory.length > 0) {
        // Show last 10 entries
        const recentWeights = fitnessData.weightHistory.slice(-10);
        weightList.innerHTML = recentWeights.map(entry =>
            `<div class="weight-entry">${entry.date}: ${entry.weight} lbs</div>`
        ).join('');
    } else {
        weightList.textContent = 'No weight entries yet';
    }

    // Simple chart placeholder (would use Chart.js in full version)
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw simple progress visualization
    if (fitnessData.weightHistory.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = '#6c5ce7';
        ctx.lineWidth = 3;

        const recentWeights = fitnessData.weightHistory.slice(-10);
        const maxWeight = Math.max(...recentWeights.map(w => w.weight));
        const minWeight = Math.min(...recentWeights.map(w => w.weight));

        recentWeights.forEach((entry, index) => {
            const x = (index / (recentWeights.length - 1)) * (canvas.width - 40) + 20;
            const y = canvas.height - 20 - ((entry.weight - minWeight) / (maxWeight - minWeight)) * (canvas.height - 40);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Add labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.fillText(`Weight Progress: ${minWeight} - ${maxWeight} lbs`, 20, 20);
    } else {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log some weights to see your progress!', canvas.width/2, canvas.height/2);
    }
}

// Reminder Functions
function setReminders() {
    fitnessData.reminders.meals = [
        document.getElementById('meal-reminder-1').value,
        document.getElementById('meal-reminder-2').value,
        document.getElementById('meal-reminder-3').value
    ];
    fitnessData.reminders.weighIn = document.getElementById('weigh-in-reminder').value;

    saveData();
    alert('Reminders updated! ⏰');
}

function setGoals() {
    fitnessData.goals.calories = parseInt(document.getElementById('calorie-goal').value) || 2000;
    fitnessData.goals.protein = parseInt(document.getElementById('protein-goal').value) || 150;
    fitnessData.goals.targetWeight = parseFloat(document.getElementById('target-weight').value) || 165;

    saveData();
    alert('Goals updated! 🎯');
}

// Motivation Functions
const quotes = [
    "Every small step counts toward your bigger goal.",
    "Your body can do it. It's time to convince your mind.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The only bad workout is the one that didn't happen.",
    "You don't have to be extreme, just consistent.",
    "Your future self will thank you for the work you're doing today.",
    "Progress, not perfection.",
    "One day at a time, one meal at a time, one workout at a time."
];

function newQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('daily-quote').textContent = randomQuote;
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    newQuote(); // Show initial quote

    // Set default reminder times in form
    document.getElementById('meal-reminder-1').value = fitnessData.reminders.meals[0] || '08:00';
    document.getElementById('meal-reminder-2').value = fitnessData.reminders.meals[1] || '12:00';
    document.getElementById('meal-reminder-3').value = fitnessData.reminders.meals[2] || '18:00';
    document.getElementById('weigh-in-reminder').value = fitnessData.reminders.weighIn || '07:00';

    // Set default goals in form
    document.getElementById('calorie-goal').value = fitnessData.goals.calories;
    document.getElementById('protein-goal').value = fitnessData.goals.protein;
    document.getElementById('target-weight').value = fitnessData.goals.targetWeight;

    // Update dashboard every minute to show current time-based data
    setInterval(updateDashboard, 60000);
});

// Keyboard shortcuts for quick navigation
document.addEventListener('keydown', function(e) {
    if (e.altKey) {
        switch(e.key) {
            case '1':
                showSection('dashboard');
                break;
            case '2':
                showSection('food-log');
                break;
            case '3':
                showSection('progress');
                break;
            case '4':
                showSection('reminders');
                break;
        }
    }
});