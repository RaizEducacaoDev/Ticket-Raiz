$(document).ready(function () {
  $("b:contains('hide')").closest('tr').hide();

  verificarQtdLinhas();

  $(document).on('click', '#btnInsertNewRow', function () {
    setTimeout(verificarQtdLinhas, 10);
  });

  $(document).on('click', '.btn-delete-mv', function () {
    setTimeout(verificarQtdLinhas, 10);
  });

  $(document).on('change', '#inpcondicaoDePagamento', function () {
    setTimeout(verificarQtdLinhas, 10);
  });

  $(document).on('change', '#inptipoDaSolicitacao', function () {
    defineCodigoDoMovimento();
  });

  $('#inptipoDaSolicitacao, #inptipoDoPagamento, #inpcontasDeConsumo, #inptipoDeItem, #inpoutrosGastos, #inpcentroDeCusto, #inpnaturezaOrcamentaria, #inpfornecedor').on('change', function () {
    defineCodigoDoMovimento();
  });

  $("#inpdataDeVencimento, #inpvencimentoDaParcela").on("change", function () {
    validaDataVencimento($(this));
  });
});

function validaDataVencimento(input) {
  const $input = $(input);
  const valor = $input.val();

  if (!valor) return;

  const dataDigitada = parseDataBR(valor);
  if (!dataDigitada) return;

  const hoje = new Date();
  const dataAjustada = ajustarParaFrente(dataDigitada);

  if (!datasIguais(dataDigitada, dataAjustada)) {
    const novaDataStr = formatarDataInputBR(dataAjustada);
    $input.val(novaDataStr);
    console.log("??? Data ajustada:", novaDataStr);
  } else {
    console.log("? Data dentro da política.");
  }

  const diasUteis = contarDiasUteisEntre(hoje, dataAjustada);
  const classificacao = diasUteis >= 5 ? "REGULAR" : "EMERGENCIAL";

  $("#inptipoDePedido").val(classificacao);
  console.log("?? tipoDePedido:", classificacao);
}

function defineCodigoDoMovimento() {
  const tipoSolicitacao = $('#inptipoDaSolicitacao').val();
  const tipoDoPagamento = $('#inptipoDoPagamento').val();

  switch (tipoSolicitacao) {
    case "AD":
      $("#inpcodigoDoMovimento").val("1.2.06");
      $("#inpserie").val("AD");
      break;

    case "PG":
      if (tipoDoPagamento === "CC") {
        const contasDeConsumo = $("#inpcontasDeConsumo").val();
        $("#inpserie").val("1");
        const codigos = { "A": "1.2.09", "E": "1.2.10", "T": "1.2.11", "G": "1.2.12" };
        $("#inpcodigoDoMovimento").val(codigos[contasDeConsumo] || "");
      } else if (tipoDoPagamento === "NF") {
        const tipoItem = $("#inptipoDeItem").val();
        const serieNF = $("#inpserieDaNF").val();
        $("#inpserie").val(serieNF);
        $("#inpcodigoDoMovimento").val(tipoItem === "Material" ? "1.2.01" : tipoItem === "Serviço" ? "1.2.03" : "");
      } else if (tipoDoPagamento === "OG") {
        const outrosGastos = $("#inpoutrosGastos").val();
        const tipoLocador = $("#inptipoDoLocador").val();
        if (outrosGastos === "RF") {
          $("#inpserie").val("1");
          $("#inpcodigoDoMovimento").val("1.2.16");
        } else if (outrosGastos === "AL") {
          if (tipoLocador === "Pessoa Jurídica") {
            $("#inpserie").val("ALPJ");
            $("#inpcodigoDoMovimento").val("1.2.17");
          } else if (tipoLocador === "Pessoa Fisica") {
            $("#inpserie").val("ALPF");
            $("#inpcodigoDoMovimento").val("1.2.08");
          }
        }
      } else if (tipoDoPagamento === "TM") {
        $("#inpserie").val($("#inpserieDaNF").val());
        $("#inpcodigoDoMovimento").val("1.2.25");
      }
      break;

    case "RE":
      $("#inpcodigoDoMovimento").val("1.2.07");
      $("#inpserie").val("PR");
      break;

    case "FF":
      $("#inpcodigoDoMovimento").val("1.2.29");
      $("#inpserie").val("PR");
      break;
  }
}

const feriados = [
  "01-01",  // Confraternização Universal
  "03-03",  // Carnaval (segunda)
  "03-04",  // Carnaval (terça)
  "04-18",  // Sexta-feira Santa (Paixão de Cristo)
  "04-21",  // Tiradentes
  "05-01",  // Dia do Trabalho
  "06-19",  // Corpus Christi
  "09-07",  // Independência do Brasil
  "10-12",  // Nossa Senhora Aparecida
  "11-02",  // Finados
  "11-15",  // Proclamação da República
  "11-20",  // Zumbi/Consciência Negra
  "12-25",   // Natal
  "01-20",  // São Sebastião (Município RJ)
  "03-01",  // Aniversário da Cidade do Rio de Janeiro
  "04-23"   // São Jorge (Estado RJ)
];

function ehFeriado(data) {
  const mmdd = data.toISOString().slice(5, 10);
  return feriados.includes(mmdd);
}

function ehDiaUtil(data) {
  const dia = data.getDay();
  return dia >= 1 && dia <= 5 && !ehFeriado(data); // segunda a sexta e não feriado
}

function datasIguais(data1, data2) {
  return data1.toDateString() === data2.toDateString();
}

function ajustarParaFrente(data) {
  let novaData = new Date(data);
  while (!ehDiaUtil(novaData)) {
    novaData.setDate(novaData.getDate() + 1);
  }
  return novaData;
}

function contarDiasUteisEntre(inicio, fim) {
  let dias = 0;
  const dataAtual = new Date(inicio);
  dataAtual.setHours(0, 0, 0, 0);

  while (dataAtual < fim) {
    if (ehDiaUtil(dataAtual)) dias++;
    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return dias;
}

function parseDataBR(dataStr) {
  const partes = dataStr.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes.map(p => parseInt(p, 10));
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;

  const data = new Date(ano, mes - 1, dia);
  return (data.getDate() === dia && data.getMonth() === mes - 1 && data.getFullYear() === ano) ? data : null;
}

function formatarDataInputBR(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function verificarQtdLinhas() {
  const tabelaAlvo = $('input#inpnumeroDaParcela').closest('table');
  const qtdLinhas = tabelaAlvo.find('tbody tr').length - 1;
  const qtdParcelas = $("#inpqtdParcelas").val();
  const codigoDaCondicao = $("#inpcodigoDaCondicaoPagamento").val();

  if (qtdParcelas && codigoDaCondicao) {
    tabelaAlvo.find('#btnInsertNewRow').prop('disabled', qtdLinhas >= qtdParcelas);
  }
}
