$(document).ready(function () {
  $('#aHeaderMenuHomeName').text('');
  // Inicializa o sistema de temas
  initThemeSystem();
});

/**
 * Inicializa o sistema de temas (claro/escuro)
 * Gerencia a criação do botão, aplicação do tema salvo e alternância de temas
*/
function initThemeSystem() {
  const toggleBtn = `
  <li class="nav-item d-none d-lg-block" title="Alternar tema">
  <a href="javascript:void(0)" id="toggleThemeBtn" class="nav-link">
  <svg id="themeIcon" class="ico-md" focusable="true">
  <use xlink:href="#moon"></use>
  </svg>
  </a>
  </li>
  `;

  $('.navbar-nav.navbar-right').prepend(toggleBtn);


  function updateThemeIcon(isDark) {
    const iconRef = isDark ? '#sun' : '#moon';
    $('#themeIcon use').attr('xlink:href', iconRef);
  }

  // Aplica tema salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    $('body').addClass('tema-escuro');
    updateThemeIcon(true);
  } else {
    $('body').removeClass('tema-escuro');
    updateThemeIcon(false);
  }

  $('#toggleThemeBtn').on('click', function () {
    const isDark = $('body').toggleClass('tema-escuro').hasClass('tema-escuro');
    updateThemeIcon(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

/**
 * Estiliza o input de pesquisa do usuário
 * Aplica estilos diretamente no elemento input
 * Utiliza recursão para tentar novamente se o elemento não estiver disponível imediatamente
**/
function styleInput() {
  const $userSearch = $('#userSearch')[0];
  const input = $userSearch?.shadowRoot?.querySelector('.form-control');
  if (input) {
    // Aplica estilos diretamente
    $(input).css({
      'height': '2.6rem',
      'color': '#ffffff',
      'background-color': '#1e1e1e',
      'border-color': '#1e1e1e',
    });

    $(input).hover(
      function () {
        $(this).css('box-shadow', '0 0 6px var(--cor-principal)');
      }
    );

  } else {
    // Tenta novamente depois de um tempo
    setTimeout(styleInput, 100);
  }
};