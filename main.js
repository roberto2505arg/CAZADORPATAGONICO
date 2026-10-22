document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('cp-intro-overlay');
    const video = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');
    let fading = false;

    function unlockPage() {
        if (fading || !overlay) return;
        fading = true;
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
        overlay.classList.add('cp-fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';
            if (video) { video.pause(); }
        }, 1400);
    }

    async function tryPlay() {
        if (!video) return;
        try {
            video.muted = true;
            video.playsInline = true;
            await video.play();
        } catch (e) {
            console.log('Autoplay bloqueado, esperando interacción');
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
            console.error('Error cargando video/intro.mp4 - verifica /video/ en GitHub');
            unlockPage();
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            unlockPage();
        });
    }

    // Seguridad: libera a los 10s aunque el video falle
    setTimeout(() => { unlockPage(); }, 10000);
});
