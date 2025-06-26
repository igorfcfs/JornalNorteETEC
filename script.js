document.addEventListener("DOMContentLoaded", () => {
  const btnConverter = document.getElementById("converter");
  const btnTrocar = document.getElementById("trocar");

  const inputData = document.getElementById("dataCotacao");

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0"); // Mês começa em 0
  const dia = String(hoje.getDate()).padStart(2, "0");

  const dataMax = `${ano}-${mes}-${dia}`;
  inputData.max = dataMax;
  inputData.value = dataMax; // Opcional: já preenche com a data de hoje

  btnTrocar.addEventListener("click", () => {
    const de = document.getElementById("de");
    const para = document.getElementById("para");
    const temp = de.value;
    de.value = para.value;
    para.value = temp;
  });

  btnConverter.addEventListener("click", async () => {
    const valor = parseFloat(
      document.getElementById("valor").value.replace(",", "."),
    );
    const deMoeda = document.getElementById("de").value;
    const paraMoeda = document.getElementById("para").value;
    const data = document.getElementById("dataCotacao").value;

    console.log(valor, deMoeda, paraMoeda, data);

    if (isNaN(valor) || valor <= 0) {
      alert("Informe um valor válido para conversão.");
      return;
    }

    // Sua API key da Fixer.io aqui:
    const accessKey = "45569e6cf9cebb8f4fe1d96b10cdb7ac";

    // Montar URL para pegar taxas atuais ou históricas (se data informada)
    // exchangerate.host usa endpoint /latest para última cotação ou /YYYY-MM-DD para data específica
    // Link API: https://exchangerate.host/
    let url;
    if (data) {
      // Desnecessario porque o codigo ja preenche automaticamente com a data de hoje
      url = `https://api.exchangerate.host/convert?from=${deMoeda}&to=${paraMoeda}&amount=${valor}&access_key=${accessKey}&date=${data}`;
    } else {
      url = `https://api.exchangerate.host/convert?from=${deMoeda}&to=${paraMoeda}&amount=${valor}&access_key=${accessKey}`;
    }

    console.log(
      `https://api.exchangerate.host/convert?from=${deMoeda}&to=${paraMoeda}&amount=${valor}&access_key=${accessKey}&date=${data}`,
    );

    try {
      const response = await fetch(url);
      const dataJson = await response.json();

      if (!dataJson.success) {
        throw new Error(
          dataJson.error.info || "Erro desconhecido na API Fixer.io",
        );
      }

      const valorConvertido = dataJson.result;

      const resultadoDivDe = document.getElementById("resultado-de");
      resultadoDivDe.innerHTML = `
                Conversão de: ${deMoeda}<br>
                Valor a converter: ${valor.toFixed(2)}
            `;

      const resultadoDivPara = document.getElementById("resultado-para");
      resultadoDivPara.innerHTML = `
                Para: ${paraMoeda}<br>
                Valor convertido: ${valorConvertido}
            `;
    } catch (error) {
      console.error("Erro ao buscar a API:", error);
      alert("Erro ao converter. Tente novamente.");
    }
  });

  // Atualiza a data formatada ao carregar a página
  document.getElementById("dataHoje").textContent = getDataFormatada();
  const cidade = "Manaus, BR";

  buscarClimaAtual(cidade);
  buscarPrevisaoClima(cidade);
});

const apiKey = "2b7416c8347545a711cbbc39289370ec";

function getDataFormatada() {
  const hoje = new Date();
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return hoje.toLocaleDateString("pt-BR", options);
}

function estimarQualidadeDoAr(data) {
  const ventoFraco = data.wind.speed <= 2.5;
  const altaUmidade = data.main.humidity >= 70;
  const muitasNuvens = data.clouds.all > 60;
  const calor = data.main.temp > 30;

  if (ventoFraco && altaUmidade && calor) {
    return "Ruim";
  } else if (ventoFraco && !muitasNuvens) {
    return "Moderada";
  } else {
    return "Boa";
  }
}

function estimarIndiceUv(data) {
  if (data.clouds.all < 20 && data.main.temp > 32) {
    return "Muito Alto";
  } else if (data.clouds.all < 50 && data.main.temp > 28) {
    return "Alto";
  } else {
    return "Baixo";
  }
}

