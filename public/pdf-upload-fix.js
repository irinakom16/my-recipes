function fixRecipePdfUploadInputs() {
  const inputs = Array.from(document.querySelectorAll('input[type="file"]'));

  inputs.forEach((input) => {
    if (input.closest('.import-backup')) return;
    if (input.dataset.pdfUploadFixed === '1') return;

    const uploadBox = input.closest('.upload-box') || input.parentElement;
    if (!uploadBox) return;

    input.accept = 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.heic,.heif';
    input.removeAttribute('capture');
    input.dataset.pdfUploadFixed = '1';

    const helper = document.createElement('button');
    helper.type = 'button';
    helper.className = 'pdf-file-picker-helper';
    helper.textContent = 'Выбрать PDF / файл';
    helper.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      input.click();
    });

    uploadBox.appendChild(helper);
  });
}

function addPdfUploadFixStyle() {
  if (document.getElementById('pdf-upload-fix-style')) return;

  const style = document.createElement('style');
  style.id = 'pdf-upload-fix-style';
  style.textContent = `
    .pdf-file-picker-helper {
      border: 0 !important;
      border-radius: 14px !important;
      background: #eef2ea !important;
      color: #26382b !important;
      font-weight: 900 !important;
      padding: 10px 14px !important;
      margin-top: 8px !important;
      cursor: pointer !important;
      width: fit-content !important;
      align-self: center !important;
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
