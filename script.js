// Caesar Cipher Application
class CaesarCipher {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    initializeElements() {
        // Input elements
        this.inputText = document.getElementById('inputText');
        this.shiftSlider = document.getElementById('shiftSlider');
        this.shiftNumber = document.getElementById('shiftNumber');
        this.shiftDisplay = document.querySelector('.shift-display');
        this.operationRadios = document.querySelectorAll('input[name="operation"]');
        
        // Output elements
        this.outputText = document.getElementById('outputText');
        this.operationType = document.getElementById('operationType');
        this.processingTime = document.getElementById('processingTime');
        this.charCount = document.getElementById('charCount');
        
        // Button elements
        this.clearButton = document.getElementById('clearInput');
        this.copyButton = document.getElementById('copyResult');
        
        // Toast element
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
    }

    bindEvents() {
        // Input text changes
        this.inputText.addEventListener('input', () => this.handleTextChange());
        this.inputText.addEventListener('paste', () => {
            setTimeout(() => this.handleTextChange(), 0);
        });

        // Shift value changes
        this.shiftSlider.addEventListener('input', () => this.handleShiftChange('slider'));
        this.shiftNumber.addEventListener('input', () => this.handleShiftChange('number'));

        // Operation changes
        this.operationRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleOperationChange());
        });

        // Button events
        this.clearButton.addEventListener('click', () => this.clearInput());
        this.copyButton.addEventListener('click', () => this.copyToClipboard());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handleTextChange() {
        const text = this.inputText.value;
        this.updateCharacterCount(text.length);
        this.processText();
    }

    handleShiftChange(source) {
        let newValue;
        
        if (source === 'slider') {
            newValue = parseInt(this.shiftSlider.value);
            this.shiftNumber.value = newValue;
        } else {
            newValue = parseInt(this.shiftNumber.value);
            if (newValue < 1) newValue = 1;
            if (newValue > 25) newValue = 25;
            this.shiftNumber.value = newValue;
            this.shiftSlider.value = newValue;
        }
        
        this.shiftDisplay.textContent = newValue;
        this.processText();
    }

    handleOperationChange() {
        this.updateOperationType();
        this.processText();
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+C or Cmd+C to copy result
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !this.inputText.contains(document.activeElement)) {
            e.preventDefault();
            this.copyToClipboard();
        }
        
        // Ctrl+L or Cmd+L to clear input
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            this.clearInput();
        }
    }

    updateCharacterCount(count) {
        this.charCount.textContent = count;
        
        // Color coding for character count
        const percentage = (count / 10000) * 100;
        if (percentage > 90) {
            this.charCount.style.color = 'var(--error-color)';
        } else if (percentage > 70) {
            this.charCount.style.color = 'var(--warning-color)';
        } else {
            this.charCount.style.color = 'var(--text-muted)';
        }
    }

    updateOperationType() {
        const selectedOperation = document.querySelector('input[name="operation"]:checked').value;
        const isEncrypt = selectedOperation === 'encrypt';
        this.operationType.textContent = isEncrypt ? 'Encrypting...' : 'Decrypting...';
    }

    processText() {
        const startTime = performance.now();
        const text = this.inputText.value;
        
        if (!text.trim()) {
            this.outputText.textContent = 'Your encrypted/decrypted text will appear here...';
            this.outputText.classList.add('empty');
            this.processingTime.textContent = '';
            this.operationType.textContent = this.getReadyMessage();
            return;
        }

        const shift = parseInt(this.shiftSlider.value);
        const operation = document.querySelector('input[name="operation"]:checked').value;
        
        let result;
        if (operation === 'encrypt') {
            result = this.encrypt(text, shift);
        } else {
            result = this.decrypt(text, shift);
        }
        
        const endTime = performance.now();
        const processingTimeMs = (endTime - startTime).toFixed(2);
        
        this.outputText.textContent = result;
        this.outputText.classList.remove('empty');
        this.processingTime.textContent = `${processingTimeMs}ms`;
        this.operationType.textContent = operation === 'encrypt' ? 'Encrypted' : 'Decrypted';
    }

    encrypt(text, shift) {
        return this.caesarShift(text, shift);
    }

    decrypt(text, shift) {
        return this.caesarShift(text, -shift);
    }

    caesarShift(text, shift) {
        return text.replace(/[a-zA-Z]/g, (char) => {
            const isUpperCase = char >= 'A' && char <= 'Z';
            const base = isUpperCase ? 65 : 97; // ASCII values for 'A' and 'a'
            const charCode = char.charCodeAt(0);
            
            // Normalize shift to 0-25 range
            const normalizedShift = ((shift % 26) + 26) % 26;
            
            // Apply shift
            const shiftedCode = ((charCode - base + normalizedShift) % 26) + base;
            
            return String.fromCharCode(shiftedCode);
        });
    }

    getReadyMessage() {
        const operation = document.querySelector('input[name="operation"]:checked').value;
        return operation === 'encrypt' ? 'Ready to encrypt' : 'Ready to decrypt';
    }

    clearInput() {
        this.inputText.value = '';
        this.inputText.focus();
        this.handleTextChange();
        this.showToast('Input cleared', 'info');
    }

    async copyToClipboard() {
        const text = this.outputText.textContent;
        
        if (!text || text === 'Your encrypted/decrypted text will appear here...') {
            this.showToast('Nothing to copy!', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Text copied to clipboard!', 'success');
            
            // Visual feedback on copy button
            this.copyButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.copyButton.style.transform = '';
            }, 150);
            
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Text copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy text', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        
        // Show the toast first
        this.toast.style.display = 'flex';
        
        // Update toast appearance based on type
        this.toast.className = 'toast';
        this.toast.classList.add('show');
        
        if (type === 'error') {
            this.toast.style.background = 'var(--error-color)';
        } else if (type === 'warning') {
            this.toast.style.background = 'var(--warning-color)';
        } else if (type === 'info') {
            this.toast.style.background = 'var(--primary-color)';
        } else {
            this.toast.style.background = 'var(--success-color)';
        }
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            this.toast.classList.remove('show');
            // Hide completely after animation
            setTimeout(() => {
                this.toast.style.display = 'none';
            }, 300);
        }, 3000);
    }

    updateUI() {
        // Initial setup
        this.updateOperationType();
        this.shiftDisplay.textContent = this.shiftSlider.value;
        this.updateCharacterCount(0);
        
        // Add entrance animations
        this.addEntranceAnimations();
    }

    addEntranceAnimations() {
        const animatedElements = document.querySelectorAll('.control-panel, .input-panel, .output-panel, .info-card, .feature-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach((element) => {
            observer.observe(element);
        });
    }
}

