function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function obterDataFormatadaMesDia(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${mes}-${dia}`;
}

function isFeriado(data) {
    const feriados = [
        '01-01', // Confraternização Universal
        '01-20', // Dia de São Sebastião (Municipal)
        '03-04', // Carnaval (Estadual)
        '04-18', // Sexta-Feira Santa
        '04-21', // Tiradentes
        '04-23', // Dia de São Jorge (Estadual)
        '05-01', // Dia do Trabalho
        '06-19', // Corpus Christi
        '09-07', // Independência do Brasil
        '10-12', // Nossa Senhora Aparecida
        '11-02', // Finados
        '11-15', // Proclamação da República
        '11-20', // Dia da Consciência Negra (Estadual)
        '12-25'  // Natal
    ];
    const dataFormatadaMesDia = obterDataFormatadaMesDia(data);
    return feriados.includes(dataFormatadaMesDia);
}

function isFimDeSemana(data) {
    const diaSemana = data.getDay();
    return diaSemana === 0 || diaSemana === 6;
}

function isDiaPermitido(data) {
    const diaSemana = data.getDay();
    return diaSemana === 1 || diaSemana === 3 || diaSemana === 5;
}

function adicionarDiasUteis(data, diasUteis) {
    let diasAdicionados = 0;
    let novaData = new Date(data);

    while (diasAdicionados < diasUteis) {
        novaData.setDate(novaData.getDate() + 1);

        if (!isFeriadoOuFimDeSemana(novaData)) {
            diasAdicionados++;
        }
    }

    return novaData;
}

function converteParaDate(dataStr) {
  const partes = dataStr.split("/");
  return new Date(partes[2], partes[1] - 1, partes[0]);
}
