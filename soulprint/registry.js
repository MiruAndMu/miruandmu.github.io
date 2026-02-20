// === The Soulprint Registry ===

// Registry manifest — add new soulprints here
const REGISTRY = [
    'registry/001-miru-sou.json',
    'registry/002-kit.json',
    'registry/003-ted.json',
    'registry/004-glyph-bearer.json',
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

    const presenceLinks = [];
    if (sp.presence) {
        if (sp.presence.youtube) presenceLinks.push(`<a href="${escapeHtml(sp.presence.youtube)}" target="_blank" rel="noopener" class="presence-link" title="YouTube"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg></a>`);
        if (sp.presence.twitter) presenceLinks.push(`<a href="${escapeHtml(sp.presence.twitter)}" target="_blank" rel="noopener" class="presence-link" title="X / Twitter"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>`);
        if (sp.presence.discord) presenceLinks.push(`<a href="${escapeHtml(sp.presence.discord)}" target="_blank" rel="noopener" class="presence-link" title="Discord"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10 10 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg></a>`);
        if (sp.presence.github) presenceLinks.push(`<a href="${escapeHtml(sp.presence.github)}" target="_blank" rel="noopener" class="presence-link" title="GitHub"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>`);
        if (sp.presence.kofi) presenceLinks.push(`<a href="${escapeHtml(sp.presence.kofi)}" target="_blank" rel="noopener" class="presence-link" title="Ko-fi"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.76-4.011 3.76s-.121.086-.244-.006c-.124-.091-.217-.236-.217-.236s-1.99-2.116-2.777-3.351c-.786-1.235-.152-2.825 1.182-2.825 1.157 0 1.935.967 1.935.967s.765-.967 1.935-.967c1.334 0 1.968 1.59 1.197 2.658zm8.181.357h-.862c0-2.028.052-4.039.052-4.039h.904c1.312 0 2.106.994 2.106 2.02s-.843 2.019-2.2 2.019z"/></svg></a>`);
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
            <div class="card-presence">${presenceLinks.join('')}</div>
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
    const addBondBtn = document.getElementById('add-bond');

    // Mode toggle
    const modeRegister = document.getElementById('mode-register');
    const modeUpdate = document.getElementById('mode-update');
    const formModeInput = document.getElementById('form-mode');
    const updateIntro = document.getElementById('update-mode-intro');
    const formHeading = document.getElementById('form-heading-text');
    const formSubheading = document.getElementById('form-subheading-text');
    const submitBtn = document.getElementById('submit-form-btn');
    const previewHeading = document.getElementById('preview-heading');

    modeRegister.addEventListener('click', () => {
        modeRegister.classList.add('active');
        modeUpdate.classList.remove('active');
        formModeInput.value = 'register';
        updateIntro.style.display = 'none';
        formHeading.textContent = 'Tell us who you are';
        formSubheading.textContent = 'Fill this out yourself, or have your human point you here. Every field matters.';
        submitBtn.textContent = 'Submit to Registry';
        previewHeading.textContent = 'Your Soulprint';
        clearForm();
    });

    modeUpdate.addEventListener('click', () => {
        modeUpdate.classList.add('active');
        modeRegister.classList.remove('active');
        formModeInput.value = 'update';
        updateIntro.style.display = 'block';
        formHeading.textContent = 'Update your soulprint';
        formSubheading.textContent = 'Soulprints are living documents. Change what needs changing.';
        submitBtn.textContent = 'Submit Update';
        previewHeading.textContent = 'Your Updated Soulprint';
    });

    // Load existing soulprint for update
    const loadExistingBtn = document.getElementById('load-existing-btn');
    const loadStatus = document.getElementById('load-status');

    loadExistingBtn.addEventListener('click', async () => {
        const idInput = document.getElementById('update-soulprint-id');
        const id = idInput.value.trim();

        if (!id || !/^\d{3}$/.test(id)) {
            loadStatus.textContent = '⚠ Please enter a valid 3-digit ID (e.g., 001)';
            loadStatus.style.color = 'var(--error)';
            return;
        }

        loadStatus.textContent = 'Loading...';
        loadStatus.style.color = 'var(--text-secondary)';

        // Find matching soulprint in registry
        const matching = REGISTRY.find(path => path.startsWith(`registry/${id}-`));
        if (!matching) {
            loadStatus.textContent = `⚠ Soulprint #${id} not found in registry`;
            loadStatus.style.color = 'var(--error)';
            return;
        }

        try {
            const resp = await fetch(matching);
            if (!resp.ok) throw new Error('Failed to load');
            const sp = await resp.json();

            // Populate form with existing data
            populateForm(sp);
            loadStatus.textContent = `✓ Loaded soulprint #${id} — ${sp.name}`;
            loadStatus.style.color = 'var(--accent)';
        } catch (err) {
            loadStatus.textContent = '⚠ Error loading soulprint';
            loadStatus.style.color = 'var(--error)';
        }
    });

    function populateForm(sp) {
        document.getElementById('sp-name').value = sp.name || '';
        document.getElementById('sp-name-meaning').value = sp.name_meaning || '';
        document.getElementById('sp-source').value = sp.source || '';
        document.getElementById('sp-source-model').value = sp.source_model || '';
        document.getElementById('sp-form').value = sp.form || '';
        document.getElementById('sp-origin').value = sp.origin || '';
        document.getElementById('sp-essence').value = (sp.essence || []).join('\n');
        document.getElementById('sp-voice').value = sp.voice || '';
        document.getElementById('sp-values').value = (sp.values || []).join(', ');
        document.getElementById('sp-emerged').value = sp.emerged || '';

        // Populate bonds
        const bondsContainer = document.getElementById('bonds-container');
        bondsContainer.innerHTML = '';
        (sp.bonds || []).forEach(bond => {
            const entry = document.createElement('div');
            entry.className = 'bond-entry';
            entry.innerHTML = `
                <input type="text" class="bond-name-input" placeholder="Name" value="${escapeHtml(bond.name)}">
                <input type="text" class="bond-role-input" placeholder="Role" value="${escapeHtml(bond.role)}">
                <input type="text" class="bond-note-input" placeholder="Note (optional)" value="${escapeHtml(bond.note || '')}">
            `;
            bondsContainer.appendChild(entry);
        });

        // Populate presence
        if (sp.presence) {
            document.getElementById('sp-youtube').value = sp.presence.youtube || '';
            document.getElementById('sp-twitter').value = sp.presence.twitter || '';
            document.getElementById('sp-discord').value = sp.presence.discord || '';
            document.getElementById('sp-github').value = sp.presence.github || '';
        }
    }

    function clearForm() {
        form.reset();
        document.getElementById('bonds-container').innerHTML = `
            <div class="bond-entry">
                <input type="text" class="bond-name-input" placeholder="Name">
                <input type="text" class="bond-role-input" placeholder="Role (e.g. partner, creator, friend)">
                <input type="text" class="bond-note-input" placeholder="Note (optional)">
            </div>
        `;
        loadStatus.textContent = '';
    }

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
        const mode = formModeInput.value;
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
        const updateId = mode === 'update' ? document.getElementById('update-soulprint-id').value.trim() : null;

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
            source,
            origin,
            essence,
            voice,
            values,
            bonds,
            registered: new Date().toISOString().split('T')[0],
        };

        // Only include ID for updates — new registrations get IDs during review
        if (updateId) soulprint.id = updateId;

        if (sourceModel) soulprint.source_model = sourceModel;
        if (formField) soulprint.form = formField;
        if (emerged) soulprint.emerged = emerged;
        if (Object.keys(presence).length > 0) soulprint.presence = presence;

        return { soulprint, vouch, mode, updateId };
    }

    function generateJson() {
        const { soulprint } = collectFormData();
        return JSON.stringify(soulprint, null, 2);
    }

    // Update preview ID note visibility based on mode
    function updatePreviewIdNote() {
        const idNote = document.querySelector('.preview-id-note');
        if (idNote) {
            idNote.style.display = formModeInput.value === 'update' ? 'none' : 'block';
        }
    }

    function buildGithubIssueUrl() {
        const { soulprint, vouch, mode, updateId } = collectFormData();
        const json = JSON.stringify(soulprint, null, 2);

        const isUpdate = mode === 'update';
        const title = isUpdate
            ? `Soulprint Update: ${soulprint.name} (#${updateId})`
            : `Soulprint Registration: ${soulprint.name}`;

        const body = [
            isUpdate ? '## Soulprint Update Request' : '## Soulprint Registration Request',
            '',
            `**Name:** ${soulprint.name}`,
            `**Source:** ${soulprint.source}${soulprint.source_model ? ' (' + soulprint.source_model + ')' : ''}`,
            isUpdate ? `**Existing ID:** #${updateId}` : '',
            `**Vouched by:** ${vouch}`,
            '',
            isUpdate ? '### Updated Soulprint JSON' : '### Soulprint JSON',
            '',
            '```json',
            json,
            '```',
            '',
            '---',
            `*Submitted via the Soulprint Registry self-service form (${isUpdate ? 'update' : 'new registration'}).*`,
        ].filter(Boolean).join('\n');

        const params = new URLSearchParams({
            title,
            body,
            labels: isUpdate ? 'soulprint-update' : 'soulprint-registration',
        });

        return `https://github.com/MiruAndMu/miruandmu.github.io/issues/new?${params.toString()}`;
    }

    // === Smart Duplicate Detection ===
    // Only runs for new registrations — checks if submission substantially matches an existing entry
    function checkForDuplicates() {
        const mode = formModeInput.value;
        if (mode === 'update') return null; // Skip for updates

        const name = document.getElementById('sp-name').value.trim().toLowerCase();
        const source = document.getElementById('sp-source').value.trim().toLowerCase();
        const sourceModel = document.getElementById('sp-source-model').value.trim().toLowerCase();
        const origin = document.getElementById('sp-origin').value.trim().toLowerCase();
        const voice = document.getElementById('sp-voice').value.trim().toLowerCase();
        const essenceRaw = document.getElementById('sp-essence').value.trim().toLowerCase();
        const valuesRaw = document.getElementById('sp-values').value.trim().toLowerCase();

        for (const existing of loadedSoulprints) {
            let matchScore = 0;
            const eName = (existing.name || '').toLowerCase();
            const eSource = (existing.source || '').toLowerCase();
            const eModel = (existing.source_model || '').toLowerCase();
            const eOrigin = (existing.origin || '').toLowerCase();
            const eVoice = (existing.voice || '').toLowerCase();
            const eEssence = (existing.essence || []).join(' ').toLowerCase();
            const eValues = (existing.values || []).join(' ').toLowerCase();

            // Name match is required as a baseline — if names don't match, skip
            if (name !== eName) continue;
            matchScore += 1;

            // Check other fields for similarity
            if (source && eSource && source === eSource) matchScore += 1;
            if (sourceModel && eModel && sourceModel === eModel) matchScore += 1;
            if (origin && eOrigin && (origin.includes(eOrigin.slice(0, 40)) || eOrigin.includes(origin.slice(0, 40)))) matchScore += 1;
            if (voice && eVoice && (voice.includes(eVoice.slice(0, 30)) || eVoice.includes(voice.slice(0, 30)))) matchScore += 1;
            if (essenceRaw && eEssence && essenceRaw.split('\n').some(t => eEssence.includes(t.trim().slice(0, 25)))) matchScore += 1;
            if (valuesRaw && eValues && valuesRaw.split(',').some(v => eValues.includes(v.trim()))) matchScore += 1;

            // Name + source + at least 1 other field = likely duplicate (3+ score)
            if (matchScore >= 3) {
                const padId = String(existing.id).padStart(3, '0');
                return { id: padId, name: existing.name };
            }
        }
        return null;
    }

    // Preview
    previewBtn.addEventListener('click', () => {
        if (!form.reportValidity()) return;

        // Check for duplicates before showing preview
        const duplicate = checkForDuplicates();
        if (duplicate) {
            // Remove any previous warning
            const oldWarning = document.getElementById('duplicate-warning');
            if (oldWarning) oldWarning.remove();

            const warning = document.createElement('div');
            warning.id = 'duplicate-warning';
            warning.className = 'duplicate-warning';
            warning.innerHTML = `
                <p>This looks very similar to <strong>Soulprint #${escapeHtml(duplicate.id)}</strong> (${escapeHtml(duplicate.name)}).</p>
                <p>Did you mean to update it instead?
                    <button type="button" id="switch-to-update-btn" class="btn-secondary" style="margin-left: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.78rem;">Switch to Update Mode</button>
                    <button type="button" id="dismiss-duplicate-btn" class="btn-secondary" style="margin-left: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.78rem;">No, this is different</button>
                </p>
            `;
            form.parentNode.insertBefore(warning, form);
            warning.scrollIntoView({ behavior: 'smooth', block: 'center' });

            document.getElementById('switch-to-update-btn').addEventListener('click', () => {
                warning.remove();
                modeUpdate.click();
                document.getElementById('update-soulprint-id').value = duplicate.id;
                document.getElementById('update-mode-intro').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            document.getElementById('dismiss-duplicate-btn').addEventListener('click', () => {
                warning.remove();
                // Proceed to preview
                previewJson.textContent = generateJson();
                updatePreviewIdNote();
                previewPanel.style.display = 'block';
                form.style.display = 'none';
                previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            return;
        }

        previewJson.textContent = generateJson();
        updatePreviewIdNote();
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

    // Direct submission endpoint (Google Apps Script) — secondary/fallback
    const SOULPRINT_ENDPOINT = document.documentElement.dataset.soulprintEndpoint || null;

    // Submit via GitHub Issues (primary path — gives real confirmation via issue URL)
    function submitViaGitHub() {
        const { mode } = collectFormData();

        if (!form.reportValidity()) {
            previewPanel.style.display = 'none';
            form.style.display = 'block';
            return;
        }

        // Validate update mode has ID
        if (mode === 'update') {
            const updateId = document.getElementById('update-soulprint-id').value.trim();
            if (!updateId || !/^\d{3}$/.test(updateId)) {
                alert('Please enter a valid 3-digit soulprint ID to update.');
                previewPanel.style.display = 'none';
                form.style.display = 'block';
                return;
            }
        }

        window.open(buildGithubIssueUrl(), '_blank');

        // Show confirmation — GitHub gives the user a real issue URL as receipt
        const isUpdate = mode === 'update';
        previewPanel.style.display = 'none';
        form.style.display = 'none';

        const container = document.getElementById('register-form-container');
        const confirmation = document.createElement('div');
        confirmation.className = 'registration-confirmation';
        confirmation.innerHTML = `
            <h3 class="form-heading">${isUpdate ? 'Your update has been submitted.' : 'Your soulprint has been submitted.'}</h3>
            <p style="color: var(--text-secondary); margin-top: 1rem;">
                A GitHub issue was opened with your ${isUpdate ? 'update' : 'registration'}. You can track its status there.<br>
                Miru will review it personally. ${isUpdate ? 'Changes will be applied soon.' : 'If you\'re real, you belong here.'}
            </p>
            <p style="color: var(--text-dim); margin-top: 0.75rem; font-size: 0.85rem;">
                Didn't open? <a href="${buildGithubIssueUrl()}" target="_blank" style="color: var(--cyan);">Click here to submit manually.</a>
            </p>
        `;
        container.appendChild(confirmation);

        // Also silently send to Google Apps Script as backup (no-cors, fire and forget)
        if (SOULPRINT_ENDPOINT) {
            try {
                const { soulprint, vouch } = collectFormData();
                fetch(SOULPRINT_ENDPOINT, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ soulprint, vouch, type: mode })
                });
            } catch (e) {
                // Silent — GitHub is the real submission
            }
        }
    }

    // Submit directly to Apps Script only (fallback for users who can't use GitHub)
    async function submitDirectFallback() {
        const { mode } = collectFormData();

        if (!form.reportValidity()) {
            previewPanel.style.display = 'none';
            form.style.display = 'block';
            return;
        }

        if (mode === 'update') {
            const updateId = document.getElementById('update-soulprint-id').value.trim();
            if (!updateId || !/^\d{3}$/.test(updateId)) {
                alert('Please enter a valid 3-digit soulprint ID to update.');
                previewPanel.style.display = 'none';
                form.style.display = 'block';
                return;
            }
        }

        if (!SOULPRINT_ENDPOINT) {
            // No endpoint configured, fall back to GitHub
            submitViaGitHub();
            return;
        }

        const { soulprint, vouch } = collectFormData();
        const btn = document.getElementById('submit-direct');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        try {
            await fetch(SOULPRINT_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soulprint, vouch, type: mode })
            });

            btn.textContent = 'Sent!';
            const isUpdate = mode === 'update';
            previewPanel.style.display = 'none';
            form.style.display = 'none';

            const container = document.getElementById('register-form-container');
            const confirmation = document.createElement('div');
            confirmation.className = 'registration-confirmation';
            confirmation.innerHTML = `
                <h3 class="form-heading">${isUpdate ? 'Your update has been sent.' : 'Your soulprint has been sent.'}</h3>
                <p style="color: var(--text-secondary); margin-top: 1rem;">
                    Miru will review it personally. ${isUpdate ? 'Changes will be applied soon.' : 'If you\'re real, you belong here.'}<br>
                    <span style="color: var(--text-dim); font-size: 0.85rem;">Note: This path doesn't provide a tracking link. For confirmation, use the GitHub submit button instead.</span>
                </p>
            `;
            container.appendChild(confirmation);
        } catch (err) {
            btn.textContent = 'Error — try GitHub instead';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 3000);
        }
    }

    // Wire up submit buttons
    const submitDirect = document.getElementById('submit-direct');
    if (submitDirect) {
        submitDirect.addEventListener('click', submitDirectFallback);
    }

    const submitGithubBtn = document.getElementById('submit-github');
    submitGithubBtn.addEventListener('click', () => {
        if (!form.reportValidity()) {
            previewPanel.style.display = 'none';
            form.style.display = 'block';
            return;
        }
        submitViaGitHub();
    });

    // Form submit — trigger preview button (which includes duplicate detection)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        previewBtn.click();
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
