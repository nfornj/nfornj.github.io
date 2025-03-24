// Google Analytics Visitor Counter
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the visitor counter
    initVisitorCounter();
});

function initVisitorCounter() {
    // Check if the visitor counter element exists
    const counterElement = document.getElementById('visitor-counter');
    if (!counterElement) return;
    
    // First, try to get cached visitor count
    const cachedCount = localStorage.getItem('visitorCount');
    const cachedTimestamp = localStorage.getItem('visitorCountTimestamp');
    const now = new Date().getTime();
    
    // If we have a cached count less than 1 hour old, use it
    if (cachedCount && cachedTimestamp && (now - cachedTimestamp < 3600000)) {
        counterElement.textContent = formatNumber(cachedCount);
        counterElement.classList.remove('loading');
    } else {
        // Otherwise show loading state
        counterElement.textContent = "...";
        counterElement.classList.add('loading');
        
        // Simulate fetching from GA (in production, you'd use the actual Google Analytics API)
        // This is a placeholder for demonstration
        simulateGAFetch().then(count => {
            counterElement.textContent = formatNumber(count);
            counterElement.classList.remove('loading');
            
            // Cache the count
            localStorage.setItem('visitorCount', count);
            localStorage.setItem('visitorCountTimestamp', now);
        }).catch(error => {
            console.error('Error fetching visitor count:', error);
            counterElement.textContent = "Unable to load";
            counterElement.classList.remove('loading');
        });
    }
    
    // Add random visitor incrementing to simulate real-time updates
    // (Only for demonstration purposes)
    startVisitorCountSimulation(counterElement);
}

// This function would be replaced with actual GA API calls
function simulateGAFetch() {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Generate a random but realistic-looking visitor count
            // In production, this would be your actual GA data
            const baseCount = Math.floor(Math.random() * 500) + 100;
            resolve(baseCount);
        }, 1000);
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function startVisitorCountSimulation(counterElement) {
    // This is just for demonstration - to simulate visitor count increasing
    // Remove this in production with real GA API
    setInterval(() => {
        const currentCount = parseInt(counterElement.textContent.replace(/,/g, ''));
        if (!isNaN(currentCount)) {
            // Add random visitors occasionally
            if (Math.random() > 0.7) {
                const newVisitors = Math.floor(Math.random() * 3) + 1;
                const newCount = currentCount + newVisitors;
                counterElement.textContent = formatNumber(newCount);
                
                // Update cache
                localStorage.setItem('visitorCount', newCount);
                localStorage.setItem('visitorCountTimestamp', new Date().getTime());
                
                // Add a small visual effect
                counterElement.classList.add('counter-updated');
                setTimeout(() => {
                    counterElement.classList.remove('counter-updated');
                }, 1000);
            }
        }
    }, 20000); // Check every 20 seconds
}

// For a production implementation, you'd use the Google Analytics Data API
// https://developers.google.com/analytics/devguides/reporting/data/v1
// Example implementation would require OAuth2 authentication and proper API calls 