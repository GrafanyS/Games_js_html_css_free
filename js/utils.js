// Обработчик кликов по соцсетям
document.querySelectorAll('.social-icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    soundManager.play('click');
    
    const type = e.target.classList.contains('github') ? 'github' :
                 e.target.classList.contains('vk') ? 'vk' :
                 'telegram';
    
    switch(type) {
      case 'github':
        window.open('https://github.com/GrafanyS/Games_js_html_css_free', '_blank');
        break;
      case 'vk':
        window.open('https://vk.com', '_blank');
        break;
      case 'telegram':
        window.open('https://web.telegram.org', '_blank');
        break;
    }
  });
});
