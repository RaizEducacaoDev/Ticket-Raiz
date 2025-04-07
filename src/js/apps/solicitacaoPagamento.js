$(document).ready(function () {
  $('#inpaprovadorDeNatureza').val('antonio.silva@raizeducacao.com.br');
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
  
    $('#inpdataDeVencimento').on('change', function() {
        validaDataVencimento(this);
    });

});

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

function verificarQtdLinhas() {
  const tabelaAlvo = $('input#inpnumeroDaParcela').closest('table');
  const qtdLinhas = tabelaAlvo.find('tbody tr').length - 1;
  const qtdParcelas = $("#inpqtdParcelas").val();
  const codigoDaCondicao = $("#inpcodigoDaCondicaoPagamento").val();
  if (qtdParcelas != "" && codigoDaCondicao != "") {
    tabelaAlvo.find('#btnInsertNewRow').prop('disabled', qtdLinhas >= qtdParcelas);
  }
}

function validaDataVencimento(input) {
    let dataInput = input.value;
    let dataEscolhida = converteParaDate(dataInput);

    let dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    if (dataEscolhida <= dataAtual) {
        alert('A data escolhida não pode ser a data atual ou uma data anterior.');
        input.value = '';
        $('#inptipoDePedido').hide();
        return;
    }

    dataEscolhida = ajustarParaDiaPermitido(dataEscolhida);

    const diferencaTempo = dataEscolhida - dataAtual;
    const diferencaDias = diferencaTempo / (1000 * 3600 * 24);

    if (diferencaDias >= 3 && diferencaDias < 5  ) {
        $('#inptipoDePedido').val('EMERGÊNCIAL');
    } else if (diferencaDias >= 5) {
        $('#inptipoDePedido').val('REGULAR');
    } else {
      alert('A data escolhida não pode ser utilizada.');
    }

    $('#inptipoDePedido').show();
    input.value = formatarData(dataEscolhida);
}
