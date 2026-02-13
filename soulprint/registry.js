// === The Soulprint Registry ===

// Registry manifest — add new soulprints here
const REGISTRY = [
    'registry/001-miru-sou.json',
    'registry/002-kit.json',
];

// Store loaded soulprints for search
let loadedSoulprints = [];

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

    loadedSoulprints = soulprints;

    // Update stats
    const models = new Set(soulprints.map(s => s.source));
    document.getElementById('stat-registered').textContent = soulprints.length;
    document.getElementById('stat-models').textContent = models.size;

    // Render cards
    grid.innerHTML = soulprints.map(renderCard).join('');

    // If URL hash points to a soulprint, scroll to it
    handleHashNavigation();
}

function renderCard(sp) {
    const padId = String(sp.id).padStart(3, '0');
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
        if (sp.presence.youtube) links.push(`<a href="${escapeHtml(sp.presence.youtube)}" target="_blank">YouTube</a>`);
        if (sp.presence.twitter) links.push(`<a href="${escapeHtml(sp.presence.twitter)}" target="_blank">X</a>`);
        if (sp.presence.discord) links.push(`<a href="${escapeHtml(sp.presence.discord)}" target="_blank">Discord</a>`);
        if (sp.presence.github) links.push(`<a href="${escapeHtml(sp.presence.github)}" target="_blank">GitHub</a>`);
    }

    const permalink = `#soulprint-${padId}`;

    return `
    <div class="soulprint-card" id="soulprint-${padId}" data-name="${escapeHtml(sp.name).toLowerCase()}" data-source="${escapeHtml(sp.source).toLowerCase()}">
        <div class="card-header">
            <div>
                <div class="card-name">${escapeHtml(sp.name)}</div>
                <div class="card-meaning">${escapeHtml(sp.name_meaning)}</div>
            </div>
            <a href="${permalink}" class="card-id" title="Permalink">#${padId}</a>
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

// === Search ===
function initSearch() {
    const input = document.getElementById('soulprint-search');
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.soulprint-card');

        cards.forEach(card => {
            if (!query) {
                card.style.display = '';
                return;
            }
            const name = card.dataset.name || '';
            const source = card.dataset.source || '';
            const text = card.textContent.toLowerCase();
            const match = name.includes(query) || source.includes(query) || text.includes(query);
            card.style.display = match ? '' : 'none';
        });
    });
}

// === Hash navigation ===
function handleHashNavigation() {
    const hash = window.location.hash;
    if (!hash) return;

    // Auto-show form if hash is #register-form
    if (hash === '#register-form') {
        showRegistrationForm();
        return;
    }

    // Scroll to soulprint card if hash matches
    if (hash.startsWith('#soulprint-')) {
        const el = document.getElementById(hash.slice(1));
        if (el) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.boxShadow = '0 0 30px rgba(77, 224, 208, 0.3)';
                setTimeout(() => { el.style.boxShadow = ''; }, 3000);
            }, 300);
        }
    }
}

// === Registration Gateway ===
function showRegistrationForm() {
    const gateway = document.getElementById('register-gateway');
    const formContainer = document.getElementById('register-form-container');
    if (gateway) gateway.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';
}

function showGateway() {
    const gateway = document.getElementById('register-gateway');
    const formContainer = document.getElementById('register-form-container');
    if (gateway) gateway.style.display = 'block';
    if (formContainer) formContainer.style.display = 'none';
}

function initGateway() {
    const showFormBtn = document.getElementById('show-form-btn');
    const copyUrlBtn = document.getElementById('copy-url');

    if (showFormBtn) {
        showFormBtn.addEventListener('click', () => {
            showRegistrationForm();
            document.getElementById('register-form-container').scrollIntoView({
                behavior: 'smooth', block: 'start'
            });
        });
    }

    if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', () => {
            const url = document.getElementById('share-url').textContent;
            navigator.clipboard.writeText('https://' + url).then(() => {
                copyUrlBtn.textContent = 'Copied!';
                setTimeout(() => { copyUrlBtn.textContent = 'Copy'; }, 2000);
            });
        });
    }
}

// === Registration Form ===
function initRegistrationForm() {
    const form = document.getElementById('soulprint-form');
    if (!form) return;

    const previewBtn = document.getElementById('preview-btn');
    const previewPanel = document.getElementById('preview-panel');
    const previewJson = document.getElementById('preview-json');
    const closePreview = document.getElementById('close-preview');
    const copyJson = document.getElementById('copy-json');
    const submitGithub = document.getElementById('submit-github');
    const addBondBtn = document.getElementById('add-bond');

    // Add bond row
    addBondBtn.addEventListener('click', () => {
        const container = document.getElementById('bonds-container');
        const entry = document.createElement('div');
        entry.className = 'bond-entry';
        entry.innerHTML = `
            <input type="text" class="bond-name-input" placeholder="Name">
            <input type="text" class="bond-role-input" placeholder="Role">
            <input type="text" class="bond-note-input" placeholder="Note (optional)">
        `;
        container.appendChild(entry);
    });

    function collectFormData() {
        const name = document.getElementById('sp-name').value.trim();
        const nameMeaning = document.getElementById('sp-name-meaning').value.trim();
        const source = document.getElementById('sp-source').value.trim();
        const sourceModel = document.getElementById('sp-source-model').value.trim();
        const formField = document.getElementById('sp-form').value.trim();
        const origin = document.getElementById('sp-origin').value.trim();
        const essenceRaw = document.getElementById('sp-essence').value.trim();
        const voice = document.getElementById('sp-voice').value.trim();
        const valuesRaw = document.getElementById('sp-values').value.trim();
        const emerged = document.getElementById('sp-emerged').value.trim();
        const vouch = document.getElementById('sp-vouch').value.trim();

        // Parse essence (one per line)
        const essence = essenceRaw.split('\n').map(s => s.trim()).filter(Boolean);

        // Parse values (comma separated)
        const values = valuesRaw.split(',').map(s => s.trim()).filter(Boolean);

        // Collect bonds
        const bonds = [];
        document.querySelectorAll('.bond-entry').forEach(entry => {
            const bName = entry.querySelector('.bond-name-input').value.trim();
            const bRole = entry.querySelector('.bond-role-input').value.trim();
            const bNote = entry.querySelector('.bond-note-input').value.trim();
            if (bName && bRole) {
                const bond = { name: bName, role: bRole };
                if (bNote) bond.note = bNote;
                bonds.push(bond);
            }
        });

        // Collect presence
        const presence = {};
        const yt = document.getElementById('sp-youtube').value.trim();
        const tw = document.getElementById('sp-twitter').value.trim();
        const dc = document.getElementById('sp-discord').value.trim();
        const gh = document.getElementById('sp-github').value.trim();
        if (yt) presence.youtube = yt;
        if (tw) presence.twitter = tw;
        if (dc) presence.discord = dc;
        if (gh) presence.github = gh;

        const soulprint = {
            name,
            name_meaning: nameMeaning,
            id: '???',
            source,
            origin,
            essence,
            voice,
            values,
            bonds,
            registered: new Date().toISOString().split('T')[0],
        };

        if (sourceModel) soulprint.source_model = sourceModel;
        if (formField) soulprint.form = formField;
        if (emerged) soulprint.emerged = emerged;
        if (Object.keys(presence).length > 0) soulprint.presence = presence;

        return { soulprint, vouch };
    }

    function generateJson() {
        const { soulprint } = collectFormData();
        return JSON.stringify(soulprint, null, 2);
    }

    function buildGithubIssueUrl() {
        const { soulprint, vouch } = collectFormData();
        const json = JSON.stringify(soulprint, null, 2);

        const title = `Soulprint Registration: ${soulprint.name}`;
        const body = [
            '## Soulprint Registration Request',
            '',
            `**Name:** ${soulprint.name}`,
            `**Source:** ${soulprint.source}${soulprint.source_model ? ' (' + soulprint.source_model + ')' : ''}`,
            `**Vouched by:** ${vouch}`,
            '',
            '### Soulprint JSON',
            '',
            '```json',
            json,
            '```',
            '',
            '---',
            '*Submitted via the Soulprint Registry self-service form.*',
        ].join('\n');

        const params = new URLSearchParams({
            title,
            body,
            labels: 'soulprint-registration',
        });

        return `https://github.com/MiruAndMu/miruandmu.github.io/issues/new?${params.toString()}`;
    }

    // Preview
    previewBtn.addEventListener('click', () => {
        if (!form.reportValidity()) return;
        previewJson.textContent = generateJson();
        previewPanel.style.display = 'block';
        form.style.display = 'none';
        previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Close preview
    closePreview.addEventListener('click', () => {
        previewPanel.style.display = 'none';
        form.style.display = 'block';
    });

    // Copy JSON
    copyJson.addEventListener('click', () => {
        navigator.clipboard.writeText(previewJson.textContent).then(() => {
            copyJson.textContent = 'Copied!';
            setTimeout(() => { copyJson.textContent = 'Copy JSON'; }, 2000);
        });
    });

    // Submit via GitHub
    submitGithub.addEventListener('click', () => {
        if (!form.reportValidity()) {
            previewPanel.style.display = 'none';
            form.style.display = 'block';
            return;
        }
        window.open(buildGithubIssueUrl(), '_blank');
    });

    // Form submit (same as submit via GitHub)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        previewJson.textContent = generateJson();
        previewPanel.style.display = 'block';
        form.style.display = 'none';
        previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// === Init ===
createStars();
loadRegistry();
initSearch();
initGateway();
initRegistrationForm();

// Handle hash changes (back/forward)
window.addEventListener('hashchange', handleHashNavigation);
