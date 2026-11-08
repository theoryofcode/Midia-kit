/* ==========================================================
   MÍDIA KIT WEB — COMPORTAMENTOS
   Normalmente você NÃO precisa editar este arquivo.
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const topo = document.getElementById("topo");
  const menu = document.getElementById("menu");
  const botaoMenu = document.getElementById("menuBotao");
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Menu do celular ---------- */
  function fecharMenu() {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  }

  botaoMenu.addEventListener("click", () => {
    const abrir = !menu.classList.contains("aberto");
    menu.classList.toggle("aberto", abrir);
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharMenu(); });

  /* ---------- 2. Rolagem suave ao clicar nos links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const alvo = document.querySelector(link.getAttribute("href"));
      if (!alvo) return;
      e.preventDefault();
      const deslocamento = topo.offsetHeight;
      const posicao = alvo.getBoundingClientRect().top + window.scrollY - deslocamento + 1;
      window.scrollTo({ top: posicao, behavior: reduzirMovimento ? "auto" : "smooth" });
      fecharMenu();
    });
  });

  /* ---------- 3. Sombra no menu e link da seção atual ---------- */
  window.addEventListener("scroll", () => topo.classList.toggle("rolou", window.scrollY > 10), { passive: true });

  const linksMenu = document.querySelectorAll(".menu a:not(.menu__cta)");
  const secoes = [...linksMenu].map((l) => document.querySelector(l.getAttribute("href")));
  const observadorSecoes = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      linksMenu.forEach((l) => l.classList.toggle("ativo", l.getAttribute("href") === "#" + entrada.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secoes.forEach((s) => s && observadorSecoes.observe(s));

  /* ---------- 4. Números que "contam" ao aparecer na tela ---------- */
  function animarNumero(el) {
    const valor = parseFloat(el.dataset.valor);
    const sufixo = el.dataset.sufixo || "";
    const decimais = parseInt(el.dataset.decimais || "0", 10);
    const duracao = 1400;
    const inicio = performance.now();

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - progresso, 3);
      el.textContent = (valor * suave).toFixed(decimais) + sufixo;
      if (progresso < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  const numeros = document.querySelectorAll("[data-valor]");
  if (reduzirMovimento || !("IntersectionObserver" in window)) {
    numeros.forEach((n) => { n.textContent = parseFloat(n.dataset.valor).toFixed(parseInt(n.dataset.decimais || "0", 10)) + (n.dataset.sufixo || ""); });
  } else {
    const observadorNumeros = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        animarNumero(entrada.target);
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.6 });
    numeros.forEach((n) => observadorNumeros.observe(n));
  }

  /* ---------- 5. Fotos que ainda não existem ---------- */
  /* Se uma foto não for encontrada, o espaço mostra um fundo colorido em vez de uma imagem quebrada. */
  document.querySelectorAll(".post img").forEach((img) => {
    const marcarSemFoto = () => img.closest(".post").classList.add("sem-foto");
    img.addEventListener("error", marcarSemFoto);
    if (img.complete && img.naturalWidth === 0) marcarSemFoto();
  });
  document.querySelectorAll(".hero__foto img, .sobre__imagem img").forEach((img) => {
    img.addEventListener("error", () => { img.style.visibility = "hidden"; });
  });

  /* ---------- 6. Botão de e-mail: copia o endereço ao clicar com Ctrl/Cmd ---------- */
  const botaoEmail = document.getElementById("botaoEmail");
  if (botaoEmail && navigator.clipboard) {
    botaoEmail.addEventListener("click", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return; // clique normal abre o app de e-mail
      e.preventDefault();
      const textoOriginal = botaoEmail.textContent;
      navigator.clipboard.writeText(textoOriginal).then(() => {
        botaoEmail.textContent = "E-mail copiado!";
        setTimeout(() => { botaoEmail.textContent = textoOriginal; }, 1800);
      });
    });
  }

  /* ---------- 7. Ano automático no rodapé ---------- */
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
});
