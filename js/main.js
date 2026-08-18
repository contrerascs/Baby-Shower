/* ============================================================
   BABY SHOWER · ÁMBAR
   Cuenta regresiva · revelado al hacer scroll · música
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     ⚙️  CONFIGURACIÓN — lo único que necesitas editar
     ========================================================== */

  // Fecha y hora del evento: 22 de agosto de 2026, 5:30 PM (hora local)
  var EVENTO = new Date(2026, 7, 22, 17, 30, 0);

  // Volumen de la canción (0 a 1). 0.5 queda de fondo sin tapar nada.
  var VOLUMEN = 0.5;

  /* ========================================================== */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Cuenta regresiva ---------- */
  (function cuentaRegresiva() {
    var campos = {
      dias:  document.getElementById('cd-dias'),
      horas: document.getElementById('cd-horas'),
      min:   document.getElementById('cd-min'),
      seg:   document.getElementById('cd-seg')
    };
    var caja  = document.getElementById('cuenta');
    var final = document.getElementById('cuenta-final');

    if (!caja || !campos.dias) return;

    function dosDigitos(n) {
      return n < 10 ? '0' + n : String(n);
    }

    function actualizar() {
      var restante = EVENTO.getTime() - Date.now();

      if (restante <= 0) {
        caja.hidden = true;
        if (final) final.hidden = false;
        clearInterval(temporizador);
        return;
      }

      var segundos = Math.floor(restante / 1000);
      var dias  = Math.floor(segundos / 86400);
      var horas = Math.floor((segundos % 86400) / 3600);
      var mins  = Math.floor((segundos % 3600) / 60);
      var segs  = segundos % 60;

      campos.dias.textContent  = String(dias);
      campos.horas.textContent = dosDigitos(horas);
      campos.min.textContent   = dosDigitos(mins);
      campos.seg.textContent   = dosDigitos(segs);
    }

    actualizar();
    var temporizador = setInterval(actualizar, 1000);

    // Pausa el intervalo cuando la pestaña no está visible
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) actualizar();
    });
  })();

  /* ---------- 2. Revelado progresivo al hacer scroll ---------- */
  (function revelado() {
    var elementos = document.querySelectorAll('.reveal');
    if (!elementos.length) return;

    // Sin IntersectionObserver o con movimiento reducido: se muestra todo
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(elementos, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(elementos, function (el) {
      observador.observe(el);
    });
  })();

  /* ---------- 3. Música ----------
     "Milagro de Amor" — Proyectos Románticos.
     El archivo va en assets/audio/milagro-de-amor.mp3

     Intenta sonar en cuanto carga la página. Casi todos los navegadores
     bloquean el audio automático, así que si lo rechazan queda armada y
     arranca con el primer gesto del visitante (un toque, una tecla o el
     scroll). Así suena sin que nadie tenga que buscar el botón.

     Si el archivo no está, el botón no aparece y no se intenta nada.
  ------------------------------------------------------------------- */
  (function musica() {
    var audio = document.getElementById('cancion');
    var boton = document.getElementById('btn-musica');
    var etiqueta = document.getElementById('musica-texto');
    if (!audio || !boton) return;

    var fuente = audio.querySelector('source');
    var ruta = fuente ? fuente.getAttribute('src') : '';
    var fundido = null;

    // El botón sólo aparece si la canción existe de verdad
    function mostrar() {
      boton.hidden = false;
      // Forzar el cálculo de estilos antes de añadir la clase hace que la
      // transición se vea. No usamos requestAnimationFrame porque no se
      // ejecuta si la página está en una pestaña en segundo plano.
      void boton.offsetWidth;
      boton.classList.add('visible');
    }

    if (window.fetch && location.protocol.indexOf('http') === 0) {
      fetch(ruta, { method: 'HEAD' })
        .then(function (r) { if (r.ok) { mostrar(); arrancarSola(); } })
        .catch(function () { /* sin canción: el botón se queda oculto */ });
    } else {
      // Abierto como archivo local: no se puede comprobar, se muestra igual
      mostrar();
      arrancarSola();
    }

    // Sube o baja el volumen poco a poco, para que no entre de golpe
    function fundir(destino, alTerminar) {
      clearInterval(fundido);
      var paso = (destino - audio.volume) / 24;
      fundido = setInterval(function () {
        var v = audio.volume + paso;
        if ((paso > 0 && v >= destino) || (paso < 0 && v <= destino)) {
          audio.volume = destino;
          clearInterval(fundido);
          if (alTerminar) alTerminar();
          return;
        }
        audio.volume = Math.min(1, Math.max(0, v));
      }, 40);
    }

    function pintar(sonando) {
      boton.classList.toggle('suena', sonando);
      boton.setAttribute('aria-pressed', sonando ? 'true' : 'false');
      boton.setAttribute('aria-label', sonando
        ? 'Pausar la música de la invitación'
        : 'Escuchar la música de la invitación');
      if (etiqueta) etiqueta.textContent = sonando ? 'Pausar' : 'Escuchar';
    }

    // Pone la canción en marcha con el volumen subiendo poco a poco.
    // Devuelve la promesa de play() para saber si el navegador la aceptó.
    function reproducir() {
      audio.volume = 0;
      var intento = audio.play();
      if (intento && intento.then) {
        return intento.then(function () { fundir(VOLUMEN); });
      }
      fundir(VOLUMEN);
      return null;
    }

    /* Arranque automático.
       1) Se intenta directamente: funciona si el visitante ya había
          interactuado antes con el sitio.
       2) Si el navegador lo bloquea, se queda a la espera y arranca con el
          primer gesto. Los eventos elegidos son los que cuentan como
          "activación del usuario"; el scroll se añade porque en la práctica
          es lo primero que hace casi todo el mundo al abrir la invitación. */
    function arrancarSola() {
      var gestos = ['pointerdown', 'touchend', 'keydown', 'scroll'];

      function conGesto() {
        quitarEscuchas();
        reproducir();
      }

      function quitarEscuchas() {
        gestos.forEach(function (ev) {
          document.removeEventListener(ev, conGesto, true);
        });
      }

      function armarEspera() {
        gestos.forEach(function (ev) {
          document.addEventListener(ev, conGesto, true);
        });
      }

      var intento = reproducir();
      if (intento && intento.catch) {
        intento.catch(armarEspera);   // bloqueada: esperamos el primer gesto
      }

      // Si el visitante la pausa a propósito, no volvemos a insistir
      audio.addEventListener('pause', quitarEscuchas);
    }

    boton.addEventListener('click', function () {
      if (audio.paused) {
        var intento = reproducir();
        if (intento && intento.catch) {
          intento.catch(function () { pintar(false); });
        }
      } else {
        fundir(0, function () { audio.pause(); });
      }
    });

    audio.addEventListener('play', function () { pintar(true); });
    audio.addEventListener('pause', function () { pintar(false); });
    audio.addEventListener('error', function () { boton.hidden = true; });
  })();

})();
