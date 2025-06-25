document.addEventListener('DOMContentLoaded', () => {
    const btnConverter = document.getElementById('converter');
    const btnTrocar = document.getElementById('trocar');

    const inputData = document.getElementById("dataCotacao");

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const dia = String(hoje.getDate()).padStart(2, '0');

    const dataMax = `${ano}-${mes}-${dia}`;
    inputData.max = dataMax;
    inputData.value = dataMax; // Opcional: já preenche com a data de hoje

    btnTrocar.addEventListener('click', () => {
        const de = document.getElementById('de');
        const para = document.getElementById('para');
        const temp = de.value;
        de.value = para.value;
        para.value = temp;
    });

    btnConverter.addEventListener('click', async () => {
        const valor = parseFloat(document.getElementById('valor').value.replace(',', '.'));
        const deMoeda = document.getElementById('de').value;
        const paraMoeda = document.getElementById('para').value;
        const data = document.getElementById('dataCotacao').value;

        console.log(valor, deMoeda, paraMoeda, data)

        if (isNaN(valor) || valor <= 0) {
            alert('Informe um valor válido para conversão.');
            return;
        }

        // Sua API key da Fixer.io aqui:
        const accessKey = '45569e6cf9cebb8f4fe1d96b10cdb7ac';

        // Montar URL para pegar taxas atuais ou históricas (se data informada)
        // exchangerate.host usa endpoint /latest para última cotação ou /YYYY-MM-DD para data específica
        // Link API: https://exchangerate.host/
        let url;
        if (data) { // Desnecessario porque o codigo ja preenche automaticamente com a data de hoje
            url = `https://api.exchangerate.host/convert?from=${deMoeda}&to=${paraMoeda}&amount=${valor}&access_key=${accessKey}&date=${data}`
        } else {
            url = `https://api.exchangerate.host/convert?from=${deMoeda}&to=${paraMoeda}&amount=${valor}&access_key=${accessKey}`
        }

        console.log(`https://api.exchangerate.host/convert?from=${deMoeda}&to=${paraMoeda}&amount=${valor}&access_key=${accessKey}&date=${data}`)

        try {
            const response = await fetch(url);
            const dataJson = await response.json();

            if (!dataJson.success) {
                throw new Error(dataJson.error.info || 'Erro desconhecido na API Fixer.io');
            }


            const valorConvertido = dataJson.result;

            const resultadoDivDe = document.getElementById('resultado-de');
            resultadoDivDe.innerHTML = `
                Conversão de: ${deMoeda}<br>
                Valor a converter: ${valor.toFixed(2)}
            `;

            const resultadoDivPara = document.getElementById('resultado-para');
            resultadoDivPara.innerHTML = `
                Para: ${paraMoeda}<br>
                Valor convertido: ${valorConvertido}
            `;
        } catch (error) {
            console.error('Erro ao buscar a API:', error);
            alert('Erro ao converter. Tente novamente.');
        }
    });

    // Atualiza a data formatada ao carregar a página
    document.getElementById('dataHoje').textContent = getDataFormatada();
    const cidade = 'Manaus, BR';
    
    buscarClimaAtual(cidade);
    buscarPrevisaoClima(cidade);
});

const apiKey = '2b7416c8347545a711cbbc39289370ec';

function getDataFormatada() {
    const hoje = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    return hoje.toLocaleDateString('pt-BR', options);
}


function estimarQualidadeDoAr(data) {
    const ventoFraco = data.wind.speed <= 2.5;
    const altaUmidade = data.main.humidity >= 70;
    const muitasNuvens = data.clouds.all > 60;
    const calor = data.main.temp > 30;
  
    if (ventoFraco && altaUmidade && calor) {
      return 'Ruim';
    } else if (ventoFraco && !muitasNuvens) {
      return 'Moderada';
    } else {
      return 'Boa';
    }
}

function estimarIndiceUv(data) {
    if (data.clouds.all < 20 && data.main.temp > 32) {
        return 'Muito Alto';
    } else if (data.clouds.all < 50 && data.main.temp > 28) {
        return 'Alto';
    } else {
        return 'Baixo';
    }
}

