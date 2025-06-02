function mostrarAlerta(type, title, message, duration = 5000) {
  let alertContainer = document.querySelector('.alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container';
    document.body.appendChild(alertContainer);
  }

  const icons = {
    primary: 'ℹ️',
    secondary: 'ℹ️',
    success: '✔️',
    danger: '❌',
    warning: '⚠️',
    info: '💡',
    light: '🔆',
    dark: '🌑'
  };

  const alert = document.createElement('div');
  alert.className = `custom-alert alert-${type}`;
  alert.innerHTML = `
        <span class="alert-icon">${icons[type]}</span>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="close-btn" onclick="removerAlerta(this.parentElement)">×</button>
    `;

  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.classList.add('show');
  }, 10);

  if (type !== 'danger') {
    setTimeout(() => {
      removeAlert(alert);
    }, duration);
  }
}

function mostrarModal(titulo, mensagem, callback) {
  jq('#modalOverlay, #colorbox').remove();

  const modalHTML = `
      <div id="modalOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 89 !important;"></div>
      <div id="colorbox" role="dialog" tabindex="-1" style="display: block; visibility: visible; top: 50%; left: 50%; transform: translate(-50%, -50%); position: fixed; width: 400px; height: 350px; background: white; z-index: 90 !important; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); padding: 16px; overflow: hidden;">
          <h2 style="margin: 0; text-align: center; padding: 3px 0; font-size: 18px;">${titulo}</h2>
          <div style="overflow: hidden;">
              ${mensagem}
              <div style="margin-top: 3px; text-align: center;">
                  <button type="button" class="btn btn-success close-modal-btn" style="padding: 6px 12px;">OK</button>
              </div>
          </div>
      </div>`;

  jq('body').append(modalHTML);

  jq('.close-modal-btn').on('click', function () {
    jq('#modalOverlay, #colorbox').remove();
    if (typeof callback === 'function') {
      callback();
    }
  });
}

function removerAlerta(alerta) {
  alerta.classList.add('fade-out');
  setTimeout(() => alerta.remove(), 500);
}
