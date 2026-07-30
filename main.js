const inputField = document.querySelector('.hero-textarea');
const sendBtn = document.getElementById('send-btn');

function handleSend() {
  const message = inputField.value.trim();
  if (message !== '') {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5591920025706?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    inputField.value = '';
  }
}

inputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

sendBtn.addEventListener('click', handleSend);

// Typing effect logic
const phrases = [
  "Minha tomada parou de funcionar",
  "A pia da cozinha entupiu",
  "Minha porta não fecha direito",
  "Preciso montar meu guarda-roupa",
  "Quero um doce",
  "Quero lavar meu carro"
];

let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingTimeout;
let isFocused = false;

function typeEffect() {
  if (isFocused) return; // Pause if user is focused

  const currentPhrase = phrases[currentPhraseIndex];
  
  if (isDeleting) {
    currentCharIndex--;
  } else {
    currentCharIndex++;
  }

  let displayedText = currentPhrase.substring(0, Math.max(0, currentCharIndex));
  // Add a fake blinking cursor pipe at the end
  inputField.setAttribute('placeholder', displayedText + '|');

  let typingSpeed = isDeleting ? 30 : 70; // Delete faster than typing

  // If word is completely typed out
  if (!isDeleting && currentCharIndex === currentPhrase.length) {
    typingSpeed = 2500; // Wait 2.5 seconds before starting to delete
    isDeleting = true;
  } else if (isDeleting && currentCharIndex === 0) {
    isDeleting = false;
    currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
    typingSpeed = 500; // Pause before typing next word
  }

  typingTimeout = setTimeout(typeEffect, typingSpeed);
}

// Start the effect
typeEffect();

inputField.addEventListener('focus', () => {
  isFocused = true;
  clearTimeout(typingTimeout);
  inputField.setAttribute('placeholder', 'Descreva o que você precisa...');
});

inputField.addEventListener('blur', () => {
  isFocused = false;
  if (inputField.value.trim() === '') {
    typeEffect();
  } else {
    inputField.setAttribute('placeholder', '');
  }
});

// ----------------------------------------------------
// WEB SPEECH API (Voice to Text)
// ----------------------------------------------------
const micBtn = document.getElementById('mic-btn');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  
  let isRecording = false;

  micBtn.addEventListener('click', () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  recognition.onstart = () => {
    isRecording = true;
    micBtn.style.color = '#ff4757'; // Change to red to indicate recording
    inputField.value = '';
    inputField.setAttribute('placeholder', 'Ouvindo... Fale agora.');
    isFocused = true; // Pause typing effect
    clearTimeout(typingTimeout);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // Capitalize first letter
    inputField.value = transcript.charAt(0).toUpperCase() + transcript.slice(1);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    resetMicState();
    if(event.error === 'not-allowed') {
      alert('Permita o acesso ao microfone no seu navegador para usar esta função.');
    }
  };

  recognition.onend = () => {
    resetMicState();
  };

  function resetMicState() {
    isRecording = false;
    micBtn.style.color = ''; // Reset color
    isFocused = false;
    if (inputField.value.trim() === '') {
      typeEffect();
    } else {
      inputField.setAttribute('placeholder', '');
    }
  }
} else {
  micBtn.addEventListener('click', () => {
    alert('O ditado por voz não é suportado pelo seu navegador (tente no Chrome ou Safari).');
  });
}

// ----------------------------------------------------
// STORIES LOGIC
// ----------------------------------------------------
const storiesImages = [
  '/HISTORY1.jpg',
  '/HISTORY2.jpg',
  '/HISTORY3.jpg',
  '/HISTORY4.jpg',
  '/HISTORY5.jpg'
];

let currentStoryIndex = 0;
let storyTimer;
const STORY_DURATION = 5000; // 5 seconds per story

const openStoriesBtn = document.getElementById('open-stories');
const closeStoriesBtn = document.getElementById('close-stories');
const storiesModal = document.getElementById('stories-modal');
const storyImage = document.getElementById('story-image');
const tapLeft = document.getElementById('story-tap-left');
const tapRight = document.getElementById('story-tap-right');
const navPrev = document.getElementById('story-nav-prev');
const navNext = document.getElementById('story-nav-next');
const progressFills = document.querySelectorAll('.progress-fill');

function openStories() {
  currentStoryIndex = 0;
  storiesModal.classList.remove('hidden');
  showStory(currentStoryIndex);
}

function closeStories() {
  storiesModal.classList.add('hidden');
  clearTimeout(storyTimer);
  resetProgressBars();
}

function resetProgressBars() {
  progressFills.forEach(fill => {
    fill.style.width = '0%';
    fill.style.transition = 'none';
  });
}

function showStory(index) {
  if (index < 0) {
    index = 0;
  }
  if (index >= storiesImages.length) {
    closeStories();
    return;
  }
  
  currentStoryIndex = index;
  storyImage.src = storiesImages[currentStoryIndex];
  
  // Fill previous bars completely, empty next ones
  progressFills.forEach((fill, i) => {
    fill.style.transition = 'none';
    if (i < currentStoryIndex) {
      fill.style.width = '100%';
    } else if (i > currentStoryIndex) {
      fill.style.width = '0%';
    }
  });

  // Start progress bar for current story
  const currentFill = progressFills[currentStoryIndex];
  currentFill.style.width = '0%';
  
  // Force reflow for css transition to work
  void currentFill.offsetWidth;
  
  // Animate current bar
  currentFill.style.transition = `width ${STORY_DURATION}ms linear`;
  currentFill.style.width = '100%';

  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    showStory(currentStoryIndex + 1);
  }, STORY_DURATION);
}

openStoriesBtn.addEventListener('click', openStories);
closeStoriesBtn.addEventListener('click', closeStories);

tapLeft.addEventListener('click', (e) => {
  e.stopPropagation();
  showStory(currentStoryIndex - 1);
});

tapRight.addEventListener('click', (e) => {
  e.stopPropagation();
  showStory(currentStoryIndex + 1);
});

navPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  showStory(currentStoryIndex - 1);
});

navNext.addEventListener('click', (e) => {
  e.stopPropagation();
  showStory(currentStoryIndex + 1);
});
