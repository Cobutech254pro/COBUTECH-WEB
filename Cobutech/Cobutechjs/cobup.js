document.addEventListener('DOMContentLoaded', () => {
    const dismissAllBtn = document.getElementById('dismissAllPromptsBtn');
    const promptsContainer = document.querySelector('.prompts-container'); // Get the main container

    function hidePrompt(promptId) {
        const promptElement = document.getElementById(promptId);
        if (promptElement) {
            promptElement.style.display = 'none'; // Or add a 'hidden' class
            // In a real app, you'd send an API call to the backend
            // to mark this prompt as dismissed for the user.
            console.log(`Prompt '${promptId}' dismissed.`);
        }
    }

    if (dismissAllBtn) {
        dismissAllBtn.addEventListener('click', () => {
            const promptCards = document.querySelectorAll('.prompt-card');
            promptCards.forEach(card => {
                hidePrompt(card.id);
            });

            dismissAllBtn.style.display = 'none'; // Hide the "Dismiss All" button
            checkAndRedirectIfAllPromptsCompleted(); // Check and redirect after dismissing all
        });
    }

    async function fetchOnboardingStatus() { // <-- Added missing '{' here
        try {
            // Replace with your actual API endpoint to get user's onboarding progress
            // This endpoint would return an object like { hasProfilePicture: true, hasCompletedProfile: false, ... }
            const response = await fetch('/api/user/onboarding-status');
            if (!response.ok) {
                // Log the error response from the server if not ok
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }
            const status = await response.json(); // e.g., { hasProfilePicture: true, hasCompletedProfile: false, ... }

            // Hide prompts based on backend status
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

    // New function to check if all prompts are completed and redirect
    function checkAndRedirectIfAllPromptsCompleted() {
        // This selects all prompt cards that are *not* hidden
        const visiblePrompts = document.querySelectorAll('.prompts-container .prompt-card:not([style*="display: none"])');

        if (visiblePrompts.length === 0) {
            // All prompts are hidden or completed
            if (promptsContainer) {
                promptsContainer.style.display = 'none'; // Hide the entire prompt section
            }
            if (dismissAllBtn) {
                dismissAllBtn.style.display = 'none'; // Ensure dismiss button is hidden
            }

            // Redirect the user to the account dashboard
            console.log('All onboarding prompts completed. Redirecting to dashboard...');
            window.location.href = '/account/userhtml';
        }
    }

    // Call the function when the page loads to check initial status
    fetchOnboardingStatus();
});
