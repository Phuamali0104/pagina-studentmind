/* =========================================================
   Asistente StudentMind - Chat interactivo compartido
   - Si existe un elemento #smc-inline, el chat se muestra dentro de él.
   - Si no, aparece como burbuja flotante en la esquina inferior derecha.
   - El historial se conserva mientras navegas entre páginas (sessionStorage).
   ========================================================= */
(function () {
    'use strict';

    var STORAGE_KEY = 'smc-chat-history';
    var OPEN_KEY = 'smc-chat-open';
    var LAUNCHER_ICON = '<img src="LOGO%20TECHNICAL.jpg" alt="Asistente StudentMind">';

    /* ---------- Estilos ---------- */
    var css = `
    .smc-chat, .smc-chat * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .smc-chat { width: 340px; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; }
    .smc-floating { position: fixed; right: 24px; bottom: 96px; z-index: 9999; max-height: calc(100vh - 120px); display: none; }
    .smc-floating.smc-open { display: flex; animation: smcPop .18s ease-out; }
    .smc-inline-mode { width: 100%; height: 100%; box-shadow: none; border: none; border-radius: 0; }
    @keyframes smcPop { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
    .smc-header { background: linear-gradient(135deg, #0b1120, #1e1b4b 55%, #3b1d4a); border-bottom: 2px solid #6366f1; color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; }
    .smc-header-title { display: flex; align-items: center; gap: 8px; }
    .smc-header-title img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; padding: 2px; background: linear-gradient(135deg,#38bdf8,#6366f1,#f43f5e); box-shadow: 0 0 12px rgba(56,189,248,.6); }
    .smc-status { display: block; font-size: 11px; font-weight: 500; color: #4ade80; }
    .smc-header-btns button { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1; opacity: .9; }
    .smc-header-btns button:hover { opacity: 1; }
    .smc-body { padding: 15px; background: #f8fafc; display: flex; flex-direction: column; gap: 10px; height: 340px; overflow-y: auto; scroll-behavior: smooth; }
    .smc-collapsed .smc-body, .smc-collapsed .smc-footer { display: none; }
    .smc-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.45; color: #1e293b; word-wrap: break-word; }
    .smc-msg a { color: #2563eb; font-weight: 600; }
    .smc-bot { background: #eff6ff; border: 1px solid #dbeafe; align-self: flex-start; border-bottom-left-radius: 4px; }
    .smc-user { background: linear-gradient(135deg, #2563eb, #6366f1); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .smc-options { display: flex; flex-direction: column; gap: 6px; align-self: stretch; }
    .smc-option { background: #fff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #334155; text-align: left; cursor: pointer; transition: all .15s; }
    .smc-option:hover { border-color: #6366f1; color: #4f46e5; background: #eef2ff; transform: translateX(3px); }
    .smc-typing { display: inline-flex; gap: 4px; padding: 12px 14px; }
    .smc-typing span { width: 6px; height: 6px; border-radius: 50%; background: #93c5fd; animation: smcDot 1s infinite; }
    .smc-typing span:nth-child(2) { animation-delay: .15s; }
    .smc-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes smcDot { 0%, 80%, 100% { opacity: .3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
    .smc-footer { padding: 10px 12px; background: #fff; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; align-items: center; }
    .smc-footer input { flex: 1; border: 1px solid #e2e8f0; border-radius: 20px; padding: 8px 14px; font-size: 13px; outline: none; }
    .smc-footer input:focus { border-color: #2563eb; }
    .smc-send { background: linear-gradient(135deg, #38bdf8, #6366f1, #f43f5e); color: #fff; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 14px; flex-shrink: 0; }
    .smc-send:hover { filter: brightness(1.1); }
    .smc-launcher { position: fixed; right: 24px; bottom: 24px; z-index: 9999; width: 68px; height: 68px; border-radius: 50%; padding: 3px; background: linear-gradient(135deg,#38bdf8,#6366f1,#f43f5e); color: #fff; border: none; cursor: pointer; font-size: 26px; display: flex; align-items: center; justify-content: center; transition: transform .2s; animation: smcLaunch 3s ease-in-out infinite; }
    .smc-launcher img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
    .smc-launcher .smc-x { width: 100%; height: 100%; border-radius: 50%; background: #0b1120; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    @keyframes smcLaunch { 0%,100% { box-shadow: 0 0 0 0 rgba(56,189,248,.5), 0 8px 24px rgba(99,102,241,.45); } 50% { box-shadow: 0 0 0 10px rgba(56,189,248,0), 0 8px 24px rgba(244,63,94,.45); } }
    .smc-launcher:hover { transform: scale(1.07); }
    .smc-badge { position: absolute; top: 2px; right: 2px; width: 14px; height: 14px; background: #ef4444; border: 2px solid #fff; border-radius: 50%; }
    @media (max-width: 480px) { .smc-floating { right: 10px; left: 10px; width: auto; bottom: 90px; } }
    `;
    var styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    /* ---------- Base de conocimiento ---------- */
    var MAIN_OPTIONS = [
        { label: '📋 Comenzar el test diagnóstico', intent: 'test' },
        { label: '📦 Conocer los planes', intent: 'planes' },
        { label: '📖 Resolver dudas de estudio', intent: 'estudio' },
        { label: '🎥 Información del webinar', intent: 'webinar' },
        { label: '🎧 Hablar con soporte', intent: 'soporte' }
    ];

    var INTENTS = {
        saludo: {
            keys: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal'],
            reply: '¡Hola! 👋 Qué gusto saludarte. ¿En qué te puedo ayudar hoy?',
            options: MAIN_OPTIONS
        },
        test: {
            keys: ['test', 'diagnostico', 'evaluacion', 'evaluar', 'nivel', 'vacios'],
            reply: 'El <b>test diagnóstico</b> identifica tus vacíos académicos y te genera una ruta de estudio personalizada. Toma unos 10 minutos y es gratuito. 👉 <a href="encuesta.html">Ir al test</a>',
            options: [
                { label: '🤔 ¿Qué evalúa el test?', intent: 'test_detalle' },
                { label: '📦 Ver planes', intent: 'planes' }
            ]
        },
        test_detalle: {
            keys: ['que evalua', 'como funciona el test'],
            reply: 'El test evalúa tu dominio por tema de tus materias actuales y previas, tu disponibilidad horaria y tus hábitos de estudio. Con eso te mostramos un <b>semáforo de dominio</b> 🟢🟡🔴 y priorizamos lo que más necesitas repasar.'
        },
        planes: {
            keys: ['plan', 'planes', 'precio', 'costo', 'cuanto cuesta', 'suscripcion', 'pagar', 'free', 'gratis', 'smart', 'pro', 'elite', 'premium'],
            reply: 'Tenemos 4 planes:<br>🟢 <b>Free</b> – Gratis: diagnóstico, planificador básico y tutor IA.<br>🔵 <b>Smart</b> – $3.49/mes: copiloto IA y planificador adaptativo.<br>🟣 <b>Pro</b> – $8.49/mes: ruta personalizada, gamificación y comunidad P2P.<br>🔴 <b>Elite</b> – $15.49/mes: ecosistema integral, predicción de fatiga y analítica.<br>👉 <a href="planes.html">Ver detalle de planes</a>',
            options: [
                { label: '🤷 ¿Cuál me recomiendas?', intent: 'recomendar' }
            ]
        },
        recomendar: {
            keys: ['recomiendas', 'recomienda', 'cual elijo', 'cual me conviene', 'mejor plan'],
            reply: 'Si recién empiezas, te recomiendo <b>Free</b> para conocer tu diagnóstico. Si quieres constancia y un copiloto IA, <b>Smart</b> es ideal. Si te gusta estudiar en comunidad y con retos, elige <b>Pro</b>. 😉'
        },
        estudio: {
            keys: ['estudio', 'estudiar', 'duda', 'tecnica', 'metodo', 'aprender', 'memorizar', 'concentr'],
            reply: '¡Claro! ¿Sobre qué tema necesitas ayuda?',
            options: [
                { label: '⏱️ Organizar mi tiempo', intent: 'tiempo' },
                { label: '📝 Preparar exámenes', intent: 'examenes' },
                { label: '😵 Estrés y bienestar', intent: 'estres' },
                { label: '🎯 Concentrarme mejor', intent: 'concentracion' }
            ]
        },
        tiempo: {
            keys: ['tiempo', 'organizar', 'organizo', 'horario', 'planificar', 'agenda', 'procrastin'],
            reply: 'Prueba la técnica <b>Pomodoro</b>: 25 min de estudio + 5 min de descanso. Planifica tu semana el domingo, bloquea horarios fijos para cada curso y prioriza lo urgente e importante (matriz de Eisenhower). 📅 Más tips en el <a href="blog.html">Blog</a>.'
        },
        examenes: {
            keys: ['examen', 'examenes', 'parcial', 'final', 'prueba', 'repaso'],
            reply: 'Para exámenes: usa <b>repaso espaciado</b> (revisa a 1, 3 y 7 días), practica con <b>recuerdo activo</b> (ponte a prueba sin mirar apuntes) y resuelve ejercicios de exámenes pasados. Duerme bien la noche anterior. 💪'
        },
        estres: {
            keys: ['estres', 'ansiedad', 'cansado', 'agotado', 'burnout', 'bienestar', 'triste', 'abrumado'],
            reply: 'Es normal sentirse así a veces 💙. Toma pausas activas, duerme 7–8 horas, divide tareas grandes en pasos pequeños y no dudes en hablar con alguien de confianza. Si el malestar persiste, busca apoyo en el servicio psicológico de tu universidad.'
        },
        concentracion: {
            keys: ['distraigo', 'distraccion', 'celular', 'enfocar', 'foco'],
            reply: 'Deja el celular en otra habitación o en modo concentración, estudia en un lugar fijo y ordenado, y define un objetivo concreto por sesión (ej. "resolver 5 ejercicios"). 🎯'
        },
        webinar: {
            keys: ['webinar', 'evento', 'charla', 'sesion en vivo', 'en vivo', 'registro', 'inscrib'],
            reply: '🎥 Webinar <b>"Potencia tu rendimiento universitario con IA"</b><br>📅 Jueves 20 de noviembre de 2026<br>⏰ 7:00 p.m. (GMT-5) · Online en vivo<br>¡Es gratis y con bonus! 👉 <a href="webinar.html">Reservar mi lugar</a>'
        },
        blog: {
            keys: ['blog', 'articulo', 'leer', 'consejos'],
            reply: 'En nuestro <a href="blog.html">Blog</a> encontrarás artículos sobre gestión del tiempo, comunidades P2P, IA aplicada al estudio, preparación de exámenes y bienestar mental. 📚'
        },
        nosotros: {
            keys: ['quienes son', 'equipo', 'nosotros', 'studentmind', 'mision', 'vision', 'proyecto', 'que es'],
            reply: '<b>StudentMind Connect</b> es una plataforma que combina IA, diagnóstico académico y comunidad entre pares para que los universitarios estudien con claridad y bienestar. 👉 <a href="presentacion.html">Conoce el proyecto</a>'
        },
        soporte: {
            keys: ['soporte', 'ayuda', 'contacto', 'problema', 'error', 'humano', 'asesor', 'correo'],
            reply: 'Puedes escribirnos a <b>soporte@studentmind.com</b> o dejarnos tu consulta aquí y un asesor te responderá en menos de 24 horas. 🎧 ¿Quieres dejar tu correo para contactarte?',
            options: [
                { label: '✉️ Sí, dejar mi correo', intent: 'pedir_correo' },
                { label: '🏠 Volver al menú', intent: 'menu' }
            ]
        },
        pedir_correo: {
            keys: [],
            reply: 'Perfecto, escribe tu correo electrónico en el cuadro de abajo 👇',
            expectEmail: true
        },
        gracias: {
            keys: ['gracias', 'genial', 'perfecto', 'excelente', 'ok', 'vale', 'listo'],
            reply: '¡Con gusto! 😊 Si necesitas algo más, aquí estaré.',
            options: [{ label: '🏠 Volver al menú', intent: 'menu' }]
        },
        despedida: {
            keys: ['adios', 'chau', 'chao', 'hasta luego', 'nos vemos'],
            reply: '¡Hasta pronto! 🦉 Mucho éxito en tus estudios.'
        },
        menu: {
            keys: ['menu', 'opciones', 'inicio', 'empezar'],
            reply: '¿En qué más te puedo ayudar?',
            options: MAIN_OPTIONS
        }
    };

    var WELCOME = {
        reply: '🦉 ¡Hola! Soy tu asistente virtual de StudentMind Connect. ¿En qué puedo ayudarte hoy?',
        options: MAIN_OPTIONS
    };

    var FALLBACK = {
        reply: 'Mmm, no estoy seguro de haber entendido 🤔. Puedes preguntarme sobre el test, los planes, técnicas de estudio, el webinar o soporte.',
        options: MAIN_OPTIONS
    };

    /* ---------- Utilidades ---------- */
    function normalize(text) {
        return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:]/g, ' ').trim();
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function detectIntent(text) {
        var t = ' ' + normalize(text) + ' ';
        var best = null, bestScore = 0;
        Object.keys(INTENTS).forEach(function (name) {
            INTENTS[name].keys.forEach(function (k) {
                // Palabras cortas (ej. "pro", "ok") deben coincidir como palabra completa
                var needle = k.length <= 4 ? ' ' + k + ' ' : k;
                if (t.indexOf(needle) !== -1 && k.length > bestScore) {
                    best = name;
                    bestScore = k.length;
                }
            });
        });
        return best;
    }

    function loadHistory() {
        try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
    }
    function saveHistory(h) {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-60))); } catch (e) { /* sin almacenamiento */ }
    }

    /* ---------- Construcción del widget ---------- */
    function build() {
        var inlineHost = document.getElementById('smc-inline');
        var isInline = !!inlineHost;

        var chat = document.createElement('div');
        chat.className = 'smc-chat ' + (isInline ? 'smc-inline-mode' : 'smc-floating');
        chat.innerHTML =
            '<div class="smc-header">' +
                '<div class="smc-header-title"><img src="LOGO%20TECHNICAL.jpg" alt="Logo">' +
                    '<div>Asistente StudentMind<span class="smc-status">● En línea</span></div></div>' +
                '<div class="smc-header-btns">' +
                    '<button type="button" class="smc-min" title="Minimizar">&minus;</button>' +
                    (isInline ? '' : '<button type="button" class="smc-close" title="Cerrar">&times;</button>') +
                '</div>' +
            '</div>' +
            '<div class="smc-body"></div>' +
            '<form class="smc-footer">' +
                '<input type="text" placeholder="Escribe tu consulta aquí..." autocomplete="off">' +
                '<button type="submit" class="smc-send" title="Enviar">&#10148;</button>' +
            '</form>';

        var body = chat.querySelector('.smc-body');
        var form = chat.querySelector('.smc-footer');
        var input = form.querySelector('input');
        var history = loadHistory();
        var waitingEmail = false;
        var launcher = null;

        if (isInline) {
            inlineHost.appendChild(chat);
        } else {
            document.body.appendChild(chat);
            launcher = document.createElement('button');
            launcher.type = 'button';
            launcher.className = 'smc-launcher';
            launcher.title = 'Abrir asistente';
            launcher.innerHTML = LAUNCHER_ICON + (history.length ? '' : '<span class="smc-badge"></span>');
            document.body.appendChild(launcher);

            launcher.addEventListener('click', function () { toggleOpen(!chat.classList.contains('smc-open')); });
            chat.querySelector('.smc-close').addEventListener('click', function () { toggleOpen(false); });
            if (sessionStorage.getItem(OPEN_KEY) === '1') toggleOpen(true);
        }

        chat.querySelector('.smc-min').addEventListener('click', function () {
            if (isInline) chat.classList.toggle('smc-collapsed');
            else toggleOpen(false);
        });

        function toggleOpen(open) {
            chat.classList.toggle('smc-open', open);
            launcher.innerHTML = open ? '<span class="smc-x">&times;</span>' : LAUNCHER_ICON;
            try { sessionStorage.setItem(OPEN_KEY, open ? '1' : '0'); } catch (e) {}
            if (open) { scrollDown(); input.focus(); }
        }

        function scrollDown() { body.scrollTop = body.scrollHeight; }

        function renderMessage(from, html) {
            var div = document.createElement('div');
            div.className = 'smc-msg ' + (from === 'user' ? 'smc-user' : 'smc-bot');
            div.innerHTML = html;
            body.appendChild(div);
            scrollDown();
        }

        function renderOptions(options) {
            if (!options || !options.length) return;
            var wrap = document.createElement('div');
            wrap.className = 'smc-options';
            options.forEach(function (opt) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'smc-option';
                b.textContent = opt.label;
                b.addEventListener('click', function () {
                    wrap.remove();
                    userSays(opt.label, opt.intent);
                });
                wrap.appendChild(b);
            });
            body.appendChild(wrap);
            scrollDown();
        }

        function clearOptions() {
            body.querySelectorAll('.smc-options').forEach(function (o) { o.remove(); });
        }

        function botSays(response) {
            var typing = document.createElement('div');
            typing.className = 'smc-msg smc-bot smc-typing';
            typing.innerHTML = '<span></span><span></span><span></span>';
            body.appendChild(typing);
            scrollDown();
            var delay = Math.min(1200, 400 + response.reply.length * 4);
            setTimeout(function () {
                typing.remove();
                renderMessage('bot', response.reply);
                renderOptions(response.options);
                history.push({ from: 'bot', html: response.reply, options: response.options || null });
                saveHistory(history);
                if (response.expectEmail) {
                    waitingEmail = true;
                    input.placeholder = 'tucorreo@ejemplo.com';
                    input.focus();
                }
            }, delay);
        }

        function userSays(text, forcedIntent) {
            clearOptions();
            var safe = escapeHtml(text);
            renderMessage('user', safe);
            history.push({ from: 'user', html: safe });
            saveHistory(history);

            if (waitingEmail && !forcedIntent) {
                waitingEmail = false;
                input.placeholder = 'Escribe tu consulta aquí...';
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) {
                    botSays({
                        reply: '¡Listo! ✅ Registramos <b>' + safe + '</b>. Un asesor te escribirá pronto.',
                        options: [{ label: '🏠 Volver al menú', intent: 'menu' }]
                    });
                } else {
                    botSays({
                        reply: 'Ese correo no parece válido 😅. Inténtalo de nuevo:',
                        expectEmail: true
                    });
                }
                return;
            }

            var intent = forcedIntent || detectIntent(text);
            botSays(intent ? INTENTS[intent] : FALLBACK);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var text = input.value.trim();
            if (!text) return;
            input.value = '';
            userSays(text);
        });

        /* Restaurar historial o mostrar bienvenida */
        if (history.length) {
            history.forEach(function (m) { renderMessage(m.from, m.html); });
            var last = history[history.length - 1];
            if (last.from === 'bot' && last.options) renderOptions(last.options);
        } else {
            renderMessage('bot', WELCOME.reply);
            renderOptions(WELCOME.options);
            history.push({ from: 'bot', html: WELCOME.reply, options: WELCOME.options });
            saveHistory(history);
        }
    }

    /* ---------- Animación de aparición al hacer scroll (tema del sitio) ---------- */
    function reveal() {
        var targets = document.querySelectorAll('.section-box, .blog-card, .plan-column, .quick-item, .smc-reveal');
        if (!('IntersectionObserver' in window)) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    var el = e.target;
                    el.classList.add('smc-visible');
                    io.unobserve(el);
                    // Al terminar, se limpian las clases para que los efectos hover respondan sin retraso
                    setTimeout(function () { el.classList.remove('smc-reveal', 'smc-visible'); el.style.transitionDelay = ''; }, 1100);
                }
            });
        }, { threshold: 0.12 });
        targets.forEach(function (el, i) {
            el.classList.add('smc-reveal');
            el.style.transitionDelay = (i % 4) * 80 + 'ms';
            io.observe(el);
        });
    }

    function init() { build(); reveal(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
