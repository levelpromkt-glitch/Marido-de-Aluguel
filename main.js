const inputField = document.querySelector('.hero-textarea');

inputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (inputField.value.trim() !== '') {
      alert('Prompt enviado: ' + inputField.value);
      inputField.value = '';
    }
  }
});
