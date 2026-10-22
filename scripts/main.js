// Manejo de la Intro de Video para Cazador Patagónico

document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('cp-intro-overlay');
    const introVideo = document.getElementById('cp-intro-video');
    const skipBtn = document.getElementById('cp-skip-btn');

    // Función para cerrar la intro de forma suave con un desvanecimiento (fade out)
    function cerrarIntro() {
        if (introOverlay) {
            introOverlay.classList.add('cp-fade-out');
            setTimeout(() => {
                introOverlay.style.display = 'none';
                document.body.style.overflow = 'auto'; // Habilita el desplazamiento de la página
            }, 800); // Coincide con el tiempo de animación CSS
        }
    }

    // Bloquea el scroll de la página mientras el video se reproduce
    if (introOverlay) {
        document.body.style.overflow = 'hidden';
    }

    // Al finalizar el video automáticamente, se oculta la intro
    if (introVideo) {
        introVideo.addEventListener('ended', cerrarIntro);
        
        // Manejo por si el navegador bloquea la reproducción automática
        introVideo.play().catch(error => {
            console.log("Autoplay bloqueado por el navegador:", error);
        });
    }

    // Al hacer clic en el botón "Ingresar a la Tienda", se cierra la intro inmediatamente
    if (skipBtn) {
        skipBtn.addEventListener('click', cerrarIntro);
    }
});