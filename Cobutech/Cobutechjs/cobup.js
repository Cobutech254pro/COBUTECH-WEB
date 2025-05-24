document.addEventListener('DOMContentLoaded', () => {
    const dismissAllBtn = document.getElementById('dismissAllPromptsBtn');
    const promptsContainer = document.querySelector('.prompts-container'); 
    function hidePrompt(promptId) {
        const promptElement = document.getElementById(promptId);
        if (promptElement) {
            promptElement.style.display = 'none'; 
            console.log(`Prompt '${promptId}' dismissed.`);
        }
    }
    if (dismissAllBtn) {
        dismissAllBtn.addEventListener('click', () => {
            const promptCards = document.querySelectorAll('.prompt-card');
            promptCards.forEach(card => {
                hidePrompt(card.id);
            });
            dismissAllBtn.style.display = 'none'; 
            checkAndRedirectIfAllPromptsCompleted(); 
        });
    }
    async function fetchOnboardingStatus() { 
        try {
            const response = await fetch('/api/user/onboarding-status');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }
            const status = await response.json(); 
            if (status.hasProfilePicture) {
                hidePrompt('prompt-profile-picture');
            }
            if (status.hasCompletedProfile) {
                hidePrompt('prompt-complete-profile');
            }
            checkAndRedirectIfAllPromptsCompleted();
        } catch (error) {
            console.error('Failed to fetch onboarding status:', error);            
        }
    }
    function checkAndRedirectIfAllPromptsCompleted() {
        const visiblePrompts = document.querySelectorAll('.prompts-container .prompt-card:not([style*="display: none"])');
        if (visiblePrompts.length === 0) {
            if (promptsContainer) {
                promptsContainer.style.display = 'none'; 
            }
            if (dismissAllBtn) {
                dismissAllBtn.style.display = 'none'; 
            }
            console.log('All onboarding prompts completed. Redirecting to dashboard...');
            window.location.href = '../../../Cobutech/Cobutechhtml/cobuac.html';
        }
    }
    fetchOnboardingStatus();
});
