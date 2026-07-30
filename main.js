const inputField = document.querySelector('.hero-textarea');
const sendBtn = document.getElementById('send-btn');

function handleSend() {
  if (inputField.value.trim() !== '') {
    alert('Pedido recebido: ' + inputField.value);
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
