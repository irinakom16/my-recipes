function transferFileToOriginalInput(originalInput, file) {
  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    originalInput.files = dataTransfer.files;
    originalInput.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (error) {
    alert('Файл выбран, но браузер не разрешил передать его в приложение. Попробуй открыть сайт в Chrome или Safari через меню «Файлы».');
  }
}

function getMainRecipeFileInput() {
  return Array.from(document.querySelectorAll('input[type="file"]')).find((input) => {
    if (input.closest('.import-backup')) return false;
    if (input.classList.contains('pdf-real-file-input')) return false;
    return Boolean(input.closest('.upload-box') || input.parentElement);
  });
}

function cleanDuplicatePdfButtons(uploadBox) {
  const rows = Array.from(uploadBox.querySelectorAll('.pdf-picker-buttons'));
  rows.slice(1).forEach((row) => row.remove());
}

function fixRecipePdfUploadInputs() {
  const input = getMainRecipeFileInput();
  if (!input) return;

  const uploadBox = input.closest('.upload-box') || input.parentElement;
  if (!uploadBox) return;

  cleanDuplicatePdfButtons(uploadBox);

  input.accept = 'image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,.pdf,text/plain,.txt,text/markdown,.md';
  input.removeAttribute('capture');

  if (uploadBox.querySelector('.pdf-picker-buttons')) return;

  const pdfInput = document.createElement('input');
  pdfInput.type = 'file';
  pdfInput.accept = 'application/pdf,.pdf,text/plain,.txt,text/markdown,.md';
  pdfInput.className = 'pdf-real-file-input';
  pdfInput.addEventListener('click', (event) => event.stopPropagation());
  pdfInput.addEventListener('change', () => {
    const file = pdfInput.files && pdfInput.files[0];
    if (file) transferFileToOriginalInput(input, file);
    pdfInput.value = '';
  });

  const photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.accept = 'image/*,.jpg,.jpeg,.png,.webp,.heic,.heif';
  photoInput.className = 'pdf-real-file-input';
  photoInput.addEventListener('click', (event) => event.stopPropagation());
  photoInput.addEventListener('change', () => {
    const file = photoInput.files && photoInput.files[0];
    if (file) transferFileToOriginalInput(input, file);
    photoInput.value = '';
  });

  const buttonRow = document.createElement('div');
  buttonRow.className = 'pdf-picker-buttons';

  const pdfButton = document.createElement('button');
  pdfButton.type = 'button';
  pdfButton.className = 'pdf-file-picker-helper';
  pdfButton.textContent = 'PDF / файл';
  pdfButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    pdfInput.click();
  });

  const photoButton = document.createElement('button');
  photoButton.type = 'button';
  photoButton.className = 'pdf-file-picker-helper secondary';
  photoButton.textContent = 'Фото';
  photoButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    photoInput.click();
  });

  buttonRow.append(pdfButton, photoButton, pdfInput, photoInput);
  uploadBox.appendChild(buttonRow);
}

function addPdfUploadFixStyle() {
  if (document.getElementById('pdf-upload-fix-style')) return;

  const style = document.createElement('style');
  style.id = 'pdf-upload-fix-style';
  style.textContent = `
    .pdf-picker-buttons {
      display: flex !important;
      gap: 8px !important;
      justify-content: center !important;
      flex-wrap: wrap !important;
      margin-top: 8px !important;
    }

    .pdf-real-file-input {
      display: none !important;
    }

    .pdf-file-picker-helper {
      border: 0 !important;
      border-radius: 14px !important;
      background: #8d9983 !important;
      color: #fffdf8 !important;
      font-weight: 900 !important;
      padding: 10px 14px !important;
      cursor: pointer !important;
      width: fit-content !important;
      align-self: center !important;
    }

    .pdf-file-picker-helper.secondary {
      background: #eef2ea !important;
      color: #26382b !important;
    }
  `;

  document.head.appendChild(style);
}

window.addEventListener('load', () => {
  addPdfUploadFixStyle();
  fixRecipePdfUploadInputs();

  document.addEventListener('click', () => {
    setTimeout(fixRecipePdfUploadInputs, 120);
    setTimeout(fixRecipePdfUploadInputs, 400);
  });

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(fixRecipePdfUploadInputs);
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
