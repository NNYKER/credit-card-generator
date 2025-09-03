// Credit Card Generator Implementation
class CreditCardGenerator {
    constructor() {
        this.cardPrefixes = {
            visa: ['4'],
            mastercard: ['51', '52', '53', '54', '55', '2221', '2222', '2223', '2224', '2225', '2226', '2227', '2228', '2229', '223', '224', '225', '226', '227', '228', '229', '23', '24', '25', '26', '270', '271', '2720'],
            amex: ['34', '37'],
            discover: ['6011', '622126', '622127', '622128', '622129', '62213', '62214', '62215', '62216', '62217', '62218', '62219', '6222', '6223', '6224', '6225', '6226', '6227', '6228', '644', '645', '646', '647', '648', '649', '65'],
            diners: ['300', '301', '302', '303', '304', '305', '36', '38'],
            maestro: ['5018', '5020', '5038', '5893', '6304', '6759', '6761', '6762', '6763'],
            unionpay: ['62', '88']
        };

        this.cardLengths = {
            visa: [13, 16, 19],
            mastercard: [16],
            amex: [15],
            discover: [16],
            diners: [14],
            maestro: [12, 13, 14, 15, 16, 17, 18, 19],
            unionpay: [16, 17, 18, 19]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabSwitching();
    }

    setupEventListeners() {
        // Generate buttons
        document.getElementById('basic-generate').addEventListener('click', () => this.generateCards('basic'));
        document.getElementById('advance-generate').addEventListener('click', () => this.generateCards('advance'));

        // Copy and Reset buttons
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetResults());

        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Checkbox dependencies
        this.setupCheckboxDependencies();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    setupCheckboxDependencies() {
        // Basic tab checkboxes
        const basicDateCheckbox = document.getElementById('basic-date');
        const basicCvvCheckbox = document.getElementById('basic-cvv');

        basicDateCheckbox.addEventListener('change', () => {
            const monthSelect = document.getElementById('basic-month');
            const yearSelect = document.getElementById('basic-year');
            monthSelect.disabled = !basicDateCheckbox.checked;
            yearSelect.disabled = !basicDateCheckbox.checked;
        });

        basicCvvCheckbox.addEventListener('change', () => {
            const cvvInput = document.getElementById('basic-cvv-input');
            cvvInput.disabled = !basicCvvCheckbox.checked;
        });

        // Advance tab checkboxes
        const advanceDateCheckbox = document.getElementById('advance-date');
        const advanceCvvCheckbox = document.getElementById('advance-cvv');
        const advanceMoneyCheckbox = document.getElementById('advance-money');

        advanceDateCheckbox.addEventListener('change', () => {
            const monthSelect = document.getElementById('advance-month');
            const yearSelect = document.getElementById('advance-year');
            monthSelect.disabled = !advanceDateCheckbox.checked;
            yearSelect.disabled = !advanceDateCheckbox.checked;
        });

        advanceCvvCheckbox.addEventListener('change', () => {
            const cvvInput = document.getElementById('advance-cvv-input');
            cvvInput.disabled = !advanceCvvCheckbox.checked;
        });

        advanceMoneyCheckbox.addEventListener('change', () => {
            const currencySelect = document.getElementById('advance-currency');
            const balanceSelect = document.getElementById('advance-balance');
            currencySelect.disabled = !advanceMoneyCheckbox.checked;
            balanceSelect.disabled = !advanceMoneyCheckbox.checked;
        });
    }

    generateCards(mode) {
        const button = document.getElementById(`${mode}-generate`);
        const originalText = button.textContent;
        
        // Show loading state
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span>Generating...';

        // Simulate processing time
        setTimeout(() => {
            try {
                const config = this.getGenerationConfig(mode);
                const cards = this.generateCreditCards(config);
                this.displayResults(cards, config.format);
                
                button.disabled = false;
                button.textContent = originalText;
            } catch (error) {
                this.showError('Error generating cards: ' + error.message);
                button.disabled = false;
                button.textContent = originalText;
            }
        }, 1000);
    }

    getGenerationConfig(mode) {
        const config = {
            mode: mode,
            quantity: parseInt(document.getElementById(`${mode}-quantity`).value),
            format: document.getElementById(`${mode}-format`).value,
            includeDate: document.getElementById(`${mode}-date`).checked,
            includeCvv: document.getElementById(`${mode}-cvv`).checked,
            month: document.getElementById(`${mode}-month`).value,
            year: document.getElementById(`${mode}-year`).value,
            cvv: document.getElementById(`${mode}-cvv-input`).value
        };

        if (mode === 'basic') {
            config.network = document.getElementById('basic-network').value;
        } else {
            config.bin = document.getElementById('advance-bin').value;
            config.includeMoney = document.getElementById('advance-money').checked;
            config.currency = document.getElementById('advance-currency').value;
            config.balance = document.getElementById('advance-balance').value;
        }

        return config;
    }

    generateCreditCards(config) {
        const cards = [];

        for (let i = 0; i < config.quantity; i++) {
            const card = this.generateSingleCard(config);
            cards.push(card);
        }

        return cards;
    }

    generateSingleCard(config) {
        let cardNumber;
        let cardType;

        if (config.mode === 'basic') {
            if (config.network === 'random') {
                const networks = Object.keys(this.cardPrefixes);
                cardType = networks[Math.floor(Math.random() * networks.length)];
            } else {
                cardType = config.network;
            }
            cardNumber = this.generateCardNumber(cardType);
        } else {
            // Advanced mode with BIN
            if (config.bin) {
                cardNumber = this.generateCardNumberFromBin(config.bin);
                cardType = this.detectCardType(config.bin);
            } else {
                // Random if no BIN specified
                const networks = Object.keys(this.cardPrefixes);
                cardType = networks[Math.floor(Math.random() * networks.length)];
                cardNumber = this.generateCardNumber(cardType);
            }
        }

        const card = {
            number: cardNumber,
            type: cardType
        };

        // Add expiration date if enabled
        if (config.includeDate) {
            card.month = config.month === 'random' ? this.getRandomMonth() : config.month;
            card.year = config.year === 'random' ? this.getRandomYear() : config.year;
        }

        // Add CVV if enabled
        if (config.includeCvv) {
            card.cvv = config.cvv || this.generateCvv(cardType);
        }

        // Add money info for advanced mode
        if (config.mode === 'advance' && config.includeMoney && config.currency) {
            card.currency = config.currency;
            card.balance = this.generateBalance(config.balance);
        }

        return card;
    }

    generateCardNumber(cardType) {
        const prefixes = this.cardPrefixes[cardType];
        const lengths = this.cardLengths[cardType];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const length = lengths[Math.floor(Math.random() * lengths.length)];
        
        let cardNumber = prefix;
        
        // Generate remaining digits
        while (cardNumber.length < length - 1) {
            cardNumber += Math.floor(Math.random() * 10);
        }
        
        // Add Luhn check digit
        cardNumber += this.calculateLuhnCheckDigit(cardNumber);
        
        return this.formatCardNumber(cardNumber);
    }

    generateCardNumberFromBin(bin) {
        let cardNumber = bin;
        const targetLength = 16; // Default to 16 digits
        
        // Generate remaining digits
        while (cardNumber.length < targetLength - 1) {
            cardNumber += Math.floor(Math.random() * 10);
        }
        
        // Add Luhn check digit
        cardNumber += this.calculateLuhnCheckDigit(cardNumber);
        
        return this.formatCardNumber(cardNumber);
    }

    detectCardType(bin) {
        for (const [type, prefixes] of Object.entries(this.cardPrefixes)) {
            for (const prefix of prefixes) {
                if (bin.startsWith(prefix)) {
                    return type;
                }
            }
        }
        return 'unknown';
    }

    calculateLuhnCheckDigit(cardNumber) {
        const digits = cardNumber.split('').map(Number);
        let sum = 0;
        
        for (let i = digits.length - 1; i >= 0; i -= 2) {
            sum += digits[i];
            if (i > 0) {
                let doubled = digits[i - 1] * 2;
                sum += doubled > 9 ? doubled - 9 : doubled;
            }
        }
        
        return (10 - (sum % 10)) % 10;
    }

    formatCardNumber(cardNumber) {
        // Format as groups of 4 digits
        return cardNumber.replace(/(.{4})/g, '$1 ').trim();
    }

    generateCvv(cardType) {
        const length = cardType === 'amex' ? 4 : 3;
        let cvv = '';
        for (let i = 0; i < length; i++) {
            cvv += Math.floor(Math.random() * 10);
        }
        return cvv;
    }

    getRandomMonth() {
        return String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    }

    getRandomYear() {
        const currentYear = new Date().getFullYear();
        return String(currentYear + Math.floor(Math.random() * 9)); // Next 8 years
    }

    generateBalance(balanceRange) {
        if (!balanceRange) return Math.floor(Math.random() * 5000) + 500;
        
        const [min, max] = balanceRange.split('-').map(Number);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    displayResults(cards, format) {
        const output = document.getElementById('results-output');
        let result = '';

        switch (format) {
            case 'card':
                result = cards.map(card => {
                    let line = card.number;
                    if (card.month && card.year) line += `|${card.month}|${card.year}`;
                    if (card.cvv) line += `|${card.cvv}`;
                    return line;
                }).join('\n');
                break;

            case 'pipe':
                result = cards.map(card => {
                    let parts = [card.number];
                    if (card.month && card.year) parts.push(`${card.month}/${card.year}`);
                    if (card.cvv) parts.push(card.cvv);
                    if (card.currency && card.balance) parts.push(`${card.currency}:${card.balance}`);
                    return parts.join('|');
                }).join('\n');
                break;

            case 'csv':
                const headers = ['Card Number'];
                if (cards[0]?.month) headers.push('Expiry Month', 'Expiry Year');
                if (cards[0]?.cvv) headers.push('CVV');
                if (cards[0]?.currency) headers.push('Currency', 'Balance');
                
                result = headers.join(',') + '\n';
                result += cards.map(card => {
                    let row = [card.number.replace(/\s/g, '')];
                    if (card.month && card.year) row.push(card.month, card.year);
                    if (card.cvv) row.push(card.cvv);
                    if (card.currency && card.balance) row.push(card.currency, card.balance);
                    return row.join(',');
                }).join('\n');
                break;

            case 'json':
                const jsonCards = cards.map(card => {
                    const obj = { cardNumber: card.number.replace(/\s/g, '') };
                    if (card.month && card.year) {
                        obj.expiryMonth = card.month;
                        obj.expiryYear = card.year;
                    }
                    if (card.cvv) obj.cvv = card.cvv;
                    if (card.currency && card.balance) {
                        obj.currency = card.currency;
                        obj.balance = card.balance;
                    }
                    return obj;
                });
                result = JSON.stringify(jsonCards, null, 2);
                break;

            case 'xml':
                result = '<?xml version="1.0" encoding="UTF-8"?>\n<cards>\n';
                cards.forEach((card, index) => {
                    result += `  <card id="${index + 1}">\n`;
                    result += `    <number>${card.number.replace(/\s/g, '')}</number>\n`;
                    if (card.month && card.year) {
                        result += `    <expiry>${card.month}/${card.year}</expiry>\n`;
                    }
                    if (card.cvv) result += `    <cvv>${card.cvv}</cvv>\n`;
                    if (card.currency && card.balance) {
                        result += `    <currency>${card.currency}</currency>\n`;
                        result += `    <balance>${card.balance}</balance>\n`;
                    }
                    result += '  </card>\n';
                });
                result += '</cards>';
                break;

            case 'sql':
                result = 'CREATE TABLE credit_cards (\n';
                result += '  id INT PRIMARY KEY,\n';
                result += '  card_number VARCHAR(19)';
                if (cards[0]?.month) result += ',\n  expiry_month VARCHAR(2),\n  expiry_year VARCHAR(4)';
                if (cards[0]?.cvv) result += ',\n  cvv VARCHAR(4)';
                if (cards[0]?.currency) result += ',\n  currency VARCHAR(3),\n  balance DECIMAL(10,2)';
                result += '\n);\n\n';
                
                cards.forEach((card, index) => {
                    result += `INSERT INTO credit_cards VALUES (${index + 1}, '${card.number.replace(/\s/g, '')}'`;
                    if (card.month && card.year) result += `, '${card.month}', '${card.year}'`;
                    if (card.cvv) result += `, '${card.cvv}'`;
                    if (card.currency && card.balance) result += `, '${card.currency}', ${card.balance}`;
                    result += ');\n';
                });
                break;

            default:
                result = cards.map(card => card.number).join('\n');
        }

        output.value = result;
        this.showSuccess(`Generated ${cards.length} credit card numbers successfully!`);
    }

    copyToClipboard() {
        const output = document.getElementById('results-output');
        if (!output.value) {
            this.showError('No content to copy!');
            return;
        }

        output.select();
        document.execCommand('copy');
        this.showCopyNotification();
    }

    resetResults() {
        document.getElementById('results-output').value = '';
        this.showSuccess('Results cleared successfully!');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    showCopyNotification() {
        // Remove existing notification
        const existing = document.querySelector('.copy-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'Copied to clipboard!';
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreditCardGenerator();
});

// Add some utility functions for enhanced functionality
function validateBIN(bin) {
    return /^\d{4,6}$/.test(bin);
}

function formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
    });
    return formatter.format(amount);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        const generateBtn = activeTab.querySelector('.generate-btn');
        if (generateBtn && !generateBtn.disabled) {
            generateBtn.click();
        }
    }
    
    // Ctrl/Cmd + C to copy (when results are focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.id === 'results-output') {
        // Let the default copy behavior work
        setTimeout(() => {
            const generator = new CreditCardGenerator();
            generator.showCopyNotification();
        }, 100);
    }
});
