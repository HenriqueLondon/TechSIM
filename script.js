// ==========================================================================
// PORTFOLIO JAVASCRIPT - ES6+ MODERNO
// ==========================================================================

// ===== MODULES & IMPORTS =====
import { validateForm, generateCSRFToken } from './modules/form-validation.js';

// ===== GLOBAL VARIABLES =====
const menuToggle = document.getElementById('menu-icon');
const navbar = document.getElementById('primary-navigation');
const navLinks = document.querySelectorAll('.nav-list a');
const contactForm = document.getElementById('contact-form');
const currentYearSpan = document.getElementById('current-year');

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// ===== INITIALIZATION =====
function initializeApp() {
    // Set current year
    setCurrentYear();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize form handling
    initForm();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize animations
    initAnimations();
    
    // Initialize service buttons
    initServiceButtons();
}

// ===== CURRENT YEAR =====
function setCurrentYear() {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// ===== NAVIGATION =====
function initNavigation() {
    if (!menuToggle || !navbar) return;
    
    // Toggle menu
    menuToggle.addEventListener('click', toggleMenu);
    
    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Handle keyboard navigation
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
}

function toggleMenu() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    // Toggle classes
    menuToggle.classList.toggle('active');
    navbar.classList.toggle('active');
    
    // Update ARIA attributes
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    menuToggle.setAttribute('aria-label', !isExpanded ? 'Close menu' : 'Open menu');
    
    // Update icon
    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.classList.toggle('bx-menu');
        icon.classList.toggle('bx-x');
    }
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
}

function closeMenu() {
    menuToggle.classList.remove('active');
    navbar.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    
    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.classList.add('bx-menu');
        icon.classList.remove('bx-x');
    }
    
    document.body.style.overflow = '';
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    // Header scroll effect
    window.addEventListener('scroll', throttle(handleScroll, 100));
    
    // Active link highlighting
    window.addEventListener('scroll', throttle(highlightActiveLink, 150));
    
    // Skills animation on scroll
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateSkills();
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );
        observer.observe(skillsSection);
    }
}

function handleScroll() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

function highlightActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }
    });
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Text animation
    initTextAnimation();
    
    // Project card animations
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', handleProjectHover);
        card.addEventListener('mouseleave', handleProjectLeave);
    });
    
    // Service card animations
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', handleServiceHover);
        card.addEventListener('mouseleave', handleServiceLeave);
    });
}

function initTextAnimation() {
    const textElement = document.querySelector('.animated-text');
    if (!textElement) return;
    
    const roles = [
        'Frontend Developer',
        'Web Designer',
        'Video Editor',
        'Social Media Manager',
        'Content Creator'
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    function typeWriter() {
        if (isPaused) return;
        
        const currentRole = roles[roleIndex];
        
        if (!isDeleting && charIndex <= currentRole.length) {
            textElement.textContent = currentRole.substring(0, charIndex);
            charIndex++;
            setTimeout(typeWriter, 100);
        } else if (isDeleting && charIndex >= 0) {
            textElement.textContent = currentRole.substring(0, charIndex);
            charIndex--;
            setTimeout(typeWriter, 50);
        } else {
            isDeleting = !isDeleting;
            
            if (!isDeleting) {
                roleIndex = (roleIndex + 1) % roles.length;
            }
            
            // Pause before starting next role
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                typeWriter();
            }, 1500);
            
            setTimeout(typeWriter, 500);
        }
    }
    
    // Start animation
    setTimeout(typeWriter, 1000);
}

function handleProjectHover(e) {
    const card = e.currentTarget;
    card.style.zIndex = '10';
}

function handleProjectLeave(e) {
    const card = e.currentTarget;
    card.style.zIndex = '';
}

function handleServiceHover(e) {
    const card = e.currentTarget;
    const icon = card.querySelector('.service-icon i');
    
    if (icon) {
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.3s ease';
    }
}

function handleServiceLeave(e) {
    const card = e.currentTarget;
    const icon = card.querySelector('.service-icon i');
    
    if (icon) {
        icon.style.transform = 'scale(1)';
    }
}

function animateSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// ===== FORM HANDLING =====
function initForm() {
    if (!contactForm) return;
    
    // Generate CSRF token
    generateCSRFToken();
    
    // Form validation
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm(contactForm)) {
        return;
    }
    
    const submitBtn = contactForm.querySelector('#submit-btn');
    const formData = new FormData(contactForm);
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.ok) {
            showFormStatus('success', 'Message sent successfully!');
            contactForm.reset();
            generateCSRFToken(); // Generate new token
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        showFormStatus('error', 'Error sending message. Please try again.');
        console.error('Form submission error:', error);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

function validateField(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    if (!field.checkValidity()) {
        formGroup.classList.add('error');
        
        if (field.validity.valueMissing) {
            errorElement.textContent = 'This field is required';
        } else if (field.validity.typeMismatch) {
            errorElement.textContent = 'Please enter a valid email';
        } else if (field.validity.patternMismatch) {
            errorElement.textContent = 'Please enter a valid phone number';
        } else if (field.validity.tooShort) {
            errorElement.textContent = `Minimum ${field.minLength} characters required`;
        }
    } else {
        formGroup.classList.remove('error');
        errorElement.textContent = '';
    }
}

function clearFieldError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
    formGroup.querySelector('.error-message').textContent = '';
}

function showFormStatus(type, message) {
    const statusElement = document.getElementById('form-status');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = `form-status ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'form-status';
    }, 5000);
}

// ===== SERVICE BUTTONS =====
function initServiceButtons() {
    const serviceButtons = document.querySelectorAll('[data-service]');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', handleServiceClick);
    });
}

function handleServiceClick(e) {
    const service = e.target.dataset.service;
    const modalContent = getServiceDetails(service);
    
    // You can implement a modal here
    console.log(`Service clicked: ${service}`);
    // showModal(modalContent);
}

function getServiceDetails(service) {
    const details = {
        frontend: {
            title: 'Frontend Development',
            description: 'Detailed information about frontend development services...',
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vue.js']
        },
        design: {
            title: 'Web Design',
            description: 'Detailed information about web design services...',
            tools: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator']
        },
        video: {
            title: 'Video Editing',
            description: 'Detailed information about video editing services...',
            software: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut']
        },
        social: {
            title: 'Social Media Management',
            description: 'Detailed information about social media services...',
            platforms: ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok']
        }
    };
    
    return details[service] || details.frontend;
}

// ===== UTILITY FUNCTIONS =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // You could send this to an error tracking service
});

// ===== PERFORMANCE MONITORING =====
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('LCP:', entry.startTime);
            }
        }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

// Export for module usage if needed
export {
    toggleMenu,
    closeMenu,
    validateForm,
    handleFormSubmit
};
