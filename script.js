// Melhorar acessibilidade no JavaScript
menuIcon.onclick = () => {
    const isExpanded = menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
    
    // Atualizar ARIA
    menuIcon.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    menuIcon.setAttribute('aria-label', isExpanded ? 'Fechar menu' : 'Abrir menu');
};

// Fechar menu ao clicar em link (mobile)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuIcon.classList.remove('bx-x');
        menuIcon.setAttribute('aria-expanded', 'false');
    });
});
