class ESP32Monitor {
    constructor() {
        this.ip = localStorage.getItem('esp32_ip') || '';
        this.autoFetchInterval = null;
        this.isAutoFetching = false;
        
        // DOM Elements
        this.ipInput = document.getElementById('ipInput');
        this.saveIpBtn = document.getElementById('saveIpBtn');
        this.fetchBtn = document.getElementById('fetchBtn');
        this.autoFetchBtn = document.getElementById('autoFetchBtn');
        this.temperatureValue = document.getElementById('temperatureValue');
        this.humidityValue = document.getElementById('humidityValue');
        this.errorMessage = document.getElementById('errorMessage');
        this.status = document.getElementById('status');

        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        this.ipInput.value = this.ip;
        this.updateAutoFetchButtonState();
    }

    setupEventListeners() {
        this.saveIpBtn.addEventListener('click', () => this.saveIP());
        this.fetchBtn.addEventListener('click', () => this.fetchData());
        this.autoFetchBtn.addEventListener('click', () => this.toggleAutoFetch());
    }

    saveIP() {
        this.ip = this.ipInput.value.trim();
        localStorage.setItem('esp32_ip', this.ip);
        this.showStatus('IP Address saved!');
    }

    async fetchData() {
        if (!this.ip) {
            this.showError('Please enter an IP address first');
            return;
        }

        try {
            const response = await fetch(`http://${this.ip}/data`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.updateDisplay(data);
            this.clearError();
            this.showStatus('Data updated successfully');
        } catch (error) {
            this.showError(`Failed to fetch data: ${error.message}`);
            console.error('Error:', error);
        }
    }

    updateDisplay(data) {
        this.temperatureValue.textContent = `${data.temperature.toFixed(1)} °C`;
        this.humidityValue.textContent = `${data.humidity.toFixed(1)} %`;
    }

    toggleAutoFetch() {
        if (this.isAutoFetching) {
            this.stopAutoFetch();
        } else {
            this.startAutoFetch();
        }
    }

    startAutoFetch() {
        this.isAutoFetching = true;
        this.autoFetchInterval = setInterval(() => this.fetchData(), 2000);
        this.updateAutoFetchButtonState();
        this.showStatus('Auto fetch started');
    }

    stopAutoFetch() {
        this.isAutoFetching = false;
        clearInterval(this.autoFetchInterval);
        this.updateAutoFetchButtonState();
        this.showStatus('Auto fetch stopped');
    }

    updateAutoFetchButtonState() {
        this.autoFetchBtn.textContent = this.isAutoFetching ? 'Stop Auto Fetch' : 'Start Auto Fetch';
        this.autoFetchBtn.classList.toggle('active', this.isAutoFetching);
    }

    showError(message) {
        this.errorMessage.textContent = message;
    }

    clearError() {
        this.errorMessage.textContent = '';
    }

    showStatus(message) {
        this.status.textContent = message;
        setTimeout(() => {
            this.status.textContent = '';
        }, 3000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ESP32Monitor();
});
