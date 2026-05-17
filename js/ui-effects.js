"use strict";

(function () {
    const CARD_LABELS = ["Pop", "Fun", "Snack", "Chill"];
    const revealSelectors = [
        ".hero-section",
        ".section-marquee",
        ".game-section",
        ".ad-banner",
        ".game-list-section",
        ".info-section",
        ".page-header",
        ".page-body",
        ".page-section",
        ".contact-card",
        ".sidebar-section",
        ".ad-container",
        ".footer",
        ".game-card"
    ];

    let revealObserver = null;
    let titleObserver = null;
    let ambientParticleSeeded = false;

    function ensureAmbientElements() {
        if (!document.body) {
            return;
        }

        if (!document.getElementById("particles")) {
            const particles = document.createElement("div");
            particles.id = "particles";
            particles.className = "ambient-particles";
            particles.setAttribute("aria-hidden", "true");
            document.body.insertBefore(particles, document.body.firstChild);
        }

        if (!document.getElementById("cursorGlow")) {
            const glow = document.createElement("div");
            glow.id = "cursorGlow";
            glow.className = "cursor-glow";
            glow.setAttribute("aria-hidden", "true");
            document.body.insertBefore(glow, document.body.firstChild);
        }
    }

    function seedAmbientParticles() {
        const container = document.getElementById("particles");

        if (!container || ambientParticleSeeded || container.childElementCount > 0) {
            return;
        }

        ambientParticleSeeded = true;

        for (let i = 0; i < 22; i += 1) {
            const particle = document.createElement("span");
            const size = 4 + Math.random() * 9;
            particle.className = "particle";
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDuration = `${16 + Math.random() * 14}s`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            container.appendChild(particle);
        }
    }

    function initCursorGlow() {
        const glow = document.getElementById("cursorGlow");

        if (!glow || document.body.dataset.cursorGlowBound === "true") {
            return;
        }

        document.body.dataset.cursorGlowBound = "true";

        document.addEventListener("pointermove", (event) => {
            glow.style.left = `${event.clientX}px`;
            glow.style.top = `${event.clientY}px`;
            glow.style.opacity = "0.75";
        });

        document.addEventListener("pointerdown", () => {
            glow.style.transform = "translate(-50%, -50%) scale(0.88)";
        });

        document.addEventListener("pointerup", () => {
            glow.style.transform = "translate(-50%, -50%) scale(1)";
        });

        document.addEventListener("pointerleave", () => {
            glow.style.opacity = "0";
        });

        document.addEventListener("pointerenter", () => {
            glow.style.opacity = "0.75";
        });
    }

    function decorateGameCards(root) {
        const cards = root.querySelectorAll(".game-card");
        cards.forEach((card, index) => {
            if (card.dataset.enhanced === "true") {
                return;
            }

            const media = card.querySelector(".game-card-img");
            if (!media) {
                return;
            }

            card.dataset.enhanced = "true";
            media.setAttribute("data-chip", CARD_LABELS[index % CARD_LABELS.length]);
            card.style.setProperty("--card-tilt", `${((index % 5) - 2) * 0.85}deg`);

            if (!media.querySelector(".game-card-cta")) {
                const action = document.createElement("span");
                action.className = "game-card-cta";
                action.innerHTML = '<i class="fas fa-play"></i> Play Now';
                media.appendChild(action);
            }

            if (!media.querySelector(".game-card-sparkles")) {
                const sparkles = document.createElement("div");
                sparkles.className = "game-card-sparkles";

                for (let i = 0; i < 3; i += 1) {
                    const sparkle = document.createElement("span");
                    sparkle.style.setProperty("--sparkle-delay", `${i * 0.35}s`);
                    sparkles.appendChild(sparkle);
                }

                media.appendChild(sparkles);
            }
        });
    }

    function showImmediately(element) {
        element.classList.add("reveal-target", "is-visible");
    }

    function registerRevealTargets(root) {
        const targets = root.querySelectorAll(revealSelectors.join(","));

        targets.forEach((element, index) => {
            if (element.dataset.revealBound === "true") {
                return;
            }

            element.dataset.revealBound = "true";
            element.classList.add("reveal-target");
            element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 90}ms`);

            if (revealObserver) {
                revealObserver.observe(element);
            } else {
                showImmediately(element);
            }
        });
    }

    function initRevealObserver() {
        if (!("IntersectionObserver" in window)) {
            registerRevealTargets(document);
            return;
        }

        document.body.classList.add("reveal-ready");

        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.16,
            rootMargin: "0px 0px -12% 0px"
        });

        registerRevealTargets(document);
    }

    function buildHeroParticles() {
        const container = document.getElementById("hero-particles");
        if (!container || container.childElementCount > 0) {
            return;
        }

        for (let i = 0; i < 16; i += 1) {
            const particle = document.createElement("span");
            const size = 8 + Math.random() * 16;
            particle.className = "hero-particle";
            particle.style.left = `${8 + Math.random() * 84}%`;
            particle.style.top = `${10 + Math.random() * 70}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.setProperty("--particle-delay", `${Math.random() * 4}s`);
            particle.style.setProperty("--particle-duration", `${5 + Math.random() * 4}s`);
            container.appendChild(particle);
        }
    }

    function syncFeaturedTitle() {
        const source = document.getElementById("current-game-title");
        const target = document.getElementById("hero-featured-title");

        if (!source || !target) {
            return;
        }

        target.textContent = source.textContent.trim() || "Popcorn Game";

        if (titleObserver) {
            titleObserver.disconnect();
        }

        titleObserver = new MutationObserver(() => {
            target.textContent = source.textContent.trim() || "Popcorn Game";
        });

        titleObserver.observe(source, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }

    function observeDynamicContent() {
        const mutationObserver = new MutationObserver((mutations) => {
            let hasNewNodes = false;

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        hasNewNodes = true;
                    }
                });
            });

            if (!hasNewNodes) {
                return;
            }

            decorateGameCards(document);
            registerRevealTargets(document);
            syncFeaturedTitle();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        ensureAmbientElements();
        seedAmbientParticles();
        initCursorGlow();
        decorateGameCards(document);
        buildHeroParticles();
        initRevealObserver();
        syncFeaturedTitle();
        observeDynamicContent();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
