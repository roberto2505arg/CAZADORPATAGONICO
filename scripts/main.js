
document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('cp-intro-overlay');
    const introVideo = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');

    let desvaneciendo = false;

    function iniciarDesvanecimiento() {
        if (desvaneciendo || !introOverlay) return;
        desvaneciendo = true;
        // Restaurar scroll
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
        
        introOverlay.classList.add('cp-fade-out');
        setTimeout(() => {
            introOverlay.style.display = 'none';
            // Asegurar que la pagina quede arriba despues del intro
            window.scrollTo({top: 0, behavior: 'instant'});
        }, 1500);
    }

    if (introOverlay) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.overflowX = 'hidden';
    }

    if (introVideo) {
        // Si falla el autoplay, igual mostrar boton y permitir entrada
        const playPromise = introVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log("Autoplay bloqueado, esperando click en INGRESAR");
                // Si bloquea, no ocultamos automatico
            });
        }

        introVideo.addEventListener('timeupdate', () => {
            if (introVideo.duration && (introVideo.duration - introVideo.currentTime <= 1.0)) {
                iniciarDesvanecimiento();
            }
        });
        introVideo.addEventListener('ended', iniciarDesvanecimiento);
        introVideo.addEventListener('error', iniciarDesvanecimiento);
    } else {
        // Si no hay video, liberar en 1.5s
        setTimeout(iniciarDesvanecimiento, 1500);
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            iniciarDesvanecimiento();
        });
    }

    // Seguridad: si pasan 12s y no se fue, forzar cierre
    setTimeout(() => {
        if (introOverlay && introOverlay.style.display !== 'none') {
            iniciarDesvanecimiento();
        }
    }, 12000);
});
