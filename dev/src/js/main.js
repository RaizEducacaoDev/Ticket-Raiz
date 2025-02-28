// Bloco: remover jQuery existente e carregar a versão 3.7.1
(function(){
  delete window.jQuery;
  delete window.$;
  const script = document.createElement('script');
  script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
  script.integrity = "sha256-9VBSJQCVE+f/VlSzdumzU9M40HTVozQbaI3c5GBkrJE=";
  script.crossOrigin = "anonymous";
  script.onload = function() { console.log("jQuery 3.7.1 loaded."); };
  document.head.appendChild(script);
})();

$(document).ready(function () {
  const dominio = window.location.origin;
  const page = window.location.href;

  if (!localStorage.getItem('chkReload')) {
    localStorage.setItem('chkReload', '');
  } else if (localStorage.getItem('chkReload') === "1") {
    localStorage.setItem('chkReload', '');
  }

  addActionRow();

  const updateText = (selector, original, updated) => {
    $(selector).each(function () {
      const element = $(this).find('span').first();
      const text = element.text().replace(original, updated);
      element.text(text);
    });
  };

  const updatePageTitleAndButton = (original, updated) => {
    $('.page-title h1, .btn-new-notification span').each(function () {
      const text = $(this).text().replace(original, updated);
      $(this).text(text);
    });
  };

  if (dominio.includes('hml')) {
    $('#aHeaderMenuHomeName').text('Ticket Raiz HML');
  } else {
    $('#aHeaderMenuHomeName').text('Ticket Raiz');
  }

  $(`a[href="${dominio}/my/notifications"]`).removeClass("d-lg-none");
  updateText(`a[href="${dominio}/my/notifications"]`, /Notificações/g, 'Mensagens');
  $(`a[href="${dominio}/my/notifications"] .notification-count`).removeClass('d-none');

  switch (page) {
    case `${dominio}/my/notifications`:
    case `${dominio}/my/notifications#`:
      updatePageTitleAndButton(/Notificações/g, 'Mensagens');
      updatePageTitleAndButton(/notificação/g, 'mensagem');
      break;
    case `${dominio}/my/tasks`:
      $("tr").each(function () {
        $(this).find("th:first, td:first").removeClass("d-none");
      });

      applyDNoneForMobile();

      $(window).on("resize", applyDNoneForMobile);

      $('.table-hover-pointer thead tr th:first').html('<input type="checkbox" class="checkbox-header" id="checkbox-header">');

      var aprovadores = [1886, 1890, 1885, 1889, 4097, 2075, 2076, 2077, 2078, 1891, 1892, 4063, 1894, 2083, 1895, 1896, 1893, 1897, 2079, 2080, 2081, 2084, 2085, 2086, 2087, 2088, 4101]
      var usuarioLogado = parseInt($("#userId").val().match(/(\d+)$/))

      $('.task-check-action').change(function () {
        if (aprovadores.includes(usuarioLogado)) {
          const isChecked = $('.task-check-action:checked').length > 0;
          isChecked ? $("#containerButton").removeClass("d-none") : $("#containerButton").addClass("d-none");
        }
      });

      $('#checkbox-header').change(function () {
        const isChecked = $(this).prop('checked');
        $('.task-check-action').prop('checked', isChecked);
        if (aprovadores.includes(usuarioLogado)) {
          const isChecked = $('.task-check-action:checked').length > 0;
          isChecked ? $("#containerButton").removeClass("d-none") : $("#containerButton").addClass("d-none");
        }
      });

      break;
    case `${dominio}/my/services`:
      verificaAtrasos(dominio);
      break;
  }

  const observer = new MutationObserver(function (mutations, observerInstance) {
    if ($("#userPersona").val() != "PowerUser") {
      $("#LkDelete").hide();
    }

    observerInstance.disconnect();

    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        switch (page) {
          case `${dominio}/my/notifications#`:
            updateText('#LkSend', /Enviar notificação/g, 'Enviar mensagem');
            updateText('.modal-header.bg-white h1', /Notificação/g, 'Mensagem');
            break;
          case `${dominio}/my/services`:
            $(mutation.addedNodes).find('.card-title').each(function () {
              const text = $(this).text();
              const iconMap = {
                '[Atendimento]': "https://i.postimg.cc/t4pSfV5M/servico-de-atendimento-ao-consumidor.png",
                '[BI]': "https://i.postimg.cc/zXn20knh/business-intelligence.png",
                '[Operações]': "https://i.postimg.cc/13BCZ575/mechanical.png",
                '[P&C]': "https://i.postimg.cc/KzNCqDXQ/recursos-humanos.png",
                '[Comercial]': "https://i.postimg.cc/kXZzp5Zr/carrinho.png",
                '[Recursos Humanos]': "https://i.postimg.cc/KzNCqDXQ/recursos-humanos.png",
                '[Departamento Pessoal]': "https://i.postimg.cc/L6bFFDJb/estrutura-de-organizacao.png",
                '[Fiscal]': "https://i.postimg.cc/xdb047g5/livre-de-impostos-1.png",
                '[Financeiro]': "https://i.postimg.cc/wMR3cvZq/salvando.png",
                '[Jurídico]': "https://i.postimg.cc/Z584S36t/juridico-1.png",
                '[TI]': "https://i.postimg.cc/qR9cVgPY/tecnologia.png",
                '[Cobrança]': "https://i.postimg.cc/P5tFC8Bk/cobranca.png",
                '[TOTVS]': "https://i.postimg.cc/kMRrCKd1/totvs-icon-131953.png",
                '[Performance]': "https://i.postimg.cc/Pxq6SsdV/velocimetro.png"
              };

              for (const [prefix, iconSrc] of Object.entries(iconMap)) {
                if (text.startsWith(prefix) && $(this).find('img').length === 0) {
                  const icon = $('<img>', {
                    src: iconSrc,
                    alt: prefix.replace('[', '').replace(']', ''),
                    style: "width: 32px; height: 32px; margin-right: 10px;"
                  });
                  $(this).prepend(icon);
                  break;
                }
              }
            });

            $('.fav').html('<img class="ico-no-favorite ico-md" src="https://i.postimg.cc/KzWHSJL9/coracao.png" alt="Ícone de favorito">');
            $('.unfav').html('<img class="ico-no-favorite ico-md" src="https://i.postimg.cc/2jHg6F7L/coracao-3.png" alt="Ícone de favorito">');
            break;
          case `${dominio}/my/tasks`:
            $("tr").each(function () {
              $(this).find("th:first, td:first").removeClass("d-none");
            });

            var aprovadores = [1886, 1890, 1885, 1889, 4097, 2075, 2076, 2077, 2078, 1891, 1892, 4063, 1894, 2083, 1895, 1896, 1893, 1897, 2079, 2080, 2081, 2084, 2085, 2086, 2087, 2088, 4101]
            var usuarioLogado = parseInt($("#userId").val().match(/(\d+)$/))

            $('.task-check-action').change(function () {
              if (aprovadores.includes(usuarioLogado)) {
                const isChecked = $('.task-check-action:checked').length > 0;
                isChecked ? $("#containerButton").removeClass("d-none") : $("#containerButton").addClass("d-none");
              }
            });

            applyDNoneForMobile();
            break;
        }
      }
    });

    observerInstance.observe(document.body, { childList: true, subtree: true });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

function addActionRow() {
  const newRow = `
    <div id="containerButton" class="d-none box p-3 bg-light">
      <div class="input-group" style="display: flex; justify-content: space-around;">
        <button type="button" id="btnApproveTasks" class="btn btn-success ml-3" style="width: 33%;">Aprovar Tarefas</button>
        <button type="button" id="btnRejectTasks" class="btn btn-danger ml-3" style="width: 33%; display: none;">Reprovar Tarefas</button>
      </div>
    </div>`;

  $("#containerLoadMore").after(newRow);

  $("#btnApproveTasks").off("click").on("click", movimentaTarefas.bind(null, true));
  $("#btnRejectTasks").off("click").on("click", movimentaTarefas.bind(null, false));
}

async function validaPendencias() {
  const tokenElement = $('input[name="__RequestVerificationToken"]');
  const token = tokenElement.length ? tokenElement.val() : null;

  if (!token) {
    console.error("Token de verificação não encontrado.");
    return;
  }

  const url = `${window.location.origin}/api/internal/bpms/1.0/assignments?pagenumber=1&simulation=N&codreport=6x6Iw2g5qn7z%252Bt743f1Lbg%253D%253D&reporttype=mytasks&codflowexecute=&=&codtask=&taskstatus=S&field=&operator=Equal&fieldvaluetext=&fielddatasource=&fieldvalue=&requester=&codrequester=&=&tasklate=Late&startbegin=&startend=&sortfield=&sortdirection=ASC&keyword=&chkReload=on`;

  const headers = {
    "Accept": "*/*",
    "Content-Type": "application/json",
    "x-sml-antiforgerytoken": token
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.success.itens && data.success.itens.length > 0) {
        const items = data.success.itens;
        const dataAtual = new Date();
        let count = 0;

        $.each(items, function (index, item) {
          const dataDte = converteParaDate(item.dte);
          const diferencaDias = Math.floor((dataAtual - dataDte) / (1000 * 60 * 60 * 24));
          const regex = /corrigir|correção/i;

          if (diferencaDias >= 7 && regex.test(item.t)) {
            count++;
          }
        });

        if (count > 0) {
          mostrarAlerta('danger', 'Atenção', `Você ainda possui ${count} solicitações paradas na etapa de correção, não será possível abrir novas solicitações até que resolva suas pendências.`);
        } else {
          $('#colorbox, #modalOverlay').remove();
          $('body').css({ pointerEvents: 'auto', overflow: 'auto' });
        }
      } else {
        console.warn("Nenhum item encontrado ou estrutura inesperada");
      }
    } else {
      console.error("Erro HTTP:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

async function movimentaTarefas(decisao) {
  try {
    $(".app-overlay").show();
    let successTasks = [];
    let failedTasks = [];
    let processedCount = 0;
    
    const tasks = $('table tbody tr').map(function () {
      const checkbox = $(this).find('.task-check-action');
      if (checkbox.prop('checked')) {
        const taskNumber = $(this).data('key');
        const taskId = $(this).find('td.d-none.d-md-table-cell span.badge').text().trim();
        return { taskNumber, taskId };
      }
      return null;
    }).get().filter(task => task !== null);
    
    const totalTasks = tasks.length;
    
    $("body").append(`
      <div id="processingModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; z-index: 100; text-align: center;">
        <p>Processando movimentações...</p>
        <p id="progressCount">0 / ${totalTasks}</p>
      </div>
    `);
    
    for (const task of tasks) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay fixo de 300ms entre cada requisição
      const result = decisao ? "1" : "2";
      const reason = decisao ? "Aprovado" : "Reprovado";
      const response = await processaMovimentacao(task.taskNumber, result, reason);
      
      if (response) {
        successTasks.push(task.taskId);
      } else {
        failedTasks.push(task.taskId);
      }
      
      processedCount++;
      $("#progressCount").text(`${processedCount} / ${totalTasks}`);
    }
    
    $("#processingModal").remove();
    $(".app-overlay").hide();
    
    const successCount = successTasks.length;
    const failureCount = failedTasks.length;
    
    if (successCount > 0 && failureCount === 0) {
      mostrarModal("Sucesso!", `Todas as tarefas foram movimentadas com sucesso!<br><br> Sucesso em ${successCount} / ${successCount + failureCount} tarefas`, function () { window.location.reload(); });
    } else if (successCount === 0 && failureCount > 0) {
      mostrarModal("Erro!", `Nenhuma das tarefas pode ser movimentada!<br>Sucesso em ${successCount} / ${successCount + failureCount} tarefas<br><br>Por favor entre em contato com o time responsável através do email:<br>ticket.raiz@raizeducacao.com.br`, function () { window.location.reload(); });
    } else if (successCount > 0 && failureCount > 0) {
      mostrarModal("Atenção!", `Falha na movimentação de algumas tarefas!<br>Sucesso em ${successCount} / ${successCount + failureCount} tarefas<br><br> Por favor entre em contato com o time responsável através do email:<br>ticket.raiz@raizeducacao.com.br`, function () { window.location.reload(); });
    }
  } catch (error) {
    console.error("Erro ao processar tarefa:", error);
    $(".app-overlay").hide();
    $("#processingModal").remove();
  }
}

async function processaMovimentacao(id, result, reason) {
  try {
    let token = await buscaToken();  // Aguardar o token antes de enviar a requisição

    const response = await $.ajax({
      url: `${window.location.origin}/api/2/assignments/${id}`,
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({ result, reason })
    });

    return response;
  } catch (error) {
    console.error(`Erro ao processar tarefa:`, error);
    return null;  // Retorna null em caso de erro
  }
}

async function buscaToken() {
  try {
    var usuarioLogado = Number($("#userId").val().match(/\d+$/)?.[0]);
    if (isNaN(usuarioLogado)) throw new Error("ID do usuário inválido.");

    var apiUrl = `${window.location.origin}/api/internal/legacy/1.0/datasource/get/1.0/` +
      (window.location.origin.includes('hml')
        ? "yjbbrV4FLfJUDeTgo97d3CmCz9CCIBqtlH2OupdGmAiSrUr8-LKFdChlE37fCDRMhGf@-i0xUw8t9Pl8mXHU6w__"
        : "DDwgBioycx75M0IiEFF-sdk0HwdR17CgcklxG-9Wy5WHeAyX4eV9pCstsjxLBqOYG2SnaXgEA6YhPK1R8LpVdw__"
      );

    var responseToken = await $.ajax({ url: apiUrl, method: "GET", headers: { "Content-Type": "application/json" } });
    const token = responseToken?.success?.[0]?.cod || (() => { throw new Error("Token não encontrado."); })();

    var response = await $.ajax({
      url: `${window.location.origin}/api/2/tokens/impersonate/${usuarioLogado}`,
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    });

    return response?.impersonate?.temporaryToken || (() => { throw new Error("Token de impersonação não encontrado."); })();

  } catch (error) {
    console.error("Erro ao processar tarefa:", error);
    return null;
  }

}



function applyDNoneForMobile() {
  const isMobile = window.innerWidth <= 768;
  $("#containerReport tr").each(function () {
    $(this).find("small").toggleClass("d-none", isMobile);
    $('table.table th:nth-last-child(2), table.table td:nth-last-child(2)').hide();
  });
}

async function verificaAtrasos(dominio) {
  const tokenElement = $('input[name="__RequestVerificationToken"]');
  const token = tokenElement.length ? tokenElement.val() : null;

  if (!token) {
    console.error("Token de verificação não encontrado.");
    return;
  }

  const url = `${window.location.origin}/api/internal/bpms/1.0/assignments?pagenumber=1&simulation=N&codreport=6x6Iw2g5qn7z%252Bt743f1Lbg%253D%253D&reporttype=mytasks&codflowexecute=&=&codtask=&taskstatus=S&field=&operator=Equal&fieldvaluetext=&fielddatasource=&fieldvalue=&requester=&codrequester=&=&tasklate=Late&startbegin=&startend=&sortfield=&sortdirection=ASC&keyword=&chkReload=on`;

  const headers = {
    "Accept": "*/*",
    "Content-Type": "application/json",
    "x-sml-antiforgerytoken": token
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.success.itens && data.success.itens.length > 0) {
        const items = data.success.itens;
        const totalSolicitacoes = items.length;

        const tableRows = items.map(item => `
          <tr>
            <td style="white-space: nowrap;"><a href="${item.lk}" data-key="${item.cfetp}" tabindex="0" role="button">${item.cfe}</a></td>
            <td style="color: #dc3545; padding: 3px 10px; white-space: nowrap;">${item.el}</td>
            <td style="white-space: nowrap;">${item.t}</td>
          </tr>`).join('');

        const modalHTML = `
          <div id="modalOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 89 !important;"></div>
          <div id="colorbox" class="" role="dialog" tabindex="-1" style="display: block; visibility: visible; top: 50%; left: 50%; transform: translate(-50%, -50%); position: fixed; width: 400px; height: 350px; background: white; z-index: 90 !important; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); padding: 16px; overflow: hidden;">
            <h2 style="margin: 0; text-align: center; padding: 3px 0; font-size: 18px;">Atenção!</h2>
            <p style="text-align: left; font-size: 14px; margin-bottom: 3px;">
              Você possui um total de <strong style="color: #dc3545">${totalSolicitacoes}</strong> solicitações com o SLA expirado.
            </p>
            <div style="overflow-x: auto; overflow-y: auto; height: 200px;">
              <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 3px;">
                <thead>
                  <tr style="border: none;">
                    <th style="border: none; padding: 3px; white-space: nowrap;">#</th>
                    <th style="border: none; padding: 3px 10px; white-space: nowrap;">Venc.</th>
                    <th style="border: none; padding: 3px; white-space: nowrap;">Tarefa</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
            <div class="spaced text-right" style="margin-top: 3px; text-align: center;">
              <button type="button" class="btn btn-success" id="closeModalBtn" onclick="validaPendencias()" style="padding: 6px 12px;">OK</button>
            </div>
          </div>`;

        $('body').append(modalHTML);
      } else {
        console.warn("Nenhum item encontrado ou estrutura inesperada");
      }
    } else {
      console.error("Erro HTTP:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}