// Utility functions
class CipherUtils {
    static generateRandomText(length = 100) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    static analyzeText(text) {
        const analysis = {
            length: text.length,
            letters: (text.match(/[a-zA-Z]/g) || []).length,
            numbers: (text.match(/[0-9]/g) || []).length,
            spaces: (text.match(/\s/g) || []).length,
            special: text.length - (text.match(/[a-zA-Z0-9\s]/g) || []).length
        };
        
        return analysis;
    }

    static validateShift(shift) {
        const num = parseInt(shift);
        return !isNaN(num) && num >= 1 && num <= 25;
    }
}

// Enhanced features for advanced users
class AdvancedFeatures {
    static bruteForceDecrypt(ciphertext) {
        const results = [];
        for (let shift = 1; shift <= 25; shift++) {
            const cipher = new CaesarCipher();
            const decrypted = cipher.caesarShift(ciphertext, -shift);
            results.push({
                shift: shift,
                text: decrypted
            });
        }
        return results;
    }

    static frequencyAnalysis(text) {
        const frequencies = {};
        const letters = text.toLowerCase().match(/[a-z]/g) || [];
        
        letters.forEach(letter => {
            frequencies[letter] = (frequencies[letter] || 0) + 1;
        });
        
        // Sort by frequency
        return Object.entries(frequencies)
            .sort(([,a], [,b]) => b - a)
            .map(([letter, count]) => ({
                letter,
                count,
                percentage: ((count / letters.length) * 100).toFixed(2)
            }));
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            encryptionTimes: [],
            decryptionTimes: [],
            averageTime: 0
        };
    }

    recordTime(operation, time) {
        if (operation === 'encrypt') {
            this.metrics.encryptionTimes.push(time);
        } else {
            this.metrics.decryptionTimes.push(time);
        }
        
        this.updateAverage();
    }

    updateAverage() {
        const allTimes = [...this.metrics.encryptionTimes, ...this.metrics.decryptionTimes];
        if (allTimes.length > 0) {
            this.metrics.averageTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
        }
    }

    getReport() {
        return {
            totalOperations: this.metrics.encryptionTimes.length + this.metrics.decryptionTimes.length,
            averageTime: this.metrics.averageTime.toFixed(2),
            fastestTime: Math.min(...this.metrics.encryptionTimes, ...this.metrics.decryptionTimes).toFixed(2),
            slowestTime: Math.max(...this.metrics.encryptionTimes, ...this.metrics.decryptionTimes).toFixed(2)
        };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main application
    window.caesarApp = new CaesarCipher();
    window.performanceMonitor = new PerformanceMonitor();
    
    // Add some Easter eggs for developers
    console.log('%c🔐 Caesar Cipher App Loaded Successfully! 🔐', 'color: #667eea; font-size: 16px; font-weight: bold;');
    console.log('%cTry these developer commands:', 'color: #4a5568; font-size: 12px;');
    console.log('%c- CipherUtils.generateRandomText(50)', 'color: #718096; font-size: 11px;');
    console.log('%c- AdvancedFeatures.bruteForceDecrypt("KHOOR")', 'color: #718096; font-size: 11px;');
    console.log('%c- performanceMonitor.getReport()', 'color: #718096; font-size: 11px;');
    
    // Service Worker registration for PWA capabilities (if needed)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CaesarCipher, CipherUtils, AdvancedFeatures, PerformanceMonitor };
}
