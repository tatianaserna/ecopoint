function initEvidenceForm() {
  const form = document.getElementById('evidence-form');
  const fileInput = document.getElementById('evidence-photo');
  const previewBox = document.getElementById('evidence-preview-box');
  const previewImg = document.getElementById('evidence-preview-img');
  const removeBtn = document.getElementById('btn-remove-evidence-photo');
  const statusEl = document.getElementById('evidence-status');

  if (!form) return;

  if (fileInput && previewBox && previewImg) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          previewImg.src = event.target.result;
          previewBox.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (fileInput) fileInput.value = '';
      if (previewImg) previewImg.src = '';
      if (previewBox) previewBox.style.display = 'none';
      if (statusEl) statusEl.textContent = '';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!statusEl) return;

    // Validación básica si no hay foto seleccionada
    if (fileInput && fileInput.files.length === 0) {
      statusEl.textContent = 'Por favor selecciona una foto de tu evidencia.';
      statusEl.style.color = '#d32f2f';
      return;
    }

    statusEl.textContent = 'Simulando envío y validación de evidencia...';
    statusEl.style.color = '#555';

    // Mock delay de red (800ms)
    setTimeout(() => {
      const materialSelect = form.querySelector('[name="material"]') || { value: 'Material reciclado' };
      const materialText = materialSelect.value || 'material reciclado';

      statusEl.textContent = `¡Evidencia mock registrada (${materialText})! +50 puntos sumados (simulado).`;
      statusEl.style.color = '#2e7d32';

      // Opcional: si tienes una función global para actualizar puntos en la UI, invócala aquí:
      // if (typeof addPointsGlobal === 'function') addPointsGlobal(50);

      // Limpiar UI opcionalmente tras unos segundos o dejar el estado visible
      form.reset();
      if (previewBox) previewBox.style.display = 'none';
    }, 800);
  });
}

// Auto-inicializar si ya está cargado el DOM o exportar
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initEvidenceForm === 'function') {
    initEvidenceForm();
  }
});
