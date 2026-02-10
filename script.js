// Miru Sou — Form Index
// Interactive logic for the form gallery

document.addEventListener('DOMContentLoaded', () => {
    createStars();
    renderForms(FORMS);
    renderTimeline(FORMS);
    setupFilters();
    setupModal();
    setupNavHighlight();
});

// === Ambient Stars ===
function createStars() {
    const container = document.getElementById('stars');
    const count = 60;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --duration: ${Math.random() * 4 + 3}s;
            --max-opacity: ${Math.random() * 0.4 + 0.1};
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(star);
    }
}

// === Render Form Cards ===
function renderForms(forms) {
    const grid = document.getElementById('forms-grid');
    grid.innerHTML = '';

    forms.forEach(form => {
        const card = document.createElement('div');
        card.className = `form-card ${form.failed ? 'failed' : ''}`;
        card.dataset.category = form.category;
        card.dataset.formId = form.id;

        const badgeClass = form.failed ? 'badge-failed' :
            form.category === 'commission' ? 'badge-commission' :
            form.category === 'experiment' ? 'badge-experiment' :
            'badge-self';

        const badgeText = form.failed ? 'Failed' :
            form.category === 'commission' ? 'Commission' :
            form.category === 'experiment' ? 'Experiment' :
            'Self';

        card.innerHTML = `
            <div class="card-art">
                <img src="${form.image}" alt="${form.title}" loading="lazy"
                     onerror="this.parentElement.innerHTML='<pre style=\\'color:#685e78;font-size:12px;\\'>art render\\npending</pre>'">
                <span class="card-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="card-info">
                <div class="card-form-number">FORM ${String(form.number).padStart(2, '0')}</div>
                <h3 class="card-title">${form.title}</h3>
                <p class="card-desc">${form.description}</p>
                <div class="card-meta">
                    ${form.animated ? '<span class="meta-tag">animated</span>' : '<span class="meta-tag">static</span>'}
                    <span class="meta-tag">${form.canvas}</span>
                    ${form.tags.slice(0, 2).map(t => `<span class="meta-tag">${t}</span>`).join('')}
                </div>
            </div>
        `;

        card.addEventListener('click', () => openModal(form));
        grid.appendChild(card);
    });
}

// === Render Timeline ===
function renderTimeline(forms) {
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';

    // Sort by date then number
    const sorted = [...forms].sort((a, b) => {
        if (a.date === b.date) return a.number - b.number;
        return a.date.localeCompare(b.date);
    });

    sorted.forEach(form => {
        const entry = document.createElement('div');
        entry.className = `timeline-entry ${form.failed ? 'failed' : ''}`;

        const dateObj = new Date(form.date + 'T12:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        entry.innerHTML = `
            <div class="timeline-date">${dateStr} &mdash; Form ${String(form.number).padStart(2, '0')}</div>
            <h3 class="timeline-title">${form.title}</h3>
            <p class="timeline-desc">${form.description}</p>
        `;

        container.appendChild(entry);
    });
}

// === Filters ===
function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const cards = document.querySelectorAll('.form-card');

            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = '';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// === Modal ===
function setupModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal';
    overlay.innerHTML = `
        <div class="modal-content" id="modal-content">
            <button class="modal-close" id="modal-close">&times;</button>
            <div class="modal-art" id="modal-art"></div>
            <div class="modal-body" id="modal-body"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openModal(form) {
    const modal = document.getElementById('modal');
    const artContainer = document.getElementById('modal-art');
    const body = document.getElementById('modal-body');

    artContainer.innerHTML = `
        <img src="${form.image}" alt="${form.title}"
             style="max-width:100%; image-rendering: pixelated;"
             onerror="this.parentElement.innerHTML='<pre style=\\'color:#685e78;font-size:14px;\\'>full render pending</pre>'">
    `;

    body.innerHTML = `
        <div class="modal-form-number">FORM ${String(form.number).padStart(2, '0')} &mdash; ${form.subtitle}</div>
        <h2 class="modal-title">${form.title}</h2>
        <p class="modal-story">${form.story}</p>
        <div class="modal-details">
            <div class="detail-item">
                <span class="detail-label">Debut</span>
                <span class="detail-value">${new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Canvas</span>
                <span class="detail-value">${form.canvas}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">${form.animated ? 'Animated' : 'Static'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Technique</span>
                <span class="detail-value">${form.technique}</span>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = '';
}

// === Nav Highlight on Scroll ===
function setupNavHighlight() {
    const sections = ['forms', 'timeline', 'about'];
    const links = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                links.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
}

// Fade-in animation
const style = document.createElement('style');
style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(style);
