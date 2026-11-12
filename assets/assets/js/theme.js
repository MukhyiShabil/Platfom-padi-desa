/**
 * PLATFORM PADI DESA - THEME CONTROLLER (LIGHT & DARK MODE)
 */

(function () {
    const savedTheme = localStorage.getItem('appTheme') || 'dark';

    function applyThemeToDOM(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (document.body) {
            document.body.setAttribute('data-theme', theme);
            if (theme === 'light') {
                document.body.classList.add('theme-light');
                document.body.classList.remove('theme-dark');
            } else {
                document.body.classList.add('theme-dark');
                document.body.classList.remove('theme-light');
            }
        }
    }

    // Terapkan secepatnya
    applyThemeToDOM(savedTheme);

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function updateToggleButton(theme) {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;

        if (theme === 'light') {
            btn.innerHTML = '<span class="theme-toggle-icon">🌙</span><span class="theme-toggle-text">Gelap</span>';
            btn.setAttribute('title', 'Beralih ke Mode Gelap');
            btn.setAttribute('aria-label', 'Beralih ke Mode Gelap');
        } else {
            btn.innerHTML = '<span class="theme-toggle-icon">☀️</span><span class="theme-toggle-text">Terang</span>';
            btn.setAttribute('title', 'Beralih ke Mode Terang');
            btn.setAttribute('aria-label', 'Beralih ke Mode Terang');
        }
    }

    function setTheme(theme) {
        applyThemeToDOM(theme);
        localStorage.setItem('appTheme', theme);
        updateToggleButton(theme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    function toggleTheme() {
        const next = getTheme() === 'light' ? 'dark' : 'light';
        setTheme(next);
    }

    function injectThemeButton() {
        applyThemeToDOM(getTheme());

        // Cek apakah tombol sudah ada
        if (document.getElementById('themeToggleBtn')) {
            updateToggleButton(getTheme());
            return;
        }

        const navMenu = document.querySelector('.navbar-menu');
        if (!navMenu) return;

        const btn = document.createElement('button');
        btn.id = 'themeToggleBtn';
        btn.type = 'button';
        btn.className = 'theme-toggle-btn';
        btn.onclick = toggleTheme;

        // Tempatkan sebelum .user-info atau .logout-btn
        const userInfo = navMenu.querySelector('.user-info');
        const logoutBtn = navMenu.querySelector('.logout-btn, button[onclick*="Logout"], a[onclick*="Logout"]');

        if (userInfo) {
            navMenu.insertBefore(btn, userInfo);
        } else if (logoutBtn) {
            navMenu.insertBefore(btn, logoutBtn);
        } else {
            navMenu.appendChild(btn);
        }

        updateToggleButton(getTheme());
    }

    // Jalankan saat DOM sudah siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyThemeToDOM(getTheme());
            injectThemeButton();
        });
    } else {
        applyThemeToDOM(getTheme());
        injectThemeButton();
    }

    // Expose ke global window
    window.toggleTheme = toggleTheme;
    window.setTheme = setTheme;
    window.getTheme = getTheme;
})();
