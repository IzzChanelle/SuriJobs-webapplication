// ============================================
// topnav.js — horizontal LinkedIn-style navbar
// with Dark Mode + EN/NL language toggle
// Icons: CSS mask classes (navbar.css) for nav links,
//        inline SVG for utility buttons/dropdowns
// ============================================
(function () {

    // ============================================
    // INLINE SVGs — used only for utility buttons
    // and dropdown items (NOT for .nav-icon spans)
    // ============================================
    const SVG = {
        individual: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        business:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M9 21V9h6v12"/></svg>`,
        logout:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
        bell:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
        sun:        `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
        moon:       `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
        globe:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        search:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    };

    // ============================================
    // TRANSLATIONS
    // ============================================
    const TRANSLATIONS = {
        nl: {
            home: 'Home', jobs: 'Vacatures', services: 'Diensten',
            market: 'Markt', search: 'Zoeken', chat: 'Chat',
            notifications: 'Meldingen', profile: 'Profiel', dashboard: 'Dashboard',
            iSearch: 'Ik zoek', iOffer: 'Ik bied',
            myProfile: 'Mijn profiel', logout: 'Uitloggen',
            searchPlaceholder: 'Zoeken...',
        },
        en: {
            home: 'Home', jobs: 'Jobs', services: 'Services',
            market: 'Market', search: 'Search', chat: 'Chat',
            notifications: 'Alerts', profile: 'Profile', dashboard: 'Dashboard',
            iSearch: 'I seek', iOffer: 'I offer',
            myProfile: 'My profile', logout: 'Log out',
            searchPlaceholder: 'Search...',
        }
    };

    // ============================================
    // PERSISTED PREFERENCES
    // ============================================
    let lang = localStorage.getItem('sj_lang') || 'nl';
    let dark = localStorage.getItem('sj_dark') === '1';

    function t(key) { return (TRANSLATIONS[lang] || TRANSLATIONS.nl)[key] || key; }

    function applyDark() {
        document.documentElement.classList.toggle('dark', dark);
        const btn = document.getElementById('darkToggleBtn');
        if (btn) btn.innerHTML = dark ? SVG.sun : SVG.moon;
        localStorage.setItem('sj_dark', dark ? '1' : '0');
    }

    function applyLang() {
        localStorage.setItem('sj_lang', lang);
        const labelMap = {
            'index.html': 'home', 'werkgelegenheid.html': 'jobs',
            'diensten.html': 'services', 'markt.html': 'market',
            'zoeken.html': 'search', 'chat.html': 'chat',
            'notifications.html': 'notifications', 'profiel.html': 'profile',
            'dashboard.html': 'dashboard'
        };
        document.querySelectorAll('.topnav-link').forEach(a => {
            const href = a.getAttribute('href');
            const key = labelMap[href];
            if (key) {
                const labelEl = a.querySelector('.nav-label');
                if (labelEl) labelEl.textContent = t(key);
            }
        });
        // Mode buttons
        const modeBtns = document.querySelectorAll('#topnavMode button');
        if (modeBtns[0]) modeBtns[0].innerHTML = `${SVG.individual} <span>${t('iSearch')}</span>`;
        if (modeBtns[1]) modeBtns[1].innerHTML = `${SVG.business} <span>${t('iOffer')}</span>`;
        // Search placeholder
        const sp = document.getElementById('topnavSearch');
        if (sp) sp.placeholder = t('searchPlaceholder');
        // Dropdown items
        const dp = document.querySelector('.topnav-dropdown-item[href="profiel.html"]');
        if (dp) dp.innerHTML = `${SVG.individual} <span>${t('myProfile')}</span>`;
        const dp2 = document.querySelector('.topnav-dropdown-item[href="notifications.html"]');
        if (dp2) dp2.innerHTML = `${SVG.bell} <span>${t('notifications')}</span>`;
        const lo = document.getElementById('topnavLogout');
        if (lo) lo.innerHTML = `${SVG.logout} <span>${t('logout')}</span>`;
        // Lang button
        const lb = document.getElementById('langToggleBtn');
        if (lb) lb.innerHTML = `${SVG.globe} <span>${lang === 'nl' ? 'EN' : 'NL'}</span>`;
    }

    // ============================================
    // DARK MODE CSS vars injection
    // ============================================
    const darkStyle = document.createElement('style');
    darkStyle.textContent = `
        html.dark {
            --bg:           #111827;
            --card:         #1F2937;
            --sidebar-bg:   #111827;
            --topbar-bg:    #1F2937;
            --text:         #F9FAFB;
            --text-dim:     #9CA3AF;
            --text-muted:   #6B7280;
            --text-sidebar: #9CA3AF;
            --border:       #374151;
            --border-strong:#4B5563;
            --green-light:  #052e16;
            --red-light:    #2d0a12;
            --gold-light:   #1c1400;
            color-scheme: dark;
        }
        html.dark .topnav { background: #1F2937; border-bottom-color: #374151; box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
        html.dark .topnav-link:hover { background: #374151; }
        html.dark .topnav-dropdown { background: #1F2937; border-color: #374151; }
        html.dark .topnav-dropdown-item:hover { background: #374151; }
        html.dark .topnav-mode { background: #111827; border-color: #374151; }
        html.dark .search-box { background: #111827; border-color: #374151; }
        html.dark .search-box:focus-within { background: #1F2937; }
        html.dark .search-box input { color: #F9FAFB; }
        html.dark .notification-card.unread { background: #1a1f2b; }
        html.dark .topnav-utility-btn { background: #374151; border-color: #4B5563; color: #D1D5DB; }
        html.dark .topnav-utility-btn:hover { background: #4B5563; color: #F9FAFB; }
        html.dark select.profile-input option,
        html.dark select.form-input option { background: #1F2937; color: #F9FAFB; }
        html.dark .modal-content,
        html.dark .product-modal-content { background: #1F2937; border-color: #374151; }
        html.dark .auth-card { background: #1F2937; border-color: #374151; }
        html.dark .profile-card, html.dark .mode-switch-card, html.dark .home-card,
        html.dark .metric-card, html.dark .my-job-card, html.dark .applicant-row,
        html.dark .notification-card, html.dark .job-card, html.dark .service-card,
        html.dark .market-card, html.dark .tabs-section, html.dark .conversations-sidebar,
        html.dark .chat-main, html.dark .chat-header { background: #1F2937; border-color: #374151; }
        html.dark .tag { background: #374151; border-color: #4B5563; color: #D1D5DB; }
        html.dark .tag.green { background: #052e16; color: #34d399; }
        html.dark .tag.red   { background: #2d0a12; color: #f87171; }
        html.dark .tag.blue  { background: #1e1b4b; color: #818cf8; }
        html.dark .save-btn  { background: rgba(31,41,55,0.92); border-color: #374151; color: #9CA3AF; }
        html.dark .market-save { background: rgba(31,41,55,0.92); border-color: #374151; }
        html.dark .filter-sidebar { background: #1F2937; }
        html.dark .filter-sidebar.active { border-color: #374151; }
        html.dark .close-modal, html.dark .close-product-modal { background: #374151; border-color: #4B5563; color: #9CA3AF; }
        html.dark .btn-secondary { background: #374151; border-color: #4B5563; color: #D1D5DB; }
        html.dark .home-profile-strip { background: #1F2937; border-color: #374151; }
        html.dark .saved-card, html.dark .trending-card, html.dark .market-mini-card { background: #1F2937; border-color: #374151; }
        html.dark .message-received { background: #374151; border-color: #4B5563; color: #F9FAFB; }
        html.dark .chat-input-area { border-top-color: #374151; }
        html.dark .chat-input-area input { background: #111827; border-color: #374151; color: #F9FAFB; }
        html.dark .conversation-item:hover { background: #374151; }
        html.dark .conversation-item.active { background: #052e16; }
        html.dark .skill-tag { background: #052e16; border-color: rgba(52,211,153,0.2); color: #34d399; }
        html.dark .profile-photo-upload img { border-color: #374151; }
        html.dark .progress-bar { background: #374151; border-color: #4B5563; }
        html.dark .stat-box { background: #374151; border-color: #4B5563; }
        html.dark .my-job-card-stats { border-top-color: #374151; }
        html.dark .market-user { border-top-color: #374151; }
        html.dark .topnav-avatar { border-color: #374151; }
    `;
    document.head.appendChild(darkStyle);

    if (dark) document.documentElement.classList.add('dark');

    // ============================================
    // NAV LINKS — iconClass maps to CSS mask class
    // ============================================
    const LINKS = [
        { href: 'index.html',           iconClass: 'icon-home',          labelKey: 'home'          },
        { href: 'werkgelegenheid.html',  iconClass: 'icon-jobs',          labelKey: 'jobs'          },
        { href: 'diensten.html',         iconClass: 'icon-services',      labelKey: 'services'      },
        { href: 'markt.html',            iconClass: 'icon-market',        labelKey: 'market'        },
        { href: 'zoeken.html',           iconClass: 'icon-people',        labelKey: 'search'        },
        { href: 'chat.html',             iconClass: 'icon-chat',          labelKey: 'chat'          },
        { href: 'notifications.html',    iconClass: 'icon-notifications', labelKey: 'notifications', id: 'navNotif' },
        { href: 'profiel.html',          iconClass: 'icon-profile',       labelKey: 'profile'       },
        { href: 'dashboard.html',        iconClass: 'icon-dashboard',     labelKey: 'dashboard',    business: true },
    ];

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let user = null;
    try { user = JSON.parse(localStorage.getItem('surijobs_user')); } catch(e) {}
    const isBiz = user && user.active_mode === 'business';

    // ============================================
    // BUILD NAVBAR
    // ============================================
    const navLinksHtml = LINKS
        .filter(l => !l.business || isBiz)
        .map(l => {
            const active = currentPage === l.href ? 'active' : '';
            // .nav-icon gets the CSS mask class — NO inline SVG here
            return `<a class="topnav-link ${active}" href="${l.href}" ${l.id ? `id="${l.id}"` : ''}>
                <span class="nav-icon ${l.iconClass}"></span>
                <span class="nav-label">${t(l.labelKey)}</span>
            </a>`;
        }).join('');

    const avatar = (user && user.photo) ? user.photo : 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

    const nav = document.createElement('nav');
    nav.className = 'topnav';
    nav.id = 'topnav';
    nav.innerHTML = `
        <a class="topnav-logo" href="index.html">
            <span class="suri">Suri</span><span class="jobs">Jobs</span>
        </a>

        <div class="topnav-links" id="topnavLinks">
            ${navLinksHtml}
        </div>

        <div class="topnav-right">

            <div class="topnav-search" style="margin-right:8px;">
                <div class="search-box" style="width:190px; transition: width 0.25s ease;">
                    <span class="search-icon">${SVG.search}</span>
                    <input type="text" placeholder="${t('searchPlaceholder')}" id="topnavSearch">
                    <button id="topnavClear">×</button>
                </div>
            </div>

            <div class="topnav-mode" id="topnavMode">
                <button class="${!isBiz ? 'active' : ''}" data-mode="individual">${SVG.individual} <span>${t('iSearch')}</span></button>
                <button class="business ${isBiz ? 'active' : ''}" data-mode="business">${SVG.business} <span>${t('iOffer')}</span></button>
            </div>

            <button class="topnav-utility-btn" id="langToggleBtn" title="Toggle language">
                ${SVG.globe} <span>${lang === 'nl' ? 'EN' : 'NL'}</span>
            </button>

            <button class="topnav-utility-btn" id="darkToggleBtn" title="Toggle dark mode">
                ${dark ? SVG.sun : SVG.moon}
            </button>

            <div class="topnav-avatar-wrap" id="topnavAvatarWrap">
                <img class="topnav-avatar" id="topnavAvatar" src="${avatar}" alt="Profiel">
                <div class="topnav-dropdown" id="topnavDropdown">
                    <a class="topnav-dropdown-item" href="profiel.html">${SVG.individual} <span>${t('myProfile')}</span></a>
                    <a class="topnav-dropdown-item" href="notifications.html">${SVG.bell} <span>${t('notifications')}</span></a>
                    <div class="topnav-dropdown-divider"></div>
                    <div class="topnav-dropdown-item danger" id="topnavLogout">${SVG.logout} <span>${t('logout')}</span></div>
                </div>
            </div>
        </div>
    `;

    document.body.insertBefore(nav, document.body.firstChild);

    // ============================================
    // UTILITY BUTTON STYLES
    // ============================================
    const utilStyle = document.createElement('style');
    utilStyle.textContent = `
        .topnav-utility-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border-radius: var(--r-full);
            font-size: 0.75rem;
            font-weight: 600;
            background: var(--bg);
            border: 1px solid var(--border);
            color: var(--text-dim);
            cursor: pointer;
            transition: background var(--t), color var(--t), border-color var(--t);
            white-space: nowrap;
            flex-shrink: 0;
        }
        .topnav-utility-btn svg { flex-shrink: 0; }
        .topnav-utility-btn:hover {
            background: var(--card);
            color: var(--text);
            border-color: var(--border-strong);
        }
        #topnavMode button {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        #topnavMode button svg { flex-shrink: 0; }
        .topnav-dropdown-item svg { flex-shrink: 0; opacity: 0.65; }
        @media (max-width: 768px) {
            .topnav-utility-btn { padding: 4px 7px; font-size: 0.7rem; }
            .topnav-search { display: none !important; }
        }
    `;
    document.head.appendChild(utilStyle);

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.getElementById('topnavAvatar').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('topnavDropdown').classList.toggle('open');
    });
    document.addEventListener('click', () => document.getElementById('topnavDropdown').classList.remove('open'));

    document.getElementById('topnavLogout').addEventListener('click', () => {
        if (typeof Auth !== 'undefined') Auth.logout();
        else { localStorage.clear(); window.location.href = 'login.html'; }
    });

    document.getElementById('topnavClear').addEventListener('click', () => {
        document.getElementById('topnavSearch').value = '';
        document.getElementById('topnavSearch').focus();
    });

    document.getElementById('darkToggleBtn').addEventListener('click', () => {
        dark = !dark;
        applyDark();
    });

    document.getElementById('langToggleBtn').addEventListener('click', () => {
        lang = lang === 'nl' ? 'en' : 'nl';
        applyLang();
    });

    document.querySelectorAll('#topnavMode button').forEach(btn => {
        btn.addEventListener('click', async () => {
            const mode = btn.dataset.mode;
            if (!user || mode === user.active_mode) return;
            try {
                if (typeof api !== 'undefined') {
                    await api('/auth/mode', { method: 'POST', body: { mode } });
                }
                const u = Auth.user;
                u.active_mode = mode;
                if (mode === 'business') u.has_business = true;
                Auth.user = u;

                const page = window.location.pathname.split('/').pop();
                if (mode === 'business' && (page === 'werkgelegenheid.html' || page === 'index.html')) {
                    setTimeout(() => window.location.href = 'dashboard.html', 400);
                } else if (mode === 'individual' && page === 'dashboard.html') {
                    setTimeout(() => window.location.href = 'werkgelegenheid.html', 400);
                } else {
                    setTimeout(() => window.location.reload(), 400);
                }
            } catch(e) {
                if (typeof toast !== 'undefined') toast(e.message, 'error');
            }
        });
    });

    // ============================================
    // NOTIFICATION BADGE
    // ============================================
    async function loadNotifBadge() {
        const el = document.getElementById('navNotif');
        if (!el || typeof api === 'undefined') return;
        try {
            const { count } = await api('/notifications/unread-count');
            const existing = el.querySelector('.nav-badge');
            if (existing) existing.remove();
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'nav-badge';
                badge.textContent = count > 9 ? '9+' : count;
                el.appendChild(badge);
            }
        } catch(e) { /* silent */ }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
            loadNotifBadge();
        }
    });

    window.updateNotifBadge = loadNotifBadge;
    window._topnavBuilt = true;

})();
