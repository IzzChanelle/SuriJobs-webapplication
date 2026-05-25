// sidebar.js — sidebar collapse, mobile, avatar, dashboard link
(function () {
    const sidebar   = document.getElementById('sidebar');
    const toggle    = document.getElementById('sidebarToggle');
    const mobileBtn = document.getElementById('mobileToggle');

    if (!sidebar) return;

    // Restore collapsed state
    if (localStorage.getItem('sj_sidebar') === 'collapsed') {
        sidebar.classList.add('collapsed');
    }

    toggle?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sj_sidebar', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    });

    // Mobile open/close
    mobileBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && e.target !== mobileBtn) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Show dashboard link + update mode badge for business users
    try {
        const raw = localStorage.getItem('surijobs_user');
        if (raw) {
            const u = JSON.parse(raw);

            // Dashboard link visibility
            const dashLink = document.getElementById('dashboardLink');
            if (dashLink && u.active_mode === 'business') {
                dashLink.style.display = 'block';
            }

            // Topbar avatar
            const avatar = document.getElementById('topbarAvatar');
            if (avatar && u.photo) avatar.src = u.photo;
        }
    } catch (e) { /* silent */ }
})();