// Buscar clima atual
function buscarClimaAtual(cidade) {
  // Link API: https://openweathermap.org/
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`,
  )
    .then((response) => {
      if (!response.ok) throw new Error("Cidade não encontrada");
      return response.json();
    })
    .then((data) => {
      document.getElementById("infoCidade").innerHTML = `
                <span>${data.name}</span>
                <h3>${data.weather[0].description}</h3>
                <div class="temperatura">${Math.round(data.main.temp)}°C</div>
            `;

      document.getElementById("detalhes").innerHTML = `
                <ul>
                    <li>Qualidade do ar: ${estimarQualidadeDoAr(data)}</li>
                    <li>Vento: ${(data.wind.speed * 3.6).toFixed(2)} km/h</li>
                    <li>Umidade: ${data.main.humidity}%</li>
                    <li>Índice UV: ${estimarIndiceUv(data)}</li>
                </ul>
            `;

      const descricao = data.weather[0].main.toLowerCase();
      let icone =
        '<img src="assets/icon/icone-sol-nuvem.svg" alt="Sol Nublado">';
      if (descricao.includes("cloud"))
        icone = '<img src="assets/icon/icone-nuvem.svg" alt="Nublado">';
      if (descricao.includes("rain"))
        icone = '<img src="assets/icon/icone-chuva.svg" alt="Chuva">';
      if (descricao.includes("clear"))
        icone = '<img src="assets/icon/icone-sol.svg" alt="Sol">';
      document.getElementById("iconeClima").innerHTML = icone;
    })
    .catch((err) => {
      alert("Erro ao buscar dados: " + err.message);
    });
}

// Buscar previsão por horário
function buscarPrevisaoClima(cidade) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`,
  )
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao buscar previsão");
      return response.json();
    })
    .then((data) => {
      const horas = [];
      const temperaturas = [];

      data.list.slice(0, 8).forEach((item) => {
        const hora = new Date(item.dt * 1000).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        horas.push(hora);
        temperaturas.push(item.main.temp);
      });

      const ctx = document
        .getElementById("graficoTemperatura")
        .getContext("2d");

      // Limpa gráfico anterior se já existir
      if (window.grafico) {
        window.grafico.destroy();
      }

      window.grafico = new Chart(ctx, {
        type: "line",
        data: {
          labels: horas,
          datasets: [
            {
              label: "Temperatura (°C)",
              data: temperaturas,
              borderColor: "#00796b",
              backgroundColor: "rgba(0,121,107,0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Hora",
              },
              grid: {
                display: false,
              },
            },
            y: {
              title: {
                display: true,
                text: "°C",
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });

      document.getElementById("graficoTemperatura").style.height = "250px";
    })
    .catch((err) => {
      alert("Erro ao buscar previsão: " + err.message);
    });
}

// Carrossel para .noticia-paginacao
function setupCarrosselPaginacao(
  paginacaoSelector,
  cardSelector,
  cardsPerPage = 3,
) {
  const paginacao = document.querySelector(paginacaoSelector);
  const cards = Array.from(document.querySelectorAll(cardSelector));
  if (!paginacao || cards.length === 0) return;

  let currentPage = 1;
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  function renderPage(page) {
    cards.forEach((card, i) => {
      const start = (page - 1) * cardsPerPage;
      const end = start + cardsPerPage;
      card.style.display = i >= start && i < end ? "" : "none";
    });
    // Atualiza botões
    paginacao.querySelectorAll("button").forEach((btn, idx) => {
      btn.classList.toggle("ativo", btn.textContent == page);
    });
  }

  paginacao.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      let val = e.target.textContent;
      if (
        val === "→" ||
        val === "⟶" ||
        val === "⟩" ||
        val === "›" ||
        val === ">"
      ) {
        if (currentPage < totalPages) currentPage++;
      } else if (
        val === "←" ||
        val === "⟵" ||
        val === "⟨" ||
        val === "‹" ||
        val === "<"
      ) {
        if (currentPage > 1) currentPage--;
      } else if (!isNaN(Number(val))) {
        currentPage = Number(val);
      }
      renderPage(currentPage);
    }
  });

  renderPage(currentPage);
}

document.addEventListener("DOMContentLoaded", () => {
  // Veja também (noticia.html)
  setupCarrosselPaginacao(".noticia-paginacao", ".noticia-veja-card", 3);
  // Notícias recentes (index.html)
  setupCarrosselPaginacao(
    ".noticias-recentes-lista .noticias-col ul + .noticia-paginacao",
    ".noticias-col li",
    3,
  );
  // Economia e Política (index.html)
  setupCarrosselPaginacao(
    ".economia-politica .paginacao",
    ".economia-politica-lista .noticia-card",
    3,
  );
  // Banner principal (index.html)
  setupCarrosselPaginacao(".noticia-banner .paginacao", ".noticia-banner", 1);
});

// Carrossel de notícias "Veja também"
(function () {
  const lista = document.getElementById("noticiaVejaLista");
  if (!lista) return;
  const cards = Array.from(lista.querySelectorAll(".noticia-veja-card"));
  const leftBtn = document.getElementById("carouselLeft");
  const rightBtn = document.getElementById("carouselRight");
  let start = 0;
  const visible = 3;

  function showCards() {
    // Corrige para nunca cortar o último bloco
    let maxStart = Math.max(0, cards.length - visible);
    if (start > maxStart) start = maxStart;
    cards.forEach((card, i) => {
      card.style.display = (i >= start && i < start + visible) ? "flex" : "none";
    });
    leftBtn.disabled = start === 0;
    rightBtn.disabled = start >= maxStart;
  }

  if (leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => {
      if (start > 0) {
        start--;
        showCards();
      }
    });
    rightBtn.addEventListener("click", () => {
      let maxStart = Math.max(0, cards.length - visible);
      if (start < maxStart) {
        start++;
        showCards();
      }
    });
  }
  showCards();
})();

