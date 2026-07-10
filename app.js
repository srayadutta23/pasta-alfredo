/* 
   Pasta Alfredo Premium Culinary Portfolio Interaction Logic
   Author: Antigravity
*/

// Sticky Header & Active Nav Link Highlight
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    highlightNavLink();
});

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

function highlightNavLink() {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Portion Scaler Interaction
const scalerButtons = document.querySelectorAll('.scaler-btn');
const ingredientQtys = document.querySelectorAll('.ingredient-qty');

scalerButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Toggle Active Button
        scalerButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const servings = parseInt(button.dataset.servings);
        const scaleFactor = servings / 4; // Base recipe is for 4 servings
        
        // Scale Ingredient Quantities
        ingredientQtys.forEach(qty => {
            const baseVal = qty.dataset.base;
            if (baseVal && !isNaN(baseVal)) {
                const scaledVal = Math.round(parseFloat(baseVal) * scaleFactor * 10) / 10;
                qty.textContent = scaledVal;
            }
        });
    });
});

// Ingredient Check-off styling
function toggleIngredientCard(checkbox, cardId) {
    const card = document.getElementById(cardId);
    if (checkbox.checked) {
        card.classList.add('checked');
    } else {
        card.classList.remove('checked');
    }
}

// Cooking Step Slide and Timeline Navigation
let currentStep = 0;
const slides = document.querySelectorAll('.step-slide');
const timelineNodes = document.querySelectorAll('.timeline-node');
const timelineProgress = document.getElementById('timeline-progress');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentStepNum = document.getElementById('current-step-num');

function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= slides.length) return;
    
    // Update step index
    currentStep = stepIndex;
    
    // Update slide display
    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === stepIndex);
    });
    
    // Update timeline progress bar and nodes
    const progressPercent = (stepIndex / (slides.length - 1)) * 100;
    timelineProgress.style.width = `${progressPercent}%`;
    
    timelineNodes.forEach((node, idx) => {
        node.classList.toggle('active', idx === stepIndex);
        node.classList.toggle('completed', idx < stepIndex);
    });
    
    // Update navigation controls
    currentStepNum.textContent = stepIndex + 1;
    prevBtn.disabled = stepIndex === 0;
    
    if (stepIndex === slides.length - 1) {
        nextBtn.innerHTML = 'Finish Recipe &check;';
    } else {
        nextBtn.innerHTML = 'Next Step &rarr;';
    }
}

function navigateStep(direction) {
    const targetStep = currentStep + direction;
    if (targetStep >= 0 && targetStep < slides.length) {
        goToStep(targetStep);
    } else if (targetStep === slides.length) {
        // User clicked finish recipe
        document.getElementById('feedback').scrollIntoView();
    }
}

// Precise Digital Cooking Timers
const timers = {
    boil: {
        remaining: 540, // 9 mins in seconds
        intervalId: null,
        isRunning: false
    },
    garlic: {
        remaining: 120, // 2 mins in seconds
        intervalId: null,
        isRunning: false
    },
    cream: {
        remaining: 180, // 3 mins in seconds
        intervalId: null,
        isRunning: false
    }
};

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleTimer(timerId, totalSeconds) {
    const timer = timers[timerId];
    const button = document.querySelector(`#timer-${timerId} .btn-play`);
    
    if (timer.isRunning) {
        // Pause the timer
        clearInterval(timer.intervalId);
        timer.isRunning = false;
        button.textContent = 'Resume';
    } else {
        // Start the timer
        timer.isRunning = true;
        button.textContent = 'Pause';
        
        timer.intervalId = setInterval(() => {
            timer.remaining--;
            
            // Update display text
            document.getElementById(`display-${timerId}`).textContent = formatTime(timer.remaining);
            
            // Update progress circle (circumference = 415)
            const progressCircle = document.getElementById(`circle-progress-${timerId}`);
            const progress = (totalSeconds - timer.remaining) / totalSeconds;
            const offset = 415 * progress;
            progressCircle.style.strokeDashoffset = offset;
            
            if (timer.remaining <= 0) {
                clearInterval(timer.intervalId);
                timer.isRunning = false;
                button.textContent = 'Done!';
                button.disabled = true;
                
                // Play notification beep sound
                const sound = document.getElementById('timer-sound');
                if (sound) {
                    sound.currentTime = 0;
                    sound.play().catch(err => console.log('Audio playback failed', err));
                }
                
                // Flash timer display visually
                const box = document.getElementById(`timer-${timerId}`);
                box.style.border = '2px solid var(--accent-gold-hover)';
                box.style.animation = 'starPulse 0.5s ease 5';
            }
        }, 1000);
    }
}

function resetTimer(timerId, totalSeconds) {
    const timer = timers[timerId];
    const button = document.querySelector(`#timer-${timerId} .btn-play`);
    const box = document.getElementById(`timer-${timerId}`);
    
    clearInterval(timer.intervalId);
    timer.remaining = totalSeconds;
    timer.isRunning = false;
    
    button.textContent = 'Start';
    button.disabled = false;
    box.style.border = '1px solid var(--border-color)';
    box.style.animation = 'none';
    
    document.getElementById(`display-${timerId}`).textContent = formatTime(totalSeconds);
    
    // Reset circular progress circle
    const progressCircle = document.getElementById(`circle-progress-${timerId}`);
    progressCircle.style.strokeDashoffset = 0;
}

// User Rating Interactivity
let userRating = 0;
const stars = document.querySelectorAll('.star');

stars.forEach((star, index) => {
    // Hover Effects
    star.addEventListener('mouseover', () => {
        highlightStars(index);
    });
    
    star.addEventListener('mouseout', () => {
        highlightStars(userRating - 1);
    });
});

function rateRecipe(ratingValue) {
    userRating = ratingValue;
    highlightStars(ratingValue - 1);
    
    // Pulse animation on the selected star
    stars.forEach((star, idx) => {
        if (idx === ratingValue - 1) {
            star.classList.add('active');
            setTimeout(() => star.classList.remove('active'), 400);
        }
    });
}

function highlightStars(indexLimit) {
    stars.forEach((star, idx) => {
        if (idx <= indexLimit) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

// Submit Recipe Review Form
function submitFeedback(event) {
    event.preventDefault();
    
    const form = document.getElementById('recipe-feedback-form');
    const successMsg = document.getElementById('success-msg');
    
    // Smooth transition between form and success message
    form.style.display = 'none';
    successMsg.style.display = 'block';
}

// Auto-run slide timeline setup on page load
document.addEventListener('DOMContentLoaded', () => {
    goToStep(0);
});
