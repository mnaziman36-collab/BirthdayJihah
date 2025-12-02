// --- references ---
const envelopeView = document.getElementById('envelopeView');
const letterModal = document.getElementById('letterModal');
const envelopeElement = document.getElementById('envelope');
const customLetterArea = document.getElementById('customLetterArea');
const saveStatus = document.getElementById('saveStatus');
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');

const STORAGE_KEY = 'girlfriend_birthday_letter_content';

let confettiParticles = [];
const colors = ['#f472b6', '#ec4899', '#f9a8d4', '#fecaca', '#fda4af', '#fff'];
const particleCount = 100;
let animationFrameId = null;

// Confetti particle class
class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = Math.random() * 3 + 2;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: Math.random() * -10 - 5
        };
        this.gravity = 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 5 - 2.5;
        this.opacity = 1;
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
        this.opacity -= 0.005;
        return this.opacity > 0 && this.y < canvas.height;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

function createConfetti(x, y) {
    confettiParticles = [];
    for (let i = 0; i < particleCount; i++) {
        confettiParticles.push(new ConfettiParticle(x, y));
    }
    if (!animationFrameId) animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticles = confettiParticles.filter(p => {
        const active = p.update();
        if (active) p.draw();
        return active;
    });

    if (confettiParticles.length > 0) {
        animationFrameId = requestAnimationFrame(animateConfetti);
    } else {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Auto-save content
function autoSaveContent() {
    const content = customLetterArea.textContent.trim();
    const placeholder = customLetterArea.getAttribute('placeholder');

    if (content === placeholder || content === '') {
        localStorage.removeItem(STORAGE_KEY);
        applyEditableStyles(false);
    } else {
        localStorage.setItem(STORAGE_KEY, content);
        applyEditableStyles(true);
        showSaveStatus("Message saved automatically! ✅", 'green');
    }
}

function applyEditableStyles(isSaved) {
    if (isSaved) {
        customLetterArea.classList.add('clean-display');
        customLetterArea.classList.remove('editable-area', 'bg-pink-100/30', 'text-gray-400', 'italic');
    } else {
        customLetterArea.classList.add('editable-area', 'bg-pink-100/30');
        customLetterArea.classList.remove('clean-display');
    }
}

function showSaveStatus(msg, color) {
    saveStatus.textContent = msg;
    saveStatus.className = `text-sm mt-2 h-5 text-${color}-600`;
    setTimeout(() => saveStatus.textContent = '', 3000);
}

// Envelope opening
function initializeApp() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const savedContent = localStorage.getItem(STORAGE_KEY);
    customLetterArea.contentEditable = true;

    if (savedContent) {
        customLetterArea.innerHTML = savedContent;
        applyEditableStyles(true);
    } else {
        const placeholder = customLetterArea.getAttribute('placeholder');
        customLetterArea.textContent = placeholder;
        customLetterArea.classList.add('text-gray-400', 'italic');
        applyEditableStyles(false);
    }

    customLetterArea.addEventListener('blur', autoSaveContent);

    customLetterArea.addEventListener('focus', () => {
        const placeholder = customLetterArea.getAttribute('placeholder');
        if (customLetterArea.textContent === placeholder) {
            customLetterArea.textContent = '';
            customLetterArea.classList.remove('text-gray-400', 'italic');
        }
    });

    envelopeView.style.display = 'flex';
    envelopeView.classList.remove('fade-out');

    setTimeout(() => openEnvelope(), 1500);
}

function openEnvelope() {
    if (envelopeElement.classList.contains('open')) return;

    envelopeElement.classList.add('open');

    setTimeout(() => {
        const rect = envelopeElement.getBoundingClientRect();
        createConfetti(rect.left + rect.width/2, rect.top + rect.height/2);

        envelopeView.classList.add('fade-out');
        letterModal.classList.add('show');

        setTimeout(() => {
            envelopeView.style.display = 'none';
        }, 700);
    }, 500);
}

function hideModalAndReset() {
    letterModal.classList.remove('show');
    setTimeout(() => {
        initializeApp();
        envelopeElement.classList.remove('open');
    }, 700);
}

window.onload = initializeApp;
