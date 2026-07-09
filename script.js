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
    mobileMenuBtn.classList.toggle('active'); // Add active class to the button too
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : ''; // Prevent scrolling when menu is open
    
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

// Close menu when clicking on a nav link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuBtn.classList.remove('active');
        
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Close mobile menu if open
            navMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
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
}, {
    threshold: 0.1
});

fadeElems.forEach(elem => {
    elem.style.opacity = 0;
    elem.style.transform = 'translateY(20px)';
    elem.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(elem);
});

// Facebook Pixel Event Tracking
document.querySelectorAll('a[href^="https://app.tecnofit.com.br"]').forEach(link => {
    link.addEventListener('click', function() {
        fbq('track', 'InitiateCheckout');
    });
});

// Carousel functionality
function setupCarousels() {
    const carousels = document.querySelectorAll('.carousel-container');
    const isMobile = window.innerWidth <= 768; // Detect mobile device
    
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

        // Function to show a specific slide
        const showSlide = (index, direction = '') => {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active', 'swipe-left', 'swipe-right');
            });
            
            // Show the selected slide with animation if direction is specified
            slides[index].classList.add('active');
            if (direction === 'left') {
                slides[index].classList.add('swipe-left');
            } else if (direction === 'right') {
                slides[index].classList.add('swipe-right');
            }
            
            // Update active dot
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            
            currentSlide = index;
        };
        
        // Navigate to previous slide
        const prevSlide = () => {
            const newIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(newIndex, 'right'); // Animation from right
        };
        
        // Navigate to next slide
        const nextSlide = () => {
            const newIndex = (currentSlide + 1) % slides.length;
            showSlide(newIndex, 'left'); // Animation from left
        };

        // Set up click events for arrows
        prevArrow.addEventListener('click', prevSlide);
        nextArrow.addEventListener('click', nextSlide);

        // Set up click event for dots
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                showSlide(parseInt(dot.dataset.index));
            });
        });

        // Only add touch events for mobile devices
        if (isMobile) {
            // Define touch variables
            let isDragging = false;
            let startX = 0;
            let startY = 0;
            let moveX = 0;
            let moveY = 0;
            let isHorizontalSwipe = false;
            const threshold = 50;
            const directionThreshold = 10; // Minimum distance to determine swipe direction

            function handleTouchStart(e) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isHorizontalSwipe = false; // Reset direction detection
            }
            
            function handleTouchMove(e) {
                if (!isDragging) return;
                
                moveX = e.touches[0].clientX - startX;
                moveY = e.touches[0].clientY - startY;
                
                // Determine if this is a horizontal or vertical swipe
                // Only set direction once we have enough movement to determine
                if (!isHorizontalSwipe && (Math.abs(moveX) > directionThreshold || Math.abs(moveY) > directionThreshold)) {
                    isHorizontalSwipe = Math.abs(moveX) > Math.abs(moveY);
                }
                
                // Only prevent default for horizontal swipes
                if (isHorizontalSwipe) {
                    e.preventDefault();
                }
            }
            
            function handleTouchEnd(e) {
                if (!isDragging) return;
                
                endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                // Only process as a carousel swipe if it was determined to be horizontal
                if (isHorizontalSwipe && Math.abs(diff) > threshold) {
                    // Right to left swipe (next slide)
                    if (diff > 0) {
                        nextSlide();
                    } 
                    // Left to right swipe (previous slide)
                    else {
                        prevSlide();
                    }
                }
                
                isDragging = false;
            }
            
            // Add touch event listeners for mobile
            carousel.addEventListener('touchstart', handleTouchStart, {passive: true});
            carousel.addEventListener('touchmove', handleTouchMove, {passive: false});
            carousel.addEventListener('touchend', handleTouchEnd);
        }
    });
}

// Initialize carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', setupCarousels);
