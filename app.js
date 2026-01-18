// Flash card data
let flashcards = [];
let currentCardIndex = 0;

// Get DOM elements
const flashcard = document.getElementById('flashcard');
const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Load flashcards from JSON file
async function loadFlashcards() {
    try {
        const response = await fetch('sc900.json');
        flashcards = await response.json();
        loadCard(currentCardIndex);
    } catch (error) {
        console.error('Error loading flashcards:', error);
        questionElement.textContent = 'Error loading flashcards';
        answerElement.textContent = 'Please check that sc900.json exists';
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
    questionElement.textContent = flashcards[index].question;
    answerElement.textContent = flashcards[index].answer;
    
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

// Initialize - load flashcards from JSON file
loadFlashcards();
