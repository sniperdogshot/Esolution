// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

// Create backdrop element for when menu is open
const backdrop = document.createElement('div');
backdrop.className = 'menu-backdrop';
document.body.appendChild(backdrop);

function setMenu(aberto) {
  navMenu.classList.toggle('active', aberto);
  backdrop.classList.toggle('active', aberto);
  mobileMenuBtn.classList.toggle('active', aberto);
  mobileMenuBtn.setAttribute('aria-expanded', aberto);
  mobileMenuBtn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');

  document.body.style.overflow = aberto ? 'hidden' : '';

  const icon = mobileMenuBtn.querySelector('i');
  icon.classList.toggle('fa-bars', !aberto);
  icon.classList.toggle('fa-times', aberto);
}

mobileMenuBtn.addEventListener('click', () => {
  setMenu(!navMenu.classList.contains('active'));
});

// Close menu when clicking on backdrop or pressing Esc
backdrop.addEventListener('click', () => setMenu(false));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('active')) {
    setMenu(false);
    mobileMenuBtn.focus();
  }
});

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 100);
}, { passive: true });

// Navegação do menu
document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {

    link.addEventListener('click', function (e) {

        const target = document.querySelector(this.getAttribute('href'));

        if (!target) return;

        e.preventDefault();

        const menuAberto = navMenu.classList.contains('active');
        setMenu(false);

        // Aguarda a animação do menu terminar
        setTimeout(() => {

            const y = target.getBoundingClientRect().top + window.pageYOffset - 80;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });

        }, menuAberto ? 300 : 0);

    });

});


// Animation on Scroll (o estilo fica em .fade-in / .fade-pending no CSS)
const fadeElems = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('fade-pending');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeElems.forEach(elem => {
  elem.classList.add('fade-pending');
  observer.observe(elem);
});

// Vídeo: só carrega e toca quando entra na tela
document.querySelectorAll('video[preload="none"]').forEach(video => {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { rootMargin: '200px' }).observe(video);
});

// Carousel functionality
function setupCarousels() {
  const carousels = document.querySelectorAll('.carousel-container');
  const isMobile = window.innerWidth <= 768;

  carousels.forEach(carousel => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentSlide = 0;

    // Add navigation arrows to the carousel
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';

    const prevArrow = document.createElement('button');
    prevArrow.type = 'button';
    prevArrow.className = 'carousel-arrow prev';
    prevArrow.setAttribute('aria-label', 'Foto anterior');
    prevArrow.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';

    const nextArrow = document.createElement('button');
    nextArrow.type = 'button';
    nextArrow.className = 'carousel-arrow next';
    nextArrow.setAttribute('aria-label', 'Próxima foto');
    nextArrow.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';

    nav.appendChild(prevArrow);
    nav.appendChild(nextArrow);
    carousel.appendChild(nav);

    const showSlide = (index, direction = '') => {
      slides.forEach(slide => {
        slide.classList.remove('active', 'swipe-left', 'swipe-right');
      });

      slides[index].classList.add('active');

      if (direction === 'left') slides[index].classList.add('swipe-left');
      else if (direction === 'right') slides[index].classList.add('swipe-right');

      dots.forEach(dot => dot.classList.remove('active'));
      dots[index].classList.add('active');

      currentSlide = index;
    };

    const prevSlide = () => {
      const newIndex = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(newIndex, 'right');
    };

    const nextSlide = () => {
      const newIndex = (currentSlide + 1) % slides.length;
      showSlide(newIndex, 'left');
    };

    prevArrow.addEventListener('click', prevSlide);
    nextArrow.addEventListener('click', nextSlide);

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        showSlide(parseInt(dot.dataset.index, 10));
      });
    });

    if (isMobile) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let moveX = 0;
      let moveY = 0;
      let isHorizontalSwipe = false;
      const threshold = 50;
      const directionThreshold = 10;

      function handleTouchStart(e) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isHorizontalSwipe = false;
      }

      function handleTouchMove(e) {
        if (!isDragging) return;

        moveX = e.touches[0].clientX - startX;
        moveY = e.touches[0].clientY - startY;

        if (!isHorizontalSwipe &&
          (Math.abs(moveX) > directionThreshold || Math.abs(moveY) > directionThreshold)) {
          isHorizontalSwipe = Math.abs(moveX) > Math.abs(moveY);
        }

        if (isHorizontalSwipe) e.preventDefault();
      }

      function handleTouchEnd(e) {
        if (!isDragging) return;

        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (isHorizontalSwipe && Math.abs(diff) > threshold) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }

        isDragging = false;
      }

      carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
      carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
      carousel.addEventListener('touchend', handleTouchEnd);
    }
  });
}

document.addEventListener('DOMContentLoaded', setupCarousels);

// Simulador de economia
const WHATSAPP_NUMERO = '5585981546006';

const campoConta = document.getElementById('consumo');
const btnCalcular = document.getElementById('btnCalcular');
const btnOrcamento = document.getElementById('btnOrcamento');

function formatarReais(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function calcularEconomia() {

    const valorContaMensal = parseFloat(campoConta.value);

    if (!(valorContaMensal > 0)) return;

    const K6 = 0.3420;
    const K7 = 0.6428;
    const K8 = 0.9848;
    const GD = 0.35;

    // Descobre o consumo mensal em kWh
    const consumoMensal = valorContaMensal / K8;

    // Consumo anual
    const consumoAnual = consumoMensal * 12;

    // Economia após a instalação
    const economiaAnual =
        consumoAnual * GD * K8 +
        consumoAnual * (1 - GD) * K6 +
        consumoAnual * (1 - GD) * K7 * GD;

    const economiaMensal = economiaAnual / 12;

    // Nova conta = conta antiga - economia
    const novaContaMensal = valorContaMensal - economiaMensal;
    const novaContaAnual = (valorContaMensal * 12) - economiaAnual;

    document.getElementById("resultado").textContent =
        consumoMensal.toFixed(0) + " kWh/mês";

    document.getElementById("novaConta").textContent = formatarReais(novaContaMensal);
    document.getElementById("novaContaAnual").textContent = formatarReais(novaContaAnual);
    document.getElementById("economiaMensal").textContent = formatarReais(economiaMensal);
    document.getElementById("economiaAnual").textContent = formatarReais(economiaAnual);

    // Botão de orçamento já com os números da simulação
    const mensagem =
        "Olá! Fiz a simulação no site: minha conta de luz é de " +
        formatarReais(valorContaMensal) + " por mês e a economia estimada foi de " +
        formatarReais(economiaAnual) + " no 1º ano. Gostaria de um orçamento.";

    btnOrcamento.href =
        "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensagem);
    btnOrcamento.hidden = false;

    if (window.trackSimulacao) trackSimulacao(valorContaMensal);
}

// Formulário do hero: leva o valor para o simulador completo e mostra o resultado
document.getElementById('heroForm').addEventListener('submit', e => {
    e.preventDefault();

    const valor = document.getElementById('heroConta').value;

    campoConta.value = valor;
    btnCalcular.disabled = !(parseFloat(valor) > 0);

    if (btnCalcular.disabled) {
        document.getElementById('heroConta').focus();
        return;
    }

    calcularEconomia();

    // Rola até o resultado, para o botão do WhatsApp ficar à vista também no celular
    const destino = document.querySelector('.resultado');
    window.scrollTo({
        top: destino.getBoundingClientRect().top + window.pageYOffset - 90,
        behavior: 'smooth'
    });
});

// Barra fixa do celular: só aparece depois que o hero sai da tela
const barraAcao = document.getElementById('barraAcao');

new IntersectionObserver((entries) => {
    barraAcao.classList.toggle('visivel', !entries[0].isIntersecting);
}, { threshold: 0.15 }).observe(document.querySelector('.hero'));

campoConta.addEventListener('input', () => {
    btnCalcular.disabled = !(parseFloat(campoConta.value) > 0);
});

document.getElementById('simuladorForm').addEventListener('submit', e => {
    e.preventDefault();
    calcularEconomia();
});
