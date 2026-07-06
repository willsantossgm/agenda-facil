/* landing.js - Lógica e Animações da Landing Page da plataforma AgendaFácil */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Accordion do FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Fecha todos os outros antes de abrir o atual
      faqItems.forEach(i => i.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 2. Animação de Entrada ao Rolar a Tela (Scroll Reveal)
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Uma vez animado, não precisa reavaliar
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15, // Gatilho dispara quando 15% do elemento estiver visível
    rootMargin: '0px 0px -50px 0px' // Margem na parte inferior para iniciar antes
  });

  revealElements.forEach(el => {
    revealOnScroll.observe(el);
  });
});
