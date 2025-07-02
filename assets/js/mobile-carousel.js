// Mobile Carousel Functionality
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const cards = document.querySelectorAll('.carousel-card');
    
    if (!carousel || cards.length === 0) return;
    
    let currentSlide = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    // Initialize carousel
    function initCarousel() {
        updateCarousel();
        setupEventListeners();
    }
    
    // Update carousel position
    function updateCarousel() {
        const slideWidth = 100 / cards.length;
        carousel.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Go to specific slide
    function goToSlide(slideIndex) {
        if (slideIndex < 0) {
            currentSlide = cards.length - 1;
        } else if (slideIndex >= cards.length) {
            currentSlide = 0;
        } else {
            currentSlide = slideIndex;
        }
        updateCarousel();
    }
    
    // Next slide
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    // Previous slide
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
        });
        
        // Touch events for swipe
        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Mouse events for desktop testing
        carousel.addEventListener('mousedown', handleMouseDown);
        carousel.addEventListener('mousemove', handleMouseMove);
        carousel.addEventListener('mouseup', handleMouseUp);
        carousel.addEventListener('mouseleave', handleMouseUp);
        
        // Prevent context menu on long press
        carousel.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyDown);
        
        // Auto-advance carousel (optional)
        setupAutoAdvance();
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        carousel.style.transition = 'none';
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        const slideWidth = carousel.offsetWidth;
        const slidePercentage = (diffX / slideWidth) * 100;
        const currentSlidePercentage = (currentSlide * 100) / cards.length;
        
        carousel.style.transform = `translateX(calc(-${currentSlidePercentage}% + ${slidePercentage}%))`;
    }
    
    function handleTouchEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        carousel.style.transition = 'transform 0.3s ease-in-out';
        
        const diffX = currentX - startX;
        const threshold = carousel.offsetWidth * 0.3; // 30% threshold
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            updateCarousel(); // Snap back to current slide
        }
    }
    
    // Mouse event handlers (for desktop testing)
    function handleMouseDown(e) {
        startX = e.clientX;
        currentX = startX;
        isDragging = true;
        carousel.style.transition = 'none';
        carousel.style.cursor = 'grabbing';
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        currentX = e.clientX;
        const diffX = currentX - startX;
        const slideWidth = carousel.offsetWidth;
        const slidePercentage = (diffX / slideWidth) * 100;
        const currentSlidePercentage = (currentSlide * 100) / cards.length;
        
        carousel.style.transform = `translateX(calc(-${currentSlidePercentage}% + ${slidePercentage}%))`;
    }
    
    function handleMouseUp() {
        if (!isDragging) return;
        
        isDragging = false;
        carousel.style.transition = 'transform 0.3s ease-in-out';
        carousel.style.cursor = 'grab';
        
        const diffX = currentX - startX;
        const threshold = carousel.offsetWidth * 0.3;
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            updateCarousel();
        }
    }
    
    // Keyboard navigation
    function handleKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    }
    
    // Auto-advance carousel (optional feature)
    function setupAutoAdvance() {
        let autoAdvanceInterval;
        
        function startAutoAdvance() {
            autoAdvanceInterval = setInterval(() => {
                nextSlide();
            }, 5000); // Change slide every 5 seconds
        }
        
        function stopAutoAdvance() {
            if (autoAdvanceInterval) {
                clearInterval(autoAdvanceInterval);
            }
        }
        
        // Start auto-advance
        startAutoAdvance();
        
        // Pause auto-advance on user interaction
        carousel.addEventListener('mouseenter', stopAutoAdvance);
        carousel.addEventListener('mouseleave', startAutoAdvance);
        carousel.addEventListener('touchstart', stopAutoAdvance);
        carousel.addEventListener('touchend', () => {
            setTimeout(startAutoAdvance, 2000); // Resume after 2 seconds
        });
        
        // Pause auto-advance when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoAdvance();
            } else {
                startAutoAdvance();
            }
        });
    }
    
    // Initialize the carousel
    initCarousel();
    
    // Add visual feedback for touch interactions
    cards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add accessibility features
    dots.forEach((dot, index) => {
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
            }
        });
    });
    
    // Add ARIA labels for screen readers
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Product carousel');
    carousel.setAttribute('aria-live', 'polite');
}); 