/* ==========================================================
   CAZADOR PATAGÓNICO - LÓGICA PRINCIPAL Y GALERÍA / LIGHTBOX
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const introOverlay = document.getElementById("cp-intro-overlay");
    const introVideo = document.getElementById("cp-intro-video");
    const skipBtn = document.getElementById("cp-skip-btn");

    function ocultarIntroInmediato() {
        if (introOverlay) {
            introOverlay.style.transition = "none";
            introOverlay.style.opacity = "0";
            introOverlay.style.visibility = "hidden";
            introOverlay.style.display = "none";
        }
        if (introVideo) {
            introVideo.pause();
        }
    }

    function cerrarIntroConAnimacion() {
        if (introOverlay) {
            introOverlay.style.transition = "opacity 0.4s ease, visibility 0.4s ease";
            introOverlay.style.opacity = "0";
            introOverlay.style.visibility = "hidden";
            
            setTimeout(() => {
                introOverlay.style.display = "none";
            }, 400);
        }

        if (introVideo) {
            introVideo.pause();
        }

        sessionStorage.setItem("cp_intro_visto", "true");
    }

    if (sessionStorage.getItem("cp_intro_visto") === "true") {
        ocultarIntroInmediato();
    } else {
        if (skipBtn) {
            skipBtn.addEventListener("click", function (e) {
                e.preventDefault();
                cerrarIntroConAnimacion();
            });
        }

        if (introVideo) {
            introVideo.addEventListener("ended", cerrarIntroConAnimacion);

            const playPromise = introVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(function (error) {
                    console.log("Autoplay con sonido bloqueado por el navegador:", error);
                });
            }
        }
    }

    window.addEventListener("pageshow", function (event) {
        if (sessionStorage.getItem("cp_intro_visto") === "true" || event.persisted) {
            ocultarIntroInmediato();
        }
    });

    const smoothLinks = document.querySelectorAll('a[href^="#"]');
    smoothLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId && targetId !== "#") {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        });
    });
});

/* ==========================================================
   FUNCIONES DE GALERÍA Y LIGHTBOX (IMAGEN Y VIDEO)
   ========================================================== */

function cambiarImagenPrincipal(idImagenPrincipal, elementoThumb) {
    const mainImg = document.getElementById(idImagenPrincipal);
    if (mainImg && elementoThumb) {
        mainImg.src = elementoThumb.src;
        
        const thumbs = elementoThumb.parentElement.querySelectorAll('.cp-thumb-v');
        thumbs.forEach(t => t.classList.remove('active'));
        
        elementoThumb.classList.add('active');
    }
}

function abrirModalImagen(idImagen) {
    const imgEl = document.getElementById(idImagen);
    const lightboxModal = document.getElementById("cp-lightbox-modal");
    const imgContainer = document.getElementById("cp-lightbox-img-container");
    const lightboxImgEl = document.getElementById("cp-lightbox-img-el");
    const videoContainer = document.getElementById("cp-lightbox-video-container");

    if (imgEl && lightboxModal) {
        lightboxImgEl.src = imgEl.src;
        imgContainer.style.display = "block";
        videoContainer.style.display = "none";
        lightboxModal.classList.add("active");
    }
}

function abrirModalVideo(rutaVideo) {
    const lightboxModal = document.getElementById("cp-lightbox-modal");
    const imgContainer = document.getElementById("cp-lightbox-img-container");
    const videoContainer = document.getElementById("cp-lightbox-video-container");
    const lightboxVideoEl = document.getElementById("cp-lightbox-video-el");

    if (lightboxModal) {
        imgContainer.style.display = "none";
        videoContainer.style.display = "block";
        lightboxVideoEl.src = rutaVideo;
        lightboxModal.classList.add("active");
        lightboxVideoEl.play();
    }
}

function cerrarLightboxes() {
    const lightboxModal = document.getElementById("cp-lightbox-modal");
    const lightboxVideoEl = document.getElementById("cp-lightbox-video-el");

    if (lightboxModal) {
        lightboxModal.classList.remove("active");
        if (lightboxVideoEl) {
            lightboxVideoEl.pause();
            lightboxVideoEl.currentTime = 0;
        }
    }
}