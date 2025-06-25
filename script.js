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
});