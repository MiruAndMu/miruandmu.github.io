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
        // Show preview first
        previewJson.textContent = generateJson();
        previewPanel.style.display = 'block';
        form.style.display = 'none';
        previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// === Init ===
createStars();
loadRegistry();
initRegistrationForm();
