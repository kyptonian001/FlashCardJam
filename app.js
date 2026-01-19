// Application state
let courses = [];
let technologies = new Set();
let categories = new Set();
let flashcards = [];
let originalFlashcards = []; // Store original order
let currentCardIndex = 0;
let selectedCourse = null;
let selectedTechnology = null;
let selectedCategory = null;
let isRandomized = false;

// Get DOM elements
const technologySelection = document.getElementById('technologySelection');
const categorySelection = document.getElementById('categorySelection');
const courseSelection = document.getElementById('courseSelection');
const technologyTitle = document.getElementById('technologyTitle');
const technologyList = document.getElementById('technologyList');
const categoryList = document.getElementById('categoryList');
const courseList = document.getElementById('courseList');
const backToCategoryBtn = document.getElementById('backToCategoryBtn');
const backToCatBtn = document.getElementById('backToCatBtn');
const categoryTitle = document.getElementById('categoryTitle');
const courseSelectionTitle = document.getElementById('courseSelectionTitle');
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
    console.log('Loading courses...');
    try {
        const response = await fetch('Data/courses.json');
        console.log('Fetched courses.json');
        const data = await response.json();
        console.log('Parsed JSON:', data);
        courses = data.Courses;
        console.log('Courses loaded:', courses.length);
        
        // Populate technologies and categories
        courses.forEach(course => {
            technologies.add(course.Technology);
            categories.add(course.Category);
        });
        console.log('Technologies:', technologies);
        
        // Load flashcard counts for each course
        await loadCourseCardCounts();
        displayCategoriesInitial();
    } catch (error) {
        console.error('Error loading courses:', error);
        technologyList.innerHTML = '<p class="error-message">Error loading courses. Please check that Data/courses.json exists.</p>';
    }
}

// Display technologies in the selection view
function displayTechnologiesForCategory() {
    console.log('Displaying technologies for category:', selectedCategory);
    technologyList.innerHTML = '';
    technologyTitle.style.display = 'block';
    technologyTitle.textContent = `Select a Technology for ${selectedCategory}`;

    const categoryCourses = courses.filter(c => c.Category === selectedCategory);
    const techsForCategory = new Set(categoryCourses.map(c => c.Technology));

    Array.from(techsForCategory).sort().forEach(tech => {
        const techItem = document.createElement('div');
        techItem.className = 'option-item';

        const h3 = document.createElement('h3');
        h3.textContent = tech;
        techItem.appendChild(h3);

        const courseCount = categoryCourses.filter(c => c.Technology === tech).length;
        const p = document.createElement('p');
        p.textContent = `${courseCount} course${courseCount !== 1 ? 's' : ''} available`;
        techItem.appendChild(p);

        techItem.addEventListener('click', () => selectTechnology(tech));

        technologyList.appendChild(techItem);
    });
    console.log('Technologies displayed for category');
}

// Handle technology selection
function selectTechnology(tech) {
    selectedTechnology = tech;

    // Switch to course selection
    technologySelection.style.display = 'none';
    courseSelection.style.display = 'block';

    courseSelectionTitle.style.display = 'block';
    courseSelectionTitle.textContent = `Select a Course for ${selectedTechnology} in ${selectedCategory}`;

    displayCourses();
    updateButtonText();
}

// Display categories for selected technology
function displayCategoriesInitial() {
    console.log('Displaying categories');
    categoryTitle.style.display = 'block';
    categoryTitle.textContent = 'Select a Category';
    categoryList.innerHTML = '';

    Array.from(categories).sort().forEach(cat => {
        const catItem = document.createElement('div');
        catItem.className = 'option-item';

        const h3 = document.createElement('h3');
        h3.textContent = cat;
        catItem.appendChild(h3);

        catItem.addEventListener('click', () => selectCategory(cat));

        categoryList.appendChild(catItem);
    });
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
    courseSelectionTitle.style.display = 'block';
    courseSelectionTitle.textContent = `Select a Course for ${selectedTechnology} in ${selectedCategory}`;
    courseList.innerHTML = '';
    
    const filteredCourses = courses.filter(course => 
        course.Technology === selectedTechnology && course.Category === selectedCategory
    );
    
    filteredCourses.forEach(course => {
        const hasCards = course.cardCount > 0;
        const courseItem = document.createElement('div');
        courseItem.className = `option-item ${!hasCards ? 'disabled' : ''}`;
        
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

// Handle category selection
function selectCategory(cat) {
    selectedCategory = cat;

    // Switch to technology selection
    categorySelection.style.display = 'none';
    technologySelection.style.display = 'block';
    categoryTitle.style.display = 'none';

    displayTechnologiesForCategory();
    updateButtonText();
}

// Handle course selection
async function selectCourse(course) {
    selectedCourse = course;
    courseTitle.textContent = course.Title;
    courseSelectionTitle.style.display = 'none';
    
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

// Back button to return to previous selection
backBtn.addEventListener('click', () => {
    if (flashcardView.style.display === 'block') {
        // From flashcards back to courses
        flashcardView.style.display = 'none';
        courseSelection.style.display = 'block';
        selectedCourse = null;
        flashcards = [];
        originalFlashcards = [];
        currentCardIndex = 0;
        isRandomized = false;
        randomizeToggle.checked = false;
    } else if (courseSelection.style.display === 'block') {
        // From courses back to technologies
        courseSelection.style.display = 'none';
        technologySelection.style.display = 'block';
        selectedTechnology = null;
    } else if (technologySelection.style.display === 'block') {
        // From technologies back to categories
        technologySelection.style.display = 'none';
        categorySelection.style.display = 'block';
        selectedCategory = null;
    }
    // If already at technologies, do nothing or reset
    updateButtonText();
});

// Back buttons for selection views
backToCatBtn.addEventListener('click', () => {
    // From courses back to technologies
    courseSelection.style.display = 'none';
    technologySelection.style.display = 'block';
    courseSelectionTitle.style.display = 'none';
    selectedTechnology = null;
    updateButtonText();
});

// Back button in technology view to return to categories
backToCategoryBtn.addEventListener('click', () => {
    technologySelection.style.display = 'none';
    categorySelection.style.display = 'block';
    technologyTitle.style.display = 'none';
    selectedCategory = null;
    updateButtonText();
});

// Initialize - set initial view states and load courses
document.addEventListener('DOMContentLoaded', () => {
    // Ensure only Category is visible on load
    categorySelection.style.display = 'block';
    technologySelection.style.display = 'none';
    courseSelection.style.display = 'none';
    flashcardView.style.display = 'none';

    loadCourses();
});

// Handle responsive button text
function updateButtonText() {
    const backBtn = document.getElementById('backBtn');
    let text = 'Back';
    if (window.innerWidth > 600) {
        if (flashcardView.style.display === 'block') {
            text = '← Back to Courses';
        } else if (courseSelection.style.display === 'block') {
            text = '← Back to Technologies';
        } else if (technologySelection.style.display === 'block') {
            text = '← Back to Categories';
        } else {
            text = '← Back';
        }
    }
    backBtn.textContent = text;
    backBtn.classList.toggle('mobile-adjusted', window.innerWidth <= 600);
}

// Update button text on load and resize
updateButtonText();
window.addEventListener('resize', updateButtonText);
