/* ============================================================
   BABY SHOWER · ÁMBAR
   Cuenta regresiva · revelado al hacer scroll
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     ⚙️  CONFIGURACIÓN — lo único que necesitas editar
     ========================================================== */

  // Fecha y hora del evento: 22 de agosto de 2026, 5:30 PM (hora local)
  var EVENTO = new Date(2026, 7, 22, 17, 30, 0);

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

})();
