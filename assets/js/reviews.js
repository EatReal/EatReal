document.addEventListener('DOMContentLoaded', () => {
    const reviews = document.querySelectorAll('.review');
    if (reviews.length === 0) return;

    let currentIndex = 0;

    /* Redundant initialization log
    console.log('Reviews component initialized');
    */

    // Set initial active review
    reviews[0].classList.add('active');

    function cycleReviews() {
        /* Redundant debug log
        console.log('Cycling to next review');
        */
        
        // Remove active class from current review
        reviews[currentIndex].classList.remove('active');
        
        // Move to next review
        currentIndex = (currentIndex + 1) % reviews.length;
        
        // Add active class to new review
        reviews[currentIndex].classList.add('active');
    }

    // Auto cycle every 5 seconds
    setInterval(cycleReviews, 5000);
}); 