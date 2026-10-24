document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('cp-intro-overlay');
    const video = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');
    let fading = false;
    let currentSrc = '';

    // ---------------------------------------------------------
    // DETECCIÓN ROBUSTA DE DISPOSITIVO MÓVIL
    // ---------------------------------------------------------
    function isMobileDevice() {
        // 1. User agent clásico (muy confiable para celus reales)
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(ua);

        // 2. matchMedia con pointer coarse (dedos, no mouse)
        const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

        // 3. Ancho real del viewport (ya no confiamos solo en esto)
        const narrowViewport = window.innerWidth <= 768;

        // Es móvil si: tiene UA móvil, O tiene puntero táctil Y pantalla angosta
        return uaMobile || (coarsePointer && narrowViewport);
    }

    // ---------------------------------------------------------
    // ASIGNAR EL VIDEO CORRECTO
    // ---------------------------------------------------------
    function initIntroVideo() {
        if (!video) return;

        const isMobile = isMobileDevice();
        const videoSrc = isMobile ? 'video/intro_celu.mp4' : 'video/intro.mp4';

        // Evita recargar si ya está puesto
        if (currentSrc === videoSrc) return;
        currentSrc = videoSrc;

        console.log('[CP-Intro] Dispositivo móvil:', isMobile, '→ video:', videoSrc);

        // MÉTODO ROBUSTO: asignar src directo (funciona mejor en iOS/Android)
        video.src = videoSrc;

        // Fallback por si el navegador necesita un <source> explícito
        // (no lo agregamos al DOM para no duplicar; solo aseguramos src)

        video.load();

        // Intentar reproducir cuando haya datos suficientes
        video.addEventListener('loadeddata', () => {
            tryPlay();
        }, { once: true });
    }

    initIntroVideo();

    // ---------------------------------------------------------
    // DESBLOQUEAR PÁGINA
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // EVENTOS
    // ---------------------------------------------------------
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
            console.error('[CP-Intro] Error cargando el video:', video.error);
            // Si falla el móvil, intentar con el de PC como fallback
            if (isMobileDevice() && currentSrc !== 'video/intro.mp4') {
                console.warn('[CP-Intro] Fallback a intro.mp4');
                currentSrc = 'video/intro.mp4';
                video.src = 'video/intro.mp4';
                video.load();
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