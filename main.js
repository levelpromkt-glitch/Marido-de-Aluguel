const inputField = document.querySelector('.hero-textarea');
const submitBtn = document.querySelector('.submit-btn');

function handleSubmit() {
  if (inputField.value.trim() !== '') {
    alert('Comando recebido: ' + inputField.value);
    inputField.value = '';
  }
}

inputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
});

submitBtn.addEventListener('click', handleSubmit);