// Buscar clima atual
function buscarClimaAtual(cidade) {
// Link API: https://openweathermap.org/
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`)
        .then(response => {
        if (!response.ok) throw new Error('Cidade não encontrada');
            return response.json();
        })
        .then(data => {
            document.getElementById('infoCidade').innerHTML = `
                <span>${data.name}</span>
                <h3>${data.weather[0].description}</h3>
                <div class="temperatura">${Math.round(data.main.temp)}°C</div>
            `;

            document.getElementById('detalhes').innerHTML = `
                <ul>
                    <li>Qualidade do ar: ${estimarQualidadeDoAr(data)}</li>
                    <li>Vento: ${(data.wind.speed*3.6).toFixed(2)} km/h</li>
                    <li>Umidade: ${data.main.humidity}%</li>
                    <li>Índice UV: ${estimarIndiceUv(data)}</li>
                </ul>
            `;

            const descricao = data.weather[0].main.toLowerCase();
            let icone = '<img src="assets/icon/icone-sol-nuvem.svg" alt="Sol Nublado">';
            if (descricao.includes('cloud')) icone = '<img src="assets/icon/icone-nuvem.svg" alt="Nublado">';
            if (descricao.includes('rain')) icone = '<img src="assets/icon/icone-chuva.svg" alt="Chuva">';
            if (descricao.includes('clear')) icone = '<img src="assets/icon/icone-sol.svg" alt="Sol">';
            document.getElementById('iconeClima').innerHTML = icone;
        })
        .catch(err => {
            alert('Erro ao buscar dados: ' + err.message);
        });
}

// Buscar previsão por horário
function buscarPrevisaoClima(cidade) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar previsão');
            return response.json();
        })
        .then(data => {
            const horas = [];
            const temperaturas = [];

            data.list.slice(0, 8).forEach(item => {
                const hora = new Date(item.dt * 1000).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
                });
                horas.push(hora);
                temperaturas.push(item.main.temp);
            });

            const ctx = document.getElementById('graficoTemperatura').getContext('2d');

            // Limpa gráfico anterior se já existir
            if (window.grafico) {
                window.grafico.destroy();
            }

            window.grafico = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: horas,
                    datasets: [{
                        label: 'Temperatura (°C)',
                        data: temperaturas,
                        borderColor: '#00796b',
                        backgroundColor: 'rgba(0,121,107,0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Hora'
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '°C'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

            document.getElementById('graficoTemperatura').style.height = '250px';
        })
        .catch(err => {
            alert('Erro ao buscar previsão: ' + err.message);
        });
}

// Carrossel para .noticia-paginacao
function setupCarrosselPaginacao(paginacaoSelector, cardSelector, cardsPerPage = 3) {
  const paginacao = document.querySelector(paginacaoSelector);
  const cards = Array.from(document.querySelectorAll(cardSelector));
  if (!paginacao || cards.length === 0) return;

  let currentPage = 1;
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  function renderPage(page) {
    cards.forEach((card, i) => {
      const start = (page - 1) * cardsPerPage;
      const end = start + cardsPerPage;
      card.style.display = (i >= start && i < end) ? '' : 'none';
    });
    // Atualiza botões
    paginacao.querySelectorAll('button').forEach((btn, idx) => {
      btn.classList.toggle('ativo', btn.textContent == page);
    });
  }

  paginacao.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
      let val = e.target.textContent;
      if (val === '→' || val === '⟶' || val === '⟩' || val === '›' || val === '>') {
        if (currentPage < totalPages) currentPage++;
      } else if (val === '←' || val === '⟵' || val === '⟨' || val === '‹' || val === '<') {
        if (currentPage > 1) currentPage--;
      } else if (!isNaN(Number(val))) {
        currentPage = Number(val);
      }
      renderPage(currentPage);
    }
  });

  renderPage(currentPage);
}

document.addEventListener('DOMContentLoaded', () => {
  // Veja também (noticia.html)
  setupCarrosselPaginacao('.noticia-paginacao', '.noticia-veja-card', 3);
  // Notícias recentes (index.html)
  setupCarrosselPaginacao('.noticias-recentes-lista .noticias-col ul + .noticia-paginacao', '.noticias-col li', 3);
  // Economia e Política (index.html)
  setupCarrosselPaginacao('.economia-politica .paginacao', '.economia-politica-lista .noticia-card', 3);
  // Banner principal (index.html)
  setupCarrosselPaginacao('.noticia-banner .paginacao', '.noticia-banner', 1);
});