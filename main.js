const inputField = document.querySelector('.hero-textarea');
const sendBtn = document.getElementById('send-btn');

// Preloader Logic
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  // Garante que o preloader seja visto por pelo menos 1.2 segundos para efeito de branding
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 1200);
});

function handleSend() {
  const message = inputField.value.trim();
  if (message !== '') {
    // 1. Hide profile elements and input wrapper
    document.getElementById('location-tag').classList.add('hidden');
    document.getElementById('profile-name').classList.add('hidden');
    document.getElementById('profile-bio').classList.add('hidden');
    document.getElementById('input-elements-wrapper').classList.add('hidden');
    
    // 2. Show Chat History
    const chatHistory = document.getElementById('chat-history');
    chatHistory.classList.remove('hidden');
    
    // 3. Render User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user-bubble';
    userBubble.textContent = message;
    chatHistory.appendChild(userBubble);
    
    inputField.value = ''; // clear
    
    // 4. System Reply 1 (Delay 1.2s)
    setTimeout(() => {
      const messages = [
        "Opa, estamos buscando o profissional perfeito pra o que você está pedindo...",
        "Legal! Deixa com a gente, estamos procurando o melhor especialista pra isso...",
        "Anotado! Só um instante enquanto localizamos um profissional disponível...",
        "Tudo certo. Estamos filtrando os profissionais mais bem avaliados para o seu pedido..."
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      const sysBubble1 = document.createElement('div');
      sysBubble1.className = 'chat-bubble system-bubble';
      sysBubble1.textContent = randomMsg;
      chatHistory.appendChild(sysBubble1);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1200);

    // 5. System Reply 2 + WhatsApp CTA (Delay 3.5s)
    setTimeout(() => {
      const sysBubble2 = document.createElement('div');
      sysBubble2.className = 'chat-bubble system-bubble';
      sysBubble2.innerHTML = `
        Encontramos! Toque no botão abaixo para falar com o profissional.
        <a href="#" class="chat-action-btn" id="whatsapp-link">
          <i class="ph-fill ph-whatsapp-logo"></i>
          Chamar no Whatsapp
        </a>
      `;
      chatHistory.appendChild(sysBubble2);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      
      // Bind WhatsApp link
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/5591920025706?text=${encodedMessage}`;
      const waLink = document.getElementById('whatsapp-link');
      waLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(whatsappUrl, '_blank');
      });
      
    }, 3500);
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
// WEB SPEECH API (Voice to Text) - Toggle & Hold-to-Talk
// ----------------------------------------------------
const micBtn = document.getElementById('mic-btn');
const recordingWaves = document.getElementById('recording-waves');
const audioUi = document.getElementById('audio-ui');
const audioUiText = document.getElementById('audio-ui-text');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = true; // Show text as they speak
  recognition.continuous = true; // Keep listening until explicitly stopped
  
  let isRecording = false;
  let isAudioMode = false;
  let finalTranscript = '';

  // Toggle Audio Mode on Mic Button Click
  micBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isAudioMode = !isAudioMode;
    
    if (isAudioMode) {
      micBtn.style.color = '#ff4757';
      micBtn.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
      micBtn.style.borderRadius = '50%';
      
      inputField.classList.add('hidden');
      audioUi.classList.remove('hidden');
      resetMicState();
      
      clearTimeout(typingTimeout);
    } else {
      resetAudioMode();
    }
  });

  // Prevent context menu on long press
  audioUi.addEventListener('contextmenu', e => {
    if (isAudioMode) e.preventDefault();
  });

  function startRecording(e) {
    if (!isAudioMode) return;
    if (e && e.cancelable) e.preventDefault();
    if (isRecording) return;
    
    finalTranscript = '';
    try {
      recognition.start();
    } catch (err) {}
  }

  function stopRecording(e) {
    if (!isAudioMode) return;
    if (e && e.cancelable) e.preventDefault();
    if (!isRecording) return;
    
    // Stop recognition; this will fire onend shortly after
    recognition.stop();
  }

  // Bind hold-to-talk to the AUDIO UI
  audioUi.addEventListener('mousedown', startRecording);
  audioUi.addEventListener('mouseup', stopRecording);
  audioUi.addEventListener('mouseleave', stopRecording);

  audioUi.addEventListener('touchstart', startRecording, { passive: false });
  audioUi.addEventListener('touchend', stopRecording, { passive: false });
  audioUi.addEventListener('touchcancel', stopRecording, { passive: false });

  recognition.onstart = () => {
    isRecording = true;
    finalTranscript = '';
    audioUiText.innerHTML = 'Solte para enviar...';
    audioUiText.style.color = '#a3a3a3';
    recordingWaves.classList.remove('hidden');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    const combined = (finalTranscript + interimTranscript).trim();
    if (combined) {
      audioUiText.innerHTML = combined; // Show text being spoken in real-time
      audioUiText.style.color = '#fff';
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if(event.error === 'not-allowed') {
      alert('Permita o acesso ao microfone no seu navegador para usar esta função.');
      resetAudioMode();
    }
  };

  recognition.onend = () => {
    isRecording = false;
    
    if (isAudioMode) {
      const currentText = audioUiText.innerText.trim();
      
      // If we captured speech, set it to the input field and exit audio mode
      if (currentText && currentText !== 'Solte para enviar...' && currentText !== 'Segure para falar') {
        inputField.value = currentText.charAt(0).toUpperCase() + currentText.slice(1);
        resetAudioMode();
      } else {
        resetMicState(); // Nothing captured, just reset the UI to wait again
      }
    }
  };

  function resetMicState() {
    isRecording = false;
    recordingWaves.classList.add('hidden');
    audioUiText.innerHTML = '<strong>Segure para falar</strong>';
    audioUiText.style.color = '#fff';
  }

  function resetAudioMode() {
    isAudioMode = false;
    isRecording = false;
    micBtn.style.color = '';
    micBtn.style.backgroundColor = '';
    
    inputField.classList.remove('hidden');
    audioUi.classList.add('hidden');
    
    isFocused = false;
    if (inputField.value.trim() === '') {
      typeEffect();
    } else {
      inputField.setAttribute('placeholder', '');
    }
  }
} else {
  micBtn.addEventListener('click', (e) => {
    e.preventDefault();
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
