document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('cp-intro-overlay');
    const video = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');
    let fading = false;
    let currentSrc = '';
    let playAttempted = false;

    // ========================================================
    // DETECCIÓN DE MÓVIL (múltiples señales combinadas)
    // ========================================================
    function isMobileDevice() {
        const ua = navigator.userAgent || navigator.vendor || '';
        const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS/i.test(ua);

        let coarsePointer = false;
        try {
            coarsePointer = window.matchMedia('(pointer: coarse)').matches;
        } catch (e) {}

        let narrow = false;
        try {
            narrow = window.innerWidth <= 820;
        } catch (e) {}

        // También detectar pantallas touch (algunos tablets)
        const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Es móvil si: UA móvil O (touch + pantalla angosta) O (coarse pointer + angosta)
        const result = uaMobile || (hasTouch && narrow) || (coarsePointer && narrow);

        console.log('[CP-Intro] Detección →',
            { ua, uaMobile, coarsePointer, narrow, hasTouch, result });

        return result;
    }

    // ========================================================
    // ASIGNAR EL VIDEO CORRECTO (limpiando cache)
    // ========================================================
    function initIntroVideo() {
        if (!video) return;

        const isMobile = isMobileDevice();
        const baseSrc = isMobile ? 'video/intro_celu.mp4' : 'video/intro.mp4';
        // Query string anti-cache (cambia si actualizás el video)
        const videoSrc = baseSrc + '?v=2';

        if (currentSrc === videoSrc) return;
        currentSrc = videoSrc;

        console.log('[CP-Intro] Video elegido →', videoSrc);

        // LIMPIAR el src anterior para forzar recarga real
        video.pause();
        video.removeAttribute('src');
        // Eliminar cualquier <source> hijo por las dudas
        while (video.firstChild) {
            video.removeChild(video.firstChild);
        }
        video.load();

        // Asignar el nuevo src
        video.src = videoSrc;
        video.load();

        // Reproducir cuando haya datos disponibles (múltiples eventos por si uno no dispara)
        const tryPlayOnce = () => {
            if (playAttempted) return;
            playAttempted = true;
            tryPlay();
        };

        video.addEventListener('loadeddata', tryPlayOnce, { once: true });
        video.addEventListener('canplay', tryPlayOnce, { once: true });
        video.addEventListener('loadedmetadata', tryPlayOnce, { once: true });

        // Si a los 1.5s no cargó nada, intentar igual
        setTimeout(tryPlayOnce, 1500);
    }

    initIntroVideo();

    // ========================================================
    // DESBLOQUEAR PÁGINA
    // ========================================================
    function unlockPage() {
        if (fading || !overlay) return;
        fading = true;

        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';

        overlay.classList.add('cp-fade-out');

        setTimeout(() => {
            overlay.style.display = 'none';
            if (video) video.pause();
        }, 1400);
    }

    async function tryPlay() {
        if (!video) return;
        try {
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            await video.play();
            console.log('[CP-Intro] Reproduciendo:', video.currentSrc);
        } catch (e) {
            console.log('[CP-Intro] Autoplay bloqueado, esperando toque.', e);
            if (skipBtn) {
                skipBtn.innerHTML = '<span>TOCÁ PARA INGRESAR <i class="fa-solid fa-play"></i></span>';
                skipBtn.style.background = '#d4a359';
                skipBtn.style.color = '#0d0e10';
            }
        }
    }

    // Bloquear scroll mientras está el overlay
    if (overlay) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.overflowX = 'hidden';
    }

    // ========================================================
    // EVENTOS
    // ========================================================
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.closest('#cp-skip-btn')) {
                unlockPage();
            } else {
                if (video && video.paused) {
                    tryPlay().then(() => {
                        setTimeout(() => { if (video && video.paused) unlockPage(); }, 600);
                    });
                }
            }
        });
    }

    if (video) {
        video.addEventListener('timeupdate', () => {
            if (video.duration && (video.duration - video.currentTime <= 0.8)) {
                unlockPage();
            }
        });

        video.addEventListener('ended', unlockPage);

        video.addEventListener('error', () => {
            console.error('[CP-Intro] Error cargando el video:', video.error, 'src:', video.src);
            // Fallback: si falla el móvil, usar el de PC
            if (currentSrc && currentSrc.indexOf('intro_celu.mp4') !== -1) {
                console.warn('[CP-Intro] Fallback a intro.mp4');
                currentSrc = 'video/intro.mp4?v=2';
                video.src = 'video/intro.mp4?v=2';
                video.load();
                playAttempted = false;
                video.addEventListener('loadeddata', () => tryPlay(), { once: true });
                return;
            }
            unlockPage();
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            unlockPage();
        });
    }

    // Respaldo de seguridad
    setTimeout(() => { unlockPage(); }, 10000);
});