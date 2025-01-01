document.addEventListener('DOMContentLoaded', function() {
    const usdInput = document.getElementById('usdAmount');
    const crcResult = document.getElementById('crcResult');
    const currentRate = document.getElementById('currentRate');
    const lastUpdate = document.getElementById('lastUpdate');
    const refreshButton = document.getElementById('refreshRate');

    // Format number with commas and 2 decimal places
    function formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    // Update the conversion result
    function updateResult() {
        const usdAmount = parseFloat(usdInput.value) || 0;
        const rate = parseFloat(currentRate.dataset.rate) || 0;
        const result = usdAmount * rate;
        crcResult.textContent = formatNumber(result);
    }

    // Fetch latest rate from the server
    async function fetchLatestRate() {
        try {
            const response = await fetch('/api/rate');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            currentRate.dataset.rate = data.rate;
            currentRate.textContent = formatNumber(data.rate);
            lastUpdate.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            updateResult();
        } catch (error) {
            console.error('Error fetching rate:', error);
            lastUpdate.textContent = `Update failed: ${error.message}`;
        }
    }

    // Event listeners
    usdInput.addEventListener('input', updateResult);
    refreshButton.addEventListener('click', fetchLatestRate);

    // Initialize
    updateResult();
    lastUpdate.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

    // Auto-refresh rate every 5 minutes
    setInterval(fetchLatestRate, 300000);
});