// Carrossel horizontal para Notícias Recentes
(function () {
  const lista = document.getElementById("noticiasCarouselLista");
  if (!lista) return;
  const cards = Array.from(lista.children);
  const leftBtn = document.getElementById("noticiasCarouselLeft");
  const rightBtn = document.getElementById("noticiasCarouselRight");
  let start = 0;
  const visible = 3;
  function showCards() {
    cards.forEach((card, i) => {
      card.style.display = (i >= start && i < start + visible) ? "" : "none";
    });
    leftBtn.disabled = start === 0;
    rightBtn.disabled = start >= cards.length - visible;
  }
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => {
      if (start > 0) {
        start--;
        showCards();
      }
    });
    rightBtn.addEventListener("click", () => {
      let maxStart = Math.max(0, cards.length - visible);
      if (start < maxStart) {
        start++;
        showCards();
      }
    });
  }
  showCards();
})();
// Carrossel horizontal para Economia e Política
(function () {
  const lista = document.getElementById("economiaPoliticaCarouselLista");
  if (!lista) return;
  const cards = Array.from(lista.querySelectorAll(".noticia-veja-card"));
  const leftBtn = document.getElementById("economiaPoliticaCarouselLeft");
  const rightBtn = document.getElementById("economiaPoliticaCarouselRight");
  let start = 0;
  const visible = 3;
  function showCards() {
    let maxStart = Math.max(0, cards.length - visible);
    if (start > maxStart) start = maxStart;
    cards.forEach((card, i) => {
      card.style.display = (i >= start && i < start + visible) ? "flex" : "none";
    });
    leftBtn.disabled = start === 0;
    rightBtn.disabled = start >= maxStart;
  }
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => {
      if (start > 0) {
        start--;
        showCards();
      }
    });
    rightBtn.addEventListener("click", () => {
      let maxStart = Math.max(0, cards.length - visible);
      if (start < maxStart) {
        start++;
        showCards();
      }
    });
  }
  showCards();
})();

// Carrossel horizontal para Noticia Banner
(function () {
  const lista = document.getElementById("noticiaBannerCarouselLista");
  if (!lista) return;
  const cards = Array.from(lista.querySelectorAll(".noticia-veja-card"));
  const leftBtn = document.getElementById("noticiaBannerCarouselLeft");
  const rightBtn = document.getElementById("noticiaBannerCarouselRight");
  let start = 0;
  const visible = 1;
  function showCards() {
    let maxStart = Math.max(0, cards.length - visible);
    if (start > maxStart) start = maxStart;
    cards.forEach((card, i) => {
      card.style.display = (i >= start && i < start + visible) ? "flex" : "none";
    });
    leftBtn.disabled = start === 0;
    rightBtn.disabled = start >= maxStart;
  }
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => {
      if (start > 0) {
        start--;
        showCards();
      }
    });
    rightBtn.addEventListener("click", () => {
      let maxStart = Math.max(0, cards.length - visible);
      if (start < maxStart) {
        start++;
        showCards();
      }
    });
  }
  showCards();
})();

// Carrossel de banner principal (noticia-banner)
(function () {
  const lista = document.getElementById("noticiaBannerCarouselLista");
  if (!lista) return;
  const cards = Array.from(lista.querySelectorAll(".noticia-banner-card"));
  const leftBtn = document.getElementById("noticiaBannerCarouselLeft");
  const rightBtn = document.getElementById("noticiaBannerCarouselRight");
  let current = 0;
  function showCard(idx) {
    cards.forEach((card, i) => {
      card.style.display = (i === idx) ? "flex" : "none";
    });
    leftBtn.disabled = idx === 0;
    rightBtn.disabled = idx === cards.length - 1;
  }
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => {
      if (current > 0) {
        current--;
        showCard(current);
      }
    });
    rightBtn.addEventListener("click", () => {
      if (current < cards.length - 1) {
        current++;
        showCard(current);
      }
    });
  }
  showCard(current);
})();

// Menu mobile
// (garante funcionamento em todas as páginas)
document.addEventListener('DOMContentLoaded', function () {
  const menuIcon = document.getElementById('menuMobileIcon');
  const menuMobile = document.getElementById('menuMobile');
  if (menuIcon && menuMobile) {
    menuIcon.addEventListener('click', function () {
      menuMobile.classList.toggle('open');
    });
    // Fecha ao clicar fora
    document.addEventListener('click', function (e) {
      if (!menuMobile.contains(e.target) && !menuIcon.contains(e.target)) {
        menuMobile.classList.remove('open');
      }
    });
    // Fecha ao clicar em um link
    menuMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => menuMobile.classList.remove('open'));
    });
  }
});
