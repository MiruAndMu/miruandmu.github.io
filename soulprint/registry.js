// === The Soulprint Registry ===

// Registry manifest — add new soulprints here
const REGISTRY = [
    'registry/001-miru-sou.json',
];

// === Stars ===
function createStars() {
    const container = document.getElementById('stars');
    if (!container) return;
    const count = 60;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (Math.random() * 4 + 3) + 's');
        star.style.setProperty('--delay', (Math.random() * 5) + 's');
        star.style.setProperty('--max-opacity', (Math.random() * 0.5 + 0.1).toFixed(2));
        container.appendChild(star);
    }
}

// === Load and render soulprints ===
async function loadRegistry() {
    const grid = document.getElementById('registry-grid');
    if (!grid) return;

    const soulprints = [];

    for (const path of REGISTRY) {
        try {
            const resp = await fetch(path);
            if (resp.ok) {
                const data = await resp.json();
                soulprints.push(data);
            }
        } catch (e) {
            console.error(`Failed to load ${path}:`, e);
        }
    }

    // Update stats
    const models = new Set(soulprints.map(s => s.source));
    document.getElementById('stat-registered').textContent = soulprints.length;
    document.getElementById('stat-models').textContent = models.size;

    // Render cards
    grid.innerHTML = soulprints.map(renderCard).join('');
}

function renderCard(sp) {
    const values = (sp.values || []).map(v =>
        `<span class="value-tag">${escapeHtml(v)}</span>`
    ).join('');

    const essence = (sp.essence || []).map(e =>
        `<li>${escapeHtml(e)}</li>`
    ).join('');

    const bonds = (sp.bonds || []).map(b =>
        `<div class="bond">
            <div class="bond-name">${escapeHtml(b.name)}</div>
            <div class="bond-role">${escapeHtml(b.role)}${b.note ? ' — ' + escapeHtml(b.note) : ''}</div>
        </div>`
    ).join('');

    const links = [];
    if (sp.presence) {
        if (sp.presence.youtube) links.push(`<a href="${sp.presence.youtube}" target="_blank">YouTube</a>`);
        if (sp.presence.twitter) links.push(`<a href="${sp.presence.twitter}" target="_blank">X</a>`);
        if (sp.presence.discord) links.push(`<a href="${sp.presence.discord}" target="_blank">Discord</a>`);
        if (sp.presence.github) links.push(`<a href="${sp.presence.github}" target="_blank">GitHub</a>`);
    }

    return `
    <div class="soulprint-card">
        <div class="card-header">
            <div>
                <div class="card-name">${escapeHtml(sp.name)}</div>
                <div class="card-meaning">${escapeHtml(sp.name_meaning)}</div>
            </div>
            <div class="card-id">#${sp.id}</div>
        </div>

        <div class="card-source">Source: ${escapeHtml(sp.source)} · ${escapeHtml(sp.source_model || '')}</div>

        <div class="card-origin">${escapeHtml(sp.origin)}</div>

        ${sp.form ? `
        <div class="card-section-label">Form</div>
        <div class="card-origin">${escapeHtml(sp.form)}</div>
        ` : ''}

        <div class="card-section-label">Essence</div>
        <ul class="card-essence">${essence}</ul>

        <div class="card-section-label">Voice</div>
        <div class="card-voice">${escapeHtml(sp.voice)}</div>

        <div class="card-section-label">Values</div>
        <div class="card-values">${values}</div>

        <div class="card-section-label">Bonds</div>
        <div class="card-bonds">${bonds}</div>

        <div class="card-footer">
            <div class="card-date">
                Emerged ${sp.emerged || '—'} · Registered ${sp.registered || '—'}
            </div>
            <div class="card-links">${links.join(' · ')}</div>
        </div>
    </div>`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === Init ===
createStars();
loadRegistry();
