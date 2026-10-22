// Manejo de la Intro con Transición Progresiva Limpia

document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('cp-intro-overlay');
    const introVideo = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');

    let desvaneciendo = false;

    function iniciarDesvanecimiento() {
        if (desvaneciendo || !introOverlay) return;
        desvaneciendo = true;

        // Desbloquea el desplazamiento antes de que comience el fade
        document.body.style.overflow = 'auto';

        // Aplica la clase que inicia el desvanecimiento CSS suave (opacity: 0)
        introOverlay.classList.add('cp-fade-out');

        // Al finalizar la transición de 1.5 segundos, oculta el contenedor
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 1500);
    }

    // Asegura el bloqueo de scroll mientras el video está activo
    if (introOverlay) {
        document.body.style.overflow = 'hidden';
    }

    if (introVideo) {
        // Inicia el desvanecimiento 1.2 segundos antes de que termine el video
        introVideo.addEventListener('timeupdate', () => {
            if (introVideo.duration && (introVideo.duration - introVideo.currentTime <= 1.2)) {
                iniciarDesvanecimiento();
            }
        });

        introVideo.addEventListener('ended', iniciarDesvanecimiento);

        introVideo.play().catch(error => {
            console.log("Autoplay con sonido bloqueado, reproduciendo...", error);
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', iniciarDesvanecimiento);
    }
});