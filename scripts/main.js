document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('cp-intro-overlay');
    const introVideo = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');

    let desvaneciendo = false;

    function iniciarDesvanecimiento() {
        if (desvaneciendo || !introOverlay) return;
        desvaneciendo = true;

        document.body.style.overflow = 'auto';
        introOverlay.classList.add('cp-fade-out');

        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 1500);
    }

    if (introOverlay) {
        document.body.style.overflow = 'hidden';
    }

    if (introVideo) {
        introVideo.addEventListener('timeupdate', () => {
            if (introVideo.duration && (introVideo.duration - introVideo.currentTime <= 1.2)) {
                iniciarDesvanecimiento();
            }
        });

        introVideo.addEventListener('ended', iniciarDesvanecimiento);

        introVideo.play().catch(error => {
            console.log("Autoplay con sonido restringido por el navegador.", error);
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', iniciarDesvanecimiento);
    }
});