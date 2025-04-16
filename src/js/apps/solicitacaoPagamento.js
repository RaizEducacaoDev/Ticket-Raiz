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
    defineCodigoDoMovimento()
  });
  
	$('#inptipoDaSolicitacao, #inptipoDoPagamento, #inpcontasDeConsumo, #inptipoDeItem, #inpoutrosGastos, #inpcentroDeCusto, #inpnaturezaOrcamentaria, #inpfornecedor').on('change', function() {
		defineCodigoDoMovimento()
	})
  
   $("#inpdataDeVencimento, inpvencimentoDaParcela").on("change", function () {
    const valor = $(this).val();
    if (!valor) return;

    const dataDigitada = new Date(valor);
    const hoje = new Date();
    const dataAjustada = ajustarParaSegQuaSexUtil(dataDigitada, hoje);

    // Atualiza o campo se a data foi modificada
    if (!datasIguais(dataDigitada, dataAjustada)) {
      const novaDataStr = formatarDataInput(dataAjustada);
      $(this).val(novaDataStr);
      console.log("??? Data ajustada:", novaDataStr);
    } else {
      console.log("? Data dentro da política.");
    }

    // Classificação com base em dias úteis
    const diasUteis = contarDiasUteisEntre(hoje, dataAjustada);
    const classificacao = diasUteis >= 5 ? "REGULAR" : "EMERGENCIAL";

    $("#inptipoDePedido").val(classificacao);
    console.log("?? tipoDePedido:", classificacao);
  });

});

function validaDataVencimento(input) {
  const $input = $(input); // garante que seja um objeto jQuery
  const valor = $input.val();

  if (!valor) return;

  const dataDigitada = new Date(valor);
  if (isNaN(dataDigitada)) return;

  const hoje = new Date();
  const dataAjustada = ajustarParaSegQuaSexUtil(dataDigitada, hoje);

  if (!datasIguais(dataDigitada, dataAjustada)) {
    const novaDataStr = formatarDataInput(dataAjustada);
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
  const tipoSolicitacao = $('#inptipoDaSolicitacao').val()
  const tipoDoPagamento = $('#inptipoDoPagamento').val()

  switch (tipoSolicitacao) {
    case "AD":
      $("#inpcodigoDoMovimento").val("1.2.06")
      $("#inpserie").val("AD")
      break;
    case "PG":
      if (tipoDoPagamento == "CC") {
        let contasDeConsumo = $("#inpcontasDeConsumo").val();
        $("#inpserie").val("1")
        if(contasDeConsumo == "A"){
          $("#inpcodigoDoMovimento").val("1.2.09")
        } else if (contasDeConsumo == "E") {
          $("#inpcodigoDoMovimento").val("1.2.10")
        } else if (contasDeConsumo == "T") {
          $("#inpcodigoDoMovimento").val("1.2.11")
        } else if (contasDeConsumo == "G") {
          $("#inpcodigoDoMovimento").val("1.2.12")
        }
      
      } else if (tipoDoPagamento == "NF") {
        if ($("#inptipoDeItem").val() == "Material") {
          $("#inpserie").val($("#inpserieDaNF").val())
          $("#inpcodigoDoMovimento").val("1.2.01")
        } else if ($("#inptipoDeItem").val() == "Serviço") {
          $("#inpserie").val($("#inpserieDaNF").val())
          $("#inpcodigoDoMovimento").val("1.2.03")
        }
      } else if (tipoDoPagamento == "OG") {
        if ($("#inpoutrosGastos").val() == "RF") {
          $("#inpserie").val("1")
          $("#inpcodigoDoMovimento").val("1.2.16")
        } else if ($("#inpoutrosGastos").val() == "AL" && $("#inptipoDoLocador").val() == "Pessoa Jurídica") {
          $("#inpserie").val("ALPJ")
          $("#inpcodigoDoMovimento").val("1.2.17")
        } else if ($("#inpoutrosGastos").val() == "AL" && $("#inptipoDoLocador").val() == "Pessoa Fisica") {
          $("#inpserie").val("ALPF")
          $("#inpcodigoDoMovimento").val("1.2.08")
        }
      } else if (tipoDoPagamento == "TM") {
        $("#inpserie").val($("#inpserieDaNF").val())
        $("#inpcodigoDoMovimento").val("1.2.25")
      }
      break;
    case "RE":
      $("#inpcodigoDoMovimento").val("1.2.07")
      $("#inpserie").val("PR")
      break;
    case "FF":
      $("#inpcodigoDoMovimento").val("1.2.29")
      $("#inpserie").val("PR")
      break;
  }
}

const feriados = [
  "01-01", "04-21", "05-01", "09-07", "10-12",
  "11-02", "11-15", "12-25", "01-20",
  "02-20", "03-29", "06-01"
];

function ehFeriado(data) {
  const mmdd = data.toISOString().slice(5, 10);
  return feriados.includes(mmdd);
}

function ehSegQuaSex(data) {
  const dia = data.getDay();
  return dia === 1 || dia === 3 || dia === 5;
}

function datasIguais(data1, data2) {
  return data1.toDateString() === data2.toDateString();
}

function proximoSegQuaSex(data) {
  let novaData = new Date(data);
  do {
    novaData.setDate(novaData.getDate() + 1);
  } while (!ehSegQuaSex(novaData) || ehFeriado(novaData));
  return novaData;
}

function ajustarParaSegQuaSexUtil(data, referenciaHoje) {
  let novaData = new Date(data);

  const diaSemana = novaData.getDay();

  if (diaSemana === 6 || diaSemana === 0) {
    let proximaSegunda = new Date(novaData);
    proximaSegunda.setDate(proximaSegunda.getDate() + (8 - diaSemana));

    if (ehFeriado(proximaSegunda)) {
      let sextaAnterior = new Date(novaData);
      sextaAnterior.setDate(sextaAnterior.getDate() - (diaSemana === 6 ? 1 : 2));
      while ((sextaAnterior.getDay() !== 5 || ehFeriado(sextaAnterior))) {
        sextaAnterior.setDate(sextaAnterior.getDate() - 1);
      }
      novaData = sextaAnterior;
    } else {
      novaData = proximaSegunda;
    }
  }

  while (!ehSegQuaSex(novaData)) {
    novaData.setDate(novaData.getDate() + 1);
  }

  while (ehFeriado(novaData)) {
    do {
      novaData.setDate(novaData.getDate() - 1);
    } while (!ehSegQuaSex(novaData) || ehFeriado(novaData));
  }

  if (datasIguais(novaData, referenciaHoje)) {
    novaData = proximoSegQuaSex(novaData);
  }

  return novaData;
}

function formatarDataInput(data) {
  return data.toISOString().split("T")[0];
}


function verificarQtdLinhas() {
  const tabelaAlvo = $('input#inpnumeroDaParcela').closest('table');
  const qtdLinhas = tabelaAlvo.find('tbody tr').length - 1;
  const qtdParcelas = $("#inpqtdParcelas").val();
  const codigoDaCondicao = $("#inpcodigoDaCondicaoPagamento").val();
  if (qtdParcelas != "" && codigoDaCondicao != "") {
    tabelaAlvo.find('#btnInsertNewRow').prop('disabled', qtdLinhas >= qtdParcelas);
  }
}
