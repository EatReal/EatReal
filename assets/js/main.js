document.addEventListener('DOMContentLoaded', () => {
    const buyButtons = document.querySelectorAll('.buy-button');
    const modal = document.querySelector('.modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeModal = document.querySelector('.close-modal');
    const modalMessage = document.querySelector('#modal-message');

    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.closest('.product-info').querySelector('h2').textContent;
            modalMessage.textContent = `Processing purchase for ${productName}...`;
            showModal();
        });
    });

    closeModal?.addEventListener('click', hideModal);
    modalOverlay?.addEventListener('click', hideModal);

    function showModal() {
        modalOverlay.style.display = 'block';
        modal.style.display = 'block';
    }

    function hideModal() {
        modalOverlay.style.display = 'none';
        modal.style.display = 'none';
    }
});
