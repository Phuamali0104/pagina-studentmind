/* =========================================================
   StudentMind Connect - Motor del Test Diagnóstico
   Cada página define window.ENCUESTA antes de cargar este archivo:
   { etapa: 1..5 | 'resultados', vistas: [html, ...], botonInicio, botonFinal }
   El flujo es: encuesta.html (1) → encuesta2 (2) → encuesta3 (3)
                → encuesta4 (4) → encuesta5 (5) → encuesta6 (resultados) → planes.html
   ========================================================= */
(function () {
    'use strict';

    var ETAPAS = [
        { num: 1, nombre: 'Perfil',       archivo: 'encuesta.html'  },
        { num: 2, nombre: 'Hábitos',      archivo: 'encuesta2.html' },
        { num: 3, nombre: 'Conocimiento', archivo: 'encuesta3.html' },
        { num: 4, nombre: 'Bienestar',    archivo: 'encuesta4.html' },
        { num: 5, nombre: 'Comunidad',    archivo: 'encuesta5.html' }
    ];
    var RESULTADOS = 'encuesta6.html';
    var DESTINO_FINAL = 'planes.html';

    var cfg = window.ENCUESTA;
    var esResultados = cfg.etapa === 'resultados';
    var idx = esResultados ? ETAPAS.length : cfg.etapa - 1; // posición en el flujo
    var anterior = idx === 0 ? 'presentacion.html' : (esResultados ? ETAPAS[4].archivo : ETAPAS[idx - 1].archivo);
    var siguiente = esResultados ? DESTINO_FINAL : (idx === ETAPAS.length - 1 ? RESULTADOS : ETAPAS[idx + 1].archivo);
    var paso = 0;
    var total = cfg.vistas.length;

    /* ---------- Stepper de etapas ---------- */
    function stepper() {
        var html = '';
        ETAPAS.forEach(function (e, i) {
            var estado = i < idx ? 'done' : (i === idx ? 'current' : '');
            var tag = i < idx ? 'a href="' + e.archivo + '"' : 'div';
            var cierre = i < idx ? 'a' : 'div';
            html += '<' + tag + ' class="sv-step ' + estado + '" title="Etapa ' + e.num + ': ' + e.nombre + '">' +
                    '<span class="sv-step-dot">' + (i < idx ? '✓' : e.num) + '</span>' +
                    '<span class="sv-step-label">' + e.nombre + '</span></' + cierre + '>';
            html += '<span class="sv-step-line ' + (i < idx ? 'done' : '') + '"></span>';
        });
        var r = esResultados ? 'current' : '';
        html += '<div class="sv-step ' + r + '" title="Resultados"><span class="sv-step-dot">★</span><span class="sv-step-label">Resultados</span></div>';
        return html;
    }

    /* ---------- Estructura de la página ---------- */
    var titulo = esResultados ? 'Tus resultados' : 'Etapa ' + cfg.etapa + ': ' + ETAPAS[idx].nombre;
    var app = document.getElementById('sv-app');
    app.innerHTML =
        '<div class="sv-head">' +
            '<span class="smc-chip">Test de Diagnóstico Académico</span>' +
            '<h1>' + (esResultados ? '¡Tu diagnóstico <span class="smc-grad-text">está listo</span>!' : 'Etapa ' + cfg.etapa + ' de 5 · <span class="smc-grad-text">' + ETAPAS[idx].nombre + '</span>') + '</h1>' +
            '<p>' + (esResultados ? 'Completaste las 5 etapas. Aquí tienes tu resumen personalizado.' : 'Responde con sinceridad, no hay respuestas correctas ni incorrectas.') + '</p>' +
            '<div class="sv-stepper">' + stepper() + '</div>' +
        '</div>' +
        '<div class="sv-card">' +
            '<div class="sv-logo"><div class="sv-logo-ring"></div><img src="LOGO%20TECHNICAL.jpg" alt="Logo StudentMind Connect"></div>' +
            '<div class="sv-meta"><span class="sv-meta-stage">' + titulo + '</span><span class="sv-meta-count" id="sv-count"></span></div>' +
            '<div class="sv-progress"><div class="sv-progress-bar" id="sv-bar"></div></div>' +
            '<div class="sv-content" id="sv-content"></div>' +
            '<div class="sv-nav">' +
                '<button class="sv-btn-prev" id="sv-prev">← Anterior</button>' +
                '<button class="sv-btn-next" id="sv-next"></button>' +
            '</div>' +
        '</div>';

    var content = document.getElementById('sv-content');
    var prev = document.getElementById('sv-prev');
    var next = document.getElementById('sv-next');

    function render() {
        content.innerHTML = cfg.vistas[paso];
        // reinicia la animación de entrada
        content.style.animation = 'none'; void content.offsetWidth; content.style.animation = '';
        document.getElementById('sv-count').textContent = 'Paso ' + (paso + 1) + ' de ' + total;
        document.getElementById('sv-bar').style.width = ((paso + 1) / total * 100) + '%';

        prev.textContent = paso === 0 ? (idx === 0 ? '← Volver' : '← Etapa anterior') : '← Anterior';
        if (paso === total - 1) {
            next.textContent = cfg.botonFinal || (esResultados ? 'Finalizar →' :
                (idx === ETAPAS.length - 1 ? 'Ver mis resultados →' : 'Continuar a la Etapa ' + (cfg.etapa + 1) + ' →'));
        } else {
            next.textContent = paso === 0 ? (cfg.botonInicio || 'Comenzar →') : 'Siguiente →';
        }
    }

    prev.addEventListener('click', function () {
        if (paso === 0) { window.location.href = anterior; return; }
        paso--; render();
    });
    next.addEventListener('click', function () {
        if (paso === total - 1) { window.location.href = siguiente; return; }
        paso++; render();
        window.scrollTo({ top: app.offsetTop - 80, behavior: 'smooth' });
    });

    render();
})();
