document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('cp-intro-overlay');
    const video = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');
    let fading = false;

    // Carga dinámica forzada de la fuente de video correcta según el tamaño de la pantalla
    function setVideoSource() {
        if (!video) return;
        const isMobile = window.innerWidth <= 650;
        const targetSrc = isMobile ? 'video/intro_celu.mp4' : 'video/intro.mp4';
        
        // Verifica si la fuente actual coincide para evitar recargas innecesarias
        if (!video.currentSrc.includes(targetSrc)) {
            video.src = targetSrc;
            video.load();
        }
    }

    setVideoSource();

    function unlockPage() {
        if (fading || !overlay) return;
        fading = true;

        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';

        overlay.classList.add('cp-fade-out');

        setTimeout(() => {
            overlay.style.display = 'none';
            if (video) {
                video.pause();
            }
        }, 1400);
    }

    async function tryPlay() {
        if (!video) return;
        try {
            video.muted = true;
            video.playsInline = true;
            await video.play();
        } catch (e) {
            console.log('Autoplay restringido por el navegador, requiriendo toque.', e);
            if (skipBtn) {
                skipBtn.innerHTML = '<span>TOCÁ PARA INGRESAR <i class="fa-solid fa-play"></i></span>';
                skipBtn.style.background = '#d4a359';
                skipBtn.style.color = '#0d0e10';
            }
        }
    }

    if (overlay) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.overflowX = 'hidden';
    }

    tryPlay();

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.closest('#cp-skip-btn')) {
                unlockPage();
            } else {
                if (video && video.paused) {
                    tryPlay().then(() => {
                        setTimeout(() => { if (video.paused) unlockPage(); }, 600);
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
            console.error('Error cargando el video.');
            unlockPage();
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            unlockPage();
        });
    }

    // Temporizador de respaldo
    setTimeout(() => { unlockPage(); }, 10000);
});