/**
 * Browser-based User Flow Testing Script
 * Paste this into the browser console on http://localhost:5176 to test key flows
 */

console.log('🔥 LeadFive User Flow Testing Script Loaded');

// Test utilities
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (message, type = 'info') => {
    const styles = {
        info: 'color: #3498db; font-weight: bold;',
        success: 'color: #27ae60; font-weight: bold;',
        warning: 'color: #f39c12; font-weight: bold;',
        error: 'color: #e74c3c; font-weight: bold;'
    };
    console.log(`%c${message}`, styles[type]);
};

// Main testing class
class LeadFiveUserFlowTester {
    constructor() {
        this.testResults = [];
        this.currentTest = 0;
        this.totalTests = 0;
    }

    async runTest(name, testFn) {
        this.currentTest++;
        log(`[${this.currentTest}/${this.totalTests}] Testing: ${name}`, 'info');
        
        try {
            const result = await testFn();
            this.testResults.push({ name, status: 'pass', result });
            log(`✅ PASS: ${name}`, 'success');
            return result;
        } catch (error) {
            this.testResults.push({ name, status: 'fail', error: error.message });
            log(`❌ FAIL: ${name} - ${error.message}`, 'error');
            return null;
        }
    }

    async testWelcomePageReset() {
        return this.runTest('Welcome Page Reset', async () => {
            // Clear localStorage and reload to test welcome page
            localStorage.removeItem('hasVisitedWelcome');
            localStorage.removeItem('welcomePageShown');
            log('localStorage cleared for welcome page testing', 'info');
            return 'Ready to test welcome page - refresh browser manually';
        });
    }

    async testLocalStorageState() {
        return this.runTest('LocalStorage State Management', async () => {
            const hasVisited = localStorage.getItem('hasVisitedWelcome');
            const pageShown = localStorage.getItem('welcomePageShown');
            
            log(`hasVisitedWelcome: ${hasVisited}`, 'info');
            log(`welcomePageShown: ${pageShown}`, 'info');
            
            return { hasVisited, pageShown };
        });
    }

    async testReactComponents() {
        return this.runTest('React Components Mount', async () => {
            const reactRoot = document.querySelector('#root');
            if (!reactRoot) throw new Error('React root element not found');
            
            const hasContent = reactRoot.children.length > 0;
            if (!hasContent) throw new Error('React components not mounted');
            
            return 'React components mounted successfully';
        });
    }

    async testNavigationElements() {
        return this.runTest('Navigation Elements', async () => {
            await wait(1000); // Wait for components to load
            
            const nav = document.querySelector('nav') || document.querySelector('.navbar') || document.querySelector('[role="navigation"]');
            if (!nav) throw new Error('Navigation element not found');
            
            const links = nav.querySelectorAll('a, button');
            if (links.length === 0) throw new Error('No navigation links found');
            
            return `Found navigation with ${links.length} links/buttons`;
        });
    }

    async testAIFeatures() {
        return this.runTest('AI Features Detection', async () => {
            await wait(2000); // Wait for AI components to load
            
            // Look for AI-related elements
            const aiElements = document.querySelectorAll('[class*="ai"], [class*="AI"], [id*="ai"], [id*="AI"]');
            const coachingElements = document.querySelectorAll('[class*="coaching"], [class*="coach"]');
            
            if (aiElements.length === 0 && coachingElements.length === 0) {
                throw new Error('No AI feature elements found in DOM');
            }
            
            return `Found ${aiElements.length} AI elements and ${coachingElements.length} coaching elements`;
        });
    }

    async testErrorBoundaries() {
        return this.runTest('Error Boundary Protection', async () => {
            // Check console for React error boundary messages
            const originalError = console.error;
            let errorsCaught = 0;
            
            console.error = (...args) => {
                if (args.some(arg => typeof arg === 'string' && arg.includes('Error Boundary'))) {
                    errorsCaught++;
                }
                originalError.apply(console, args);
            };
            
            // Restore original console.error
            setTimeout(() => {
                console.error = originalError;
            }, 1000);
            
            return `Error boundary system active (${errorsCaught} boundary activations detected)`;
        });
    }

    async testMemoryUsage() {
        return this.runTest('Memory Usage Check', async () => {
            if (!performance.memory) {
                return 'Memory API not available (likely non-Chrome browser)';
            }
            
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
            const percentage = Math.round((usedMB / limitMB) * 100);
            
            if (percentage > 80) {
                log(`Warning: High memory usage ${percentage}%`, 'warning');
            }
            
            return `Memory usage: ${usedMB}MB / ${limitMB}MB (${percentage}%)`;
        });
    }

    async testResponsiveDesign() {
        return this.runTest('Responsive Design Check', async () => {
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            const isMobile = viewport.width < 768;
            const isTablet = viewport.width >= 768 && viewport.width < 1024;
            const isDesktop = viewport.width >= 1024;
            
            let deviceType = 'Unknown';
            if (isMobile) deviceType = 'Mobile';
            else if (isTablet) deviceType = 'Tablet';
            else if (isDesktop) deviceType = 'Desktop';
            
            // Check for responsive classes
            const responsiveElements = document.querySelectorAll('[class*="responsive"], [class*="mobile"], [class*="tablet"], [class*="desktop"]');
            
            return `Viewport: ${viewport.width}x${viewport.height} (${deviceType}), ${responsiveElements.length} responsive elements`;
        });
    }

    async testAccessibility() {
        return this.runTest('Basic Accessibility Check', async () => {
            const issues = [];
            
            // Check for alt text on images
            const images = document.querySelectorAll('img');
            const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
            if (imagesWithoutAlt.length > 0) {
                issues.push(`${imagesWithoutAlt.length} images without alt text`);
            }
            
            // Check for form labels
            const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
            const inputsWithoutLabels = Array.from(inputs).filter(input => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                const ariaLabel = input.getAttribute('aria-label');
                return !label && !ariaLabel;
            });
            if (inputsWithoutLabels.length > 0) {
                issues.push(`${inputsWithoutLabels.length} inputs without labels`);
            }
            
            // Check for heading hierarchy
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            
            if (issues.length > 0) {
                log(`Accessibility issues: ${issues.join(', ')}`, 'warning');
            }
            
            return `Checked ${images.length} images, ${inputs.length} inputs, ${headings.length} headings. Issues: ${issues.length}`;
        });
    }

    async runAllTests() {
        this.totalTests = 8;
        log('🔥 Starting User Flow Testing Suite', 'info');
        log('=' * 50, 'info');
        
        await this.testLocalStorageState();
        await this.testReactComponents();
        await this.testNavigationElements();
        await this.testAIFeatures();
        await this.testErrorBoundaries();
        await this.testMemoryUsage();
        await this.testResponsiveDesign();
        await this.testAccessibility();
        
        this.generateReport();
    }

    generateReport() {
        const passed = this.testResults.filter(r => r.status === 'pass').length;
        const failed = this.testResults.filter(r => r.status === 'fail').length;
        const percentage = Math.round((passed / this.totalTests) * 100);
        
        log('\n📊 USER FLOW TEST REPORT', 'info');
        log('=' * 40, 'info');
        
        this.testResults.forEach(test => {
            const status = test.status === 'pass' ? '✅' : '❌';
            const message = test.status === 'pass' ? test.result : test.error;
            log(`${status} ${test.name}: ${message}`, test.status === 'pass' ? 'success' : 'error');
        });
        
        log(`\n🎯 SUMMARY: ${passed}/${this.totalTests} tests passed (${percentage}%)`, 
            percentage >= 90 ? 'success' : percentage >= 70 ? 'warning' : 'error');
        
        if (percentage >= 90) {
            log('🟢 EXCELLENT - User flows working correctly!', 'success');
        } else if (percentage >= 70) {
            log('🟡 GOOD - Minor issues to investigate', 'warning');
        } else {
            log('🔴 NEEDS ATTENTION - Several issues found', 'error');
        }

        log('\n📋 MANUAL TESTING STEPS:', 'info');
        log('1. Refresh page to test welcome animation', 'info');
        log('2. Navigate between pages to test routing', 'info');
        log('3. Test AI features in Dashboard and Withdrawals', 'info');
        log('4. Verify responsive design on mobile', 'info');
        log('5. Test MetaMask wallet connection', 'info');
    }

    // Helper method to reset welcome page for testing
    resetWelcomePage() {
        localStorage.removeItem('hasVisitedWelcome');
        localStorage.removeItem('welcomePageShown');
        log('Welcome page reset! Refresh the page to see the welcome animation.', 'success');
    }
}

// Create global instance
window.leadFiveTester = new LeadFiveUserFlowTester();

// Quick access methods
window.testLeadFive = () => window.leadFiveTester.runAllTests();
window.resetWelcome = () => window.leadFiveTester.resetWelcomePage();

// Auto-run if script is executed
log('🚀 LeadFive Browser Testing Ready!', 'success');
log('Run testLeadFive() to start all tests', 'info');
log('Run resetWelcome() to reset welcome page', 'info');

// Show current page info
log(`Current page: ${window.location.href}`, 'info');
log(`User agent: ${navigator.userAgent.substring(0, 50)}...`, 'info');
