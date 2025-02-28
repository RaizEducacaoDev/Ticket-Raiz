
jq(document).ready(function() {
    var jqinputDataVencimento = jq('#inpdataDeVencimento');
    var jqinputDiasPagamento = jq('#inpdiasParaOPagamento');

    if (!jqinputDataVencimento.length) {
        console.error("Elemento inpdataDeVencimento não encontrado.");
        return;
    }
    if (!jqinputDiasPagamento.length) {
        console.error("Elemento inpdiasParaOPagamento não encontrado.");
        return;
    }

    jqinputDataVencimento.on('change', function() {
        var dataString = jqinputDataVencimento.val();

        if (dataString) {
            var partesData = dataString.split("/");

            if (partesData.length !== 3) {
                console.error("Formato de data inválido. Use dd/mm/aaaa.");
                return;
            }

            var dia = parseInt(partesData[0], 10);
            var mes = parseInt(partesData[1], 10) - 1;
            var ano = parseInt(partesData[2], 10);

            var dataDeVencimento = new Date(ano, mes, dia);
            var dataAtual = new Date();

            dataAtual.setHours(0, 0, 0, 0);
            dataDeVencimento.setHours(0, 0, 0, 0);

            var diferencaEmDias = Math.ceil(
                (dataDeVencimento - dataAtual) / (1000 * 60 * 60 * 24)
            );

            jqinputDiasPagamento.val(diferencaEmDias);
            console.log(`Faltam ${diferencaEmDias} dias para o vencimento.`);
        } else {
            console.error("Campo de data de vencimento está vazio.");
        }
    });
});
function validaDataVencimento(input) {
    let dataInput = input.value;
    let [dia, mes, ano] = dataInput.split('/');
    let dataEscolhida = new Date(ano, mes - 1, dia);

    let dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    if (dataEscolhida <= dataAtual) {
        cryo_alert('<p style="color: red; text-align: center;">A data escolhida não pode ser a data atual ou uma data anterior.</p>');
        input.value = '';
        jq('#inptipoDePedido').hide();
        return;
    }

    while (isFeriadoOuFimDeSemana(dataEscolhida)) {
        dataEscolhida.setDate(dataEscolhida.getDate() + 1);
    }

    const diferencaTempo = dataEscolhida - dataAtual;
    const diferencaDias = diferencaTempo / (1000 * 3600 * 24);

    if (diferencaDias <= 7) {
        jq('#inptipoDePedido').val('EMERGÊNCIAL');
    } else {
        jq('#inptipoDePedido').val('REGULAR');
    }

    jq('#inptipoDePedido').show();

    input.value = formatarData(dataEscolhida);
}

function vencimentoParcela(input) {
    let dataInput = input.value;
    let [dia, mes, ano] = dataInput.split('/');
    let dataEscolhida = new Date(ano, mes - 1, dia);

    let dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    if (dataEscolhida <= dataAtual) {
        cryo_alert('<p style="color: red; text-align: center;">A data escolhida não pode ser a data atual ou uma data anterior.</p>');
        input.value = '';
        jq('#inptipoDePedido').hide();
        return;
    } else {
        if (isFeriadoOuFimDeSemana(dataEscolhida)) {
            let dataFinal = adicionarDiasUteis(dataEscolhida, 1);
            input.value = formatarData(dataFinal);
        }

        var datasDeVencimento = [];

        jq('input[data-name="vencimentoDaParcela"]').each(function () {
            var valorData = jq(this).val().trim();

            if (valorData !== '') {
                var partesData = valorData.split('/');
                var dataISO = new Date(partesData[2], partesData[1] - 1, partesData[0]);

                datasDeVencimento.push(dataISO);
            }
        });

        if (datasDeVencimento.length > 0) {
            var menorData = new Date(Math.min.apply(null, datasDeVencimento));

            const diferencaTempo = menorData - dataAtual;
            const diferencaDias = diferencaTempo / (1000 * 3600 * 24);

            if (diferencaDias <= 2) {
                jq('#inptipoDePedido').val('EMERGÊNCIAL');
            } else if (diferencaDias <= 4 && diferencaDias > 2) {
                jq('#inptipoDePedido').val('URGENTE');
            } else {
                jq('#inptipoDePedido').val('REGULAR');
            }

            jq('#inptipoDePedido').show();
            jq('#inpdataDeVencimento').val(formatarData(menorData));
        } else {
            console.log('Nenhuma data de vencimento encontrada.');
        }
    }
}
