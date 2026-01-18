// Application state
let courses = [];
let flashcards = [];
let originalFlashcards = []; // Store original order
let currentCardIndex = 0;
let selectedCourse = null;
let isRandomized = false;

// Get DOM elements
const courseSelection = document.getElementById('courseSelection');
const courseList = document.getElementById('courseList');
const flashcardView = document.getElementById('flashcardView');
const courseTitle = document.getElementById('courseTitle');
const backBtn = document.getElementById('backBtn');
const flashcard = document.getElementById('flashcard');
const frontSection = document.getElementById('frontSection');
const backSection = document.getElementById('backSection');
const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const randomizeToggle = document.getElementById('randomizeToggle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Load courses from JSON file
async function loadCourses() {
    try {
        const response = await fetch('Data/courses.json');
        const data = await response.json();
        courses = data.Courses;
        
        // Load flashcard counts for each course
        await loadCourseCardCounts();
        displayCourses();
    } catch (error) {
        console.error('Error loading courses:', error);
        courseList.innerHTML = '<p class="error-message">Error loading courses. Please check that Data/courses.json exists.</p>';
    }
}

// Load flashcard counts for all courses
async function loadCourseCardCounts() {
    const countPromises = courses.map(async (course) => {
        try {
            const response = await fetch(`Data/${course.Source}`);
            const flashcards = await response.json();
            course.cardCount = flashcards.length;
        } catch (error) {
            console.error(`Error loading flashcards for Data/${course.Source}:`, error);
            course.cardCount = 0;
        }
    });
    
    await Promise.all(countPromises);
}

// Display courses in the selection view
function displayCourses() {
    courseList.innerHTML = '';
    
    courses.forEach(course => {
        const hasCards = course.cardCount > 0;
        const courseItem = document.createElement('div');
        courseItem.className = `course-item ${!hasCards ? 'disabled' : ''}`;
        
        const h3 = document.createElement('h3');
        h3.textContent = `${course.CourseID}: ${course.Title}`;
        courseItem.appendChild(h3);
        
        const pDesc = document.createElement('p');
        pDesc.textContent = course.Description;
        courseItem.appendChild(pDesc);
        
        const courseMeta = document.createElement('div');
        courseMeta.className = 'course-meta';
        
        const pCert = document.createElement('p');
        pCert.className = 'certifier';
        pCert.textContent = `By: ${course.Certifier}`;
        courseMeta.appendChild(pCert);
        
        const pCount = document.createElement('p');
        pCount.className = `card-count ${!hasCards ? 'empty' : ''}`;
        pCount.textContent = `${course.cardCount || 0} cards`;
        courseMeta.appendChild(pCount);
        
        courseItem.appendChild(courseMeta);
        
        if (hasCards) {
            courseItem.addEventListener('click', () => selectCourse(course));
        } else {
            courseItem.addEventListener('click', () => {
                // Do nothing for courses without cards - they're visually disabled
            });
        }
        
        courseList.appendChild(courseItem);
    });
}

// Handle course selection
async function selectCourse(course) {
    selectedCourse = course;
    courseTitle.textContent = course.Title;
    
    // Switch to flashcard view
    courseSelection.style.display = 'none';
    flashcardView.style.display = 'block';
    
    // Load flashcards for selected course
    await loadFlashcards(course.Source);
}

// Load flashcards from the specified JSON file
async function loadFlashcards(sourceFile) {
    try {
        const response = await fetch(`Data/${sourceFile}`);
        originalFlashcards = await response.json();
        flashcards = isRandomized ? shuffleArray(originalFlashcards) : [...originalFlashcards];
        currentCardIndex = 0;
        loadCard(currentCardIndex);
    } catch (error) {
        console.error('Error loading flashcards:', error);
        questionElement.textContent = 'Error loading flashcards';
        answerElement.textContent = `Please check that Data/${sourceFile} exists`;
    }
}

// Flip card when clicked
flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

// Load card content
function loadCard(index) {
    // Remove flip if card is flipped
    flashcard.classList.remove('flipped');
    
    // Load new content
    const card = flashcards[index];
    const sectionText = card.section || 'General';
    frontSection.textContent = sectionText;
    backSection.textContent = sectionText;
    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;
    
    // Update button states
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === flashcards.length - 1;
}

// Navigation buttons
prevBtn.addEventListener('click', () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        loadCard(currentCardIndex);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++;
        loadCard(currentCardIndex);
    }
});

// Randomize toggle event listener
randomizeToggle.addEventListener('change', () => {
    isRandomized = randomizeToggle.checked;
    
    // Re-shuffle or restore original order
    if (originalFlashcards.length > 0) {
        flashcards = isRandomized ? shuffleArray(originalFlashcards) : [...originalFlashcards];
        currentCardIndex = 0;
        loadCard(currentCardIndex);
    }
});

// Back button to return to course selection
backBtn.addEventListener('click', () => {
    flashcardView.style.display = 'none';
    courseSelection.style.display = 'block';
    selectedCourse = null;
    flashcards = [];
    originalFlashcards = [];
    currentCardIndex = 0;
    isRandomized = false;
    randomizeToggle.checked = false;
});

// Initialize - load courses
loadCourses();

// Handle responsive button text
function updateButtonText() {
    const backBtn = document.getElementById('backBtn');
    if (window.innerWidth <= 600) {
        backBtn.textContent = 'Courses';
        backBtn.classList.add('mobile-adjusted');
    } else {
        backBtn.textContent = '← Back to Courses';
        backBtn.classList.remove('mobile-adjusted');
    }
}

// Update button text on load and resize
updateButtonText();
window.addEventListener('resize', updateButtonText);
