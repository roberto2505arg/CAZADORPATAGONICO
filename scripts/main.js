// Manejo de la Intro con Transición Progresiva (Fade Out)

document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('cp-intro-overlay');
    const introVideo = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');

    let desvaneciendo = false;

    function iniciarDesvanecimiento() {
        if (desvaneciendo || !introOverlay) return;
        desvaneciendo = true;

        // Inicia el desvanecimiento CSS (transparencia)
        introOverlay.classList.add('cp-fade-out');

        // Permite interactuar con la página que está debajo mientras se vuelve transparente
        introOverlay.style.pointerEvents = 'none';
        document.body.style.overflow = 'auto';

        // Una vez terminada la animación (1.8 segundos), oculta completamente el contenedor
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 1800);
    }

    // Bloquea el desplazamiento del cuerpo mientras la intro es opaca
    if (introOverlay) {
        document.body.style.overflow = 'hidden';
    }

    if (introVideo) {
        // Detecta cuando faltan 1.5 segundos para que termine el video para iniciar la transición suave
        introVideo.addEventListener('timeupdate', () => {
            if (introVideo.duration && (introVideo.duration - introVideo.currentTime <= 1.5)) {
                iniciarDesvanecimiento();
            }
        });

        // Al finalizar por completo el video
        introVideo.addEventListener('ended', iniciarDesvanecimiento);

        // Reproducción automática silenciada
        introVideo.play().catch(error => {
            console.log("Autoplay bloqueado por el navegador:", error);
        });
    }

    // Botón para saltar / ingresar manualmente
    if (skipBtn) {
        skipBtn.addEventListener('click', iniciarDesvanecimiento);
    }
});