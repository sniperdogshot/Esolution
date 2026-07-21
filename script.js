// Mobile Menu Toggle - Updated
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

// Create backdrop element for when menu is open
const backdrop = document.createElement('div');
backdrop.className = 'menu-backdrop';
document.body.appendChild(backdrop);

// Toggle menu and backdrop
mobileMenuBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  backdrop.classList.toggle('active');
  mobileMenuBtn.classList.toggle('active');

  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  
  const icon = mobileMenuBtn.querySelector('i');
  if (icon.classList.contains('fa-bars')) {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-times');
  } else {
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
  }
});

// Close menu when clicking on backdrop
backdrop.addEventListener('click', () => {
  navMenu.classList.remove('active');
  backdrop.classList.remove('active');
  document.body.style.overflow = '';
  mobileMenuBtn.classList.remove('active');

  const icon = mobileMenuBtn.querySelector('i');
  icon.classList.remove('fa-times');
  icon.classList.add('fa-bars');
});

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

// Navegação do menu
document.querySelectorAll('.nav-menu a').forEach(link => {

    link.addEventListener('click', function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        if (!target) return;

        // Fecha o menu
        navMenu.classList.remove('active');
        backdrop.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';

        // Volta o ícone
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');

        // Aguarda a animação do menu terminar
        setTimeout(() => {

            const y = target.getBoundingClientRect().top + window.pageYOffset - 80;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });

        }, 300);

    });

});


// Animation on Scroll
const fadeElems = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeElems.forEach(elem => {
  elem.style.opacity = 0;
  elem.style.transform = 'translateY(20px)';
  elem.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(elem);
});

// Facebook Pixel Event Tracking
document.querySelectorAll('a[href^="https://app.tecnofit.com.br"]').forEach(link => {
  link.addEventListener('click', function () {
    if (window.fbq) fbq('track', 'InitiateCheckout');
  });
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

    const prevArrow = document.createElement('div');
    prevArrow.className = 'carousel-arrow prev';
    prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const nextArrow = document.createElement('div');
    nextArrow.className = 'carousel-arrow next';
    nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';

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


function calcularEnergia() {

    const potencia = Number(document.getElementById("potencia").value);
    const quantidade = Number(document.getElementById("quantidade").value);
    const conta = Number(document.getElementById("conta").value);

    // Geração de energia 
    const geracao = (potencia * quantidade * 6 * 30 * 0.75) / 1000;

    document.getElementById("resultado").innerHTML =
        geracao.toFixed(0) + " kWh/mês";

    // Economia (80%)
    const percentualEconomia = 0.80;

    const economiaMensal = conta * percentualEconomia;
    const novaConta = conta - economiaMensal;
    const economiaAnual = economiaMensal * 12;

    document.getElementById("contaAtual").innerHTML =
        conta.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    document.getElementById("novaConta").innerHTML =
        novaConta.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    document.getElementById("economiaMensal").innerHTML =
        economiaMensal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    document.getElementById("economiaAnual").innerHTML =
        economiaAnual.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
}