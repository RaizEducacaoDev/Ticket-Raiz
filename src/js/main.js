function createTaskSelectionState(initialIds = []) {
  const selectedIds = new Set();

  const normalizeId = (id) => {
    if (id === null || id === undefined) return "";
    return String(id).trim();
  };

  initialIds.forEach((id) => {
    const normalizedId = normalizeId(id);
    if (normalizedId) selectedIds.add(normalizedId);
  });

  return {
    set(id, selected) {
      const normalizedId = normalizeId(id);
      if (!normalizedId) return;

      if (selected) {
        selectedIds.add(normalizedId);
      } else {
        selectedIds.delete(normalizedId);
      }
    },
    has(id) {
      const normalizedId = normalizeId(id);
      return normalizedId ? selectedIds.has(normalizedId) : false;
    },
    retain(ids) {
      const retainedIds = new Set(ids.map(normalizeId).filter(Boolean));
      selectedIds.forEach((id) => {
        if (!retainedIds.has(id)) selectedIds.delete(id);
      });
    },
    values() {
      return Array.from(selectedIds);
    }
  };
}

function reconcileTaskSelectionIds(selectionState, visibleIds) {
  const normalizedVisibleIds = visibleIds
    .map((id) => id === null || id === undefined ? "" : String(id).trim())
    .filter(Boolean);

  // Durante o carregamento o Zeev esvazia o tbody antes de inserir as novas
  // linhas. Preservar o estado nesse intervalo evita perder a seleção.
  if (normalizedVisibleIds.length > 0) {
    selectionState.retain(normalizedVisibleIds);
  }

  return normalizedVisibleIds.filter((id) => selectionState.has(id));
}

function resolveZeevUserId(candidates = []) {
  for (const candidate of candidates) {
    const match = String(candidate ?? "").match(/(\d+)$/);
    if (match) return Number(match[1]);
  }

  return null;
}

function getCurrentZeevUserId() {
  return resolveZeevUserId([
    jq("#userId").val(),
    jq(".menu-user .user[userid]").first().attr("userid"),
    jq(".user[userid]").first().attr("userid")
  ]);
}

function escapeTaskMessage(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showTaskModal(title, message, callback) {
  if (typeof mostrarModal === "function") {
    mostrarModal(title, message, callback);
    return;
  }

  jq("#modalOverlay, #colorbox").remove();
  jq("body").append(`
    <div id="modalOverlay" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); z-index: 89 !important;"></div>
    <div id="colorbox" role="dialog" tabindex="-1" style="display: block; visibility: visible; top: 50%; left: 50%; transform: translate(-50%, -50%); position: fixed; width: min(480px, calc(100vw - 32px)); background: white; z-index: 90 !important; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); padding: 16px;">
      <h2 style="margin: 0 0 12px; text-align: center; font-size: 18px;">${escapeTaskMessage(title)}</h2>
      <div style="max-height: 55vh; overflow-y: auto;">${message}</div>
      <div style="margin-top: 16px; text-align: center;">
        <button type="button" class="btn btn-success close-task-modal-btn">OK</button>
      </div>
    </div>
  `);

  jq(".close-task-modal-btn").off("click").on("click", function () {
    jq("#modalOverlay, #colorbox").remove();
    if (typeof callback === "function") callback();
  });
}

function extractMovementError(error) {
  const apiMessage = error?.responseJSON?.error?.message
    || error?.responseJSON?.message
    || error?.responseText
    || error?.message;

  if (apiMessage) {
    if (typeof apiMessage === "string") {
      try {
        const parsed = JSON.parse(apiMessage);
        return parsed?.error?.message || parsed?.message || apiMessage;
      } catch (_) {
        return apiMessage;
      }
    }

    return String(apiMessage);
  }

  return error?.status ? `Erro HTTP ${error.status}.` : "Erro inesperado ao movimentar a tarefa.";
}

if (typeof jq !== "undefined") {
  jq(document).ready(function () {
  const dominio = window.location.origin;
  const page = window.location.href;
  const taskSelectionState = createTaskSelectionState();
  const aprovadores = [1890, 1885, 1894, 4130, 1959, 1897, 5240, 1888, 4101, 7148];
  const usuarioLogado = getCurrentZeevUserId();
  const podeAprovarEmMassa = aprovadores.includes(usuarioLogado);
  let taskSelectionSyncTimer = null;

  const getTaskAssignmentId = (checkbox) => {
    const checkboxValue = jq(checkbox).val();
    const rowKey = jq(checkbox).closest("tr").data("key");
    return String(checkboxValue || rowKey || "").trim();
  };

  const updateTaskSelectionControls = () => {
    const checkboxes = jq(".task-check-action");
    const checkedCount = checkboxes.filter(":checked").length;
    const headerCheckbox = jq("#checkbox-header");

    headerCheckbox.prop("checked", checkboxes.length > 0 && checkedCount === checkboxes.length);
    headerCheckbox.prop("indeterminate", checkedCount > 0 && checkedCount < checkboxes.length);

    if (podeAprovarEmMassa && checkedCount > 0) {
      jq("#containerButton").removeClass("d-none");
    } else {
      jq("#containerButton").addClass("d-none");
    }
  };

  const reconcileTaskSelection = () => {
    const checkboxes = jq(".task-check-action");
    const visibleIds = checkboxes.map(function () {
      return getTaskAssignmentId(this);
    }).get();
    const checkedIds = new Set(reconcileTaskSelectionIds(taskSelectionState, visibleIds));

    checkboxes.each(function () {
      jq(this).prop("checked", checkedIds.has(getTaskAssignmentId(this)));
    });

    updateTaskSelectionControls();
  };

  const scheduleTaskSelectionSync = () => {
    clearTimeout(taskSelectionSyncTimer);
    taskSelectionSyncTimer = setTimeout(reconcileTaskSelection, 0);
  };

  const ensureTaskHeaderCheckbox = () => {
    const tableHeader = jq(".table-hover-pointer thead tr th:first");
    if (tableHeader.length > 0 && jq("#checkbox-header").length === 0) {
      tableHeader.html('<input type="checkbox" class="checkbox-header" id="checkbox-header">');
    }
  };

  if (!localStorage.getItem('chkReload')) {
    localStorage.setItem('chkReload', '');
  } else if (localStorage.getItem('chkReload') === "1") {
    localStorage.setItem('chkReload', '');
  }

  addActionRow();

  const updateText = (selector, original, updated) => {
    jq(selector).each(function () {
      const element = jq(this).find('span').first();
      const text = element.text().replace(original, updated);
      element.text(text);
    });
  };

  const updatePageTitleAndButton = (original, updated) => {
    jq('.page-title h1, .btn-new-notification span').each(function () {
      const text = jq(this).text().replace(original, updated);
      jq(this).text(text);
    });
  };

  if (dominio.includes('hml')) {
    jq('#aHeaderMenuHomeName').text('Ticket Raiz HML');
  } else {
    jq('#aHeaderMenuHomeName').text('Ticket Raiz');
  }

  jq(`a[href="${dominio}/my/notifications"]`).removeClass("d-lg-none");
  updateText(`a[href="${dominio}/my/notifications"]`, /Notificações/g, 'Mensagens');
  jq(`a[href="${dominio}/my/notifications"] .notification-count`).removeClass('d-none');

  switch (page) {
    case `${dominio}/my/notifications`:
    case `${dominio}/my/notifications#`:
      updatePageTitleAndButton(/Notificações/g, 'Mensagens');
      updatePageTitleAndButton(/notificação/g, 'mensagem');
      break;
    case `${dominio}/my/tasks`:
      jq("tr").each(function () {
        jq(this).find("th:first, td:first").removeClass("d-none");
      });

      applyDNoneForMobile();

      jq(window).on("resize", applyDNoneForMobile);

      ensureTaskHeaderCheckbox();
      setInterval(ensureTaskHeaderCheckbox, 500);

      jq(document).off("change.ticketRaizTaskSelection", ".task-check-action");
      jq(document).on("change.ticketRaizTaskSelection", ".task-check-action", function () {
        taskSelectionState.set(getTaskAssignmentId(this), jq(this).prop("checked"));
        updateTaskSelectionControls();
      });

      jq(document).off("change.ticketRaizTaskSelection", "#checkbox-header");
      jq(document).on("change.ticketRaizTaskSelection", "#checkbox-header", function () {
        const isChecked = jq(this).prop("checked");
        jq(".task-check-action").each(function () {
          jq(this).prop("checked", isChecked);
          taskSelectionState.set(getTaskAssignmentId(this), isChecked);
        });
        updateTaskSelectionControls();
      });

      jq(".task-check-action:checked").each(function () {
        taskSelectionState.set(getTaskAssignmentId(this), true);
      });
      scheduleTaskSelectionSync();

      break;
    case `${dominio}/my/services`:
      //verificaAtrasos(dominio);
      break;
  }

  const observer = new MutationObserver(function (mutations, observerInstance) {
    if (jq("#userPersona").val() != "PowerUser") {
      jq("#LkDelete").hide();
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
            jq(mutation.addedNodes).find('.card-title').each(function () {
              const text = jq(this).text();
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
                if (text.startsWith(prefix) && jq(this).find('img').length === 0) {
                  const icon = jq('<img>', {
                    src: iconSrc,
                    alt: prefix.replace('[', '').replace(']', ''),
                    style: "width: 32px; height: 32px; margin-right: 10px;"
                  });
                  jq(this).prepend(icon);
                  break;
                }
              }
            });

            jq('.fav').html('<img class="ico-no-favorite ico-md" src="https://i.postimg.cc/KzWHSJL9/coracao.png" alt="Ícone de favorito">');
            jq('.unfav').html('<img class="ico-no-favorite ico-md" src="https://i.postimg.cc/2jHg6F7L/coracao-3.png" alt="Ícone de favorito">');
            break;
          case `${dominio}/my/tasks`:
            jq("tr").each(function () {
              jq(this).find("th:first, td:first").removeClass("d-none");
            });

            ensureTaskHeaderCheckbox();

            applyDNoneForMobile();
            scheduleTaskSelectionSync();
            break;
        }
      }
    });

    observerInstance.observe(document.body, { childList: true, subtree: true });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  });
}

function addActionRow() {
  const newRow = `
    <div id="containerButton" class="d-none" style="display: flex; align-items: center; margin-left: auto;">
      <button type="button" id="btnApproveTasks" class="btn btn-success ml-3" style="white-space: nowrap;">Aprovar Tarefas</button>
      <button type="button" id="btnRejectTasks" class="btn btn-danger ml-3" style="white-space: nowrap; display: none;">Reprovar Tarefas</button>
    </div>`;

  jq("#containerActions .input-group").append(newRow);

  jq("#btnApproveTasks").off("click").on("click", movimentaTarefas.bind(null, true));
  jq("#btnRejectTasks").off("click").on("click", movimentaTarefas.bind(null, false));
}

async function validaPendencias() {
  const tokenElement = jq('input[name="__RequestVerificationToken"]');
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
      console.log (data)
      if (data.success && data.success.itens && data.success.itens.length > 0) {
        const items = data.success.itens;
        const dataAtual = new Date();
        let count = 0;

        jq.each(items, function (index, item) {
          const dataDte = converteParaDate(item.dte);
          const diferencaDias = Math.floor((dataAtual - dataDte) / (1000 * 60 * 60 * 24));
          const regex = /corrigir|correção|validar\s+comprovante/i;

          if (diferencaDias >= 7 && regex.test(item.t)) {
            count++;
          }
        });

        if (count > 0) {
          mostrarAlerta('danger', 'Atenção', `Existem ${count} pendências em aberto. Para prosseguir com novas solicitações, é necessário resolvê-las primeiro.`);
        } else {
          jq('#colorbox, #modalOverlay').remove();
          jq('body').css({ pointerEvents: 'auto', overflow: 'auto' });
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
    let successTasks = [];
    let failedTasks = [];
    let processedCount = 0;

    const tasks = jq(".task-check-action:checked").map(function () {
      const checkbox = jq(this);
      const row = checkbox.closest("tr");
      const taskNumber = String(checkbox.val() || row.data("key") || "").trim();
      const taskId = row.find("td.d-none.d-md-table-cell span.badge").text().trim();

      return taskNumber ? { taskNumber, taskId: taskId || `#${taskNumber}` } : null;
    }).get().filter(Boolean);
    console.log("Tarefas selecionadas para processamento:", tasks);

    const totalTasks = tasks.length;

    if (totalTasks === 0) {
      showTaskModal(
        "Atenção!",
        "Nenhuma tarefa está selecionada.<br><br>Marque ao menos uma tarefa antes de executar a aprovação."
      );
      return;
    }

    jq("#btnApproveTasks, #btnRejectTasks").prop("disabled", true);
    jq(".app-overlay").show();

    jq("body").append(`
      <div id="processingModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; z-index: 100; text-align: center;">
        <p>Processando movimentações...</p>
        <p id="progressCount">0 / ${totalTasks}</p>
      </div>
    `);

    const token = await buscaToken();

    if (!token) {
      failedTasks = tasks.map((task) => ({
        taskId: task.taskId,
        error: "Não foi possível autenticar o usuário no Zeev."
      }));
      processedCount = totalTasks;
      jq("#progressCount").text(`${processedCount} / ${totalTasks}`);
    } else {
      for (const task of tasks) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const result = decisao ? "1" : "2";
        const reason = decisao ? "Aprovado" : "Reprovado";
        const response = await processaMovimentacao(task.taskNumber, result, reason, token);

        if (response.success) {
          successTasks.push(task.taskId);
        } else {
          failedTasks.push({ taskId: task.taskId, error: response.error });
        }

        processedCount++;
        jq("#progressCount").text(`${processedCount} / ${totalTasks}`);
      }
    }

    const successCount = successTasks.length;
    const failureCount = failedTasks.length;
    const failureDetails = failedTasks.map((failure) => (
      `<strong>${escapeTaskMessage(failure.taskId)}</strong>: ${escapeTaskMessage(failure.error)}`
    )).join("<br>");

    if (successCount > 0 && failureCount === 0) {
      showTaskModal("Sucesso!", `Todas as tarefas foram movimentadas com sucesso!<br><br> Sucesso em ${successCount} / ${successCount + failureCount} tarefas`, function () { window.location.reload(); });
    } else if (successCount === 0 && failureCount > 0) {
      showTaskModal("Erro!", `Nenhuma das tarefas pode ser movimentada!<br>Sucesso em ${successCount} / ${successCount + failureCount} tarefas<br><br>${failureDetails}<br><br>Por favor entre em contato com o time responsável através do email:<br>ticket.raiz@raizeducacao.com.br`);
    } else if (successCount > 0 && failureCount > 0) {
      showTaskModal("Atenção!", `Falha na movimentação de algumas tarefas!<br>Sucesso em ${successCount} / ${successCount + failureCount} tarefas<br><br>${failureDetails}<br><br>Por favor entre em contato com o time responsável através do email:<br>ticket.raiz@raizeducacao.com.br`);
    }
  } catch (error) {
    console.error("Erro ao processar tarefa:", error);
    showTaskModal(
      "Erro!",
      "Não foi possível concluir o processamento das tarefas.<br><br>Tente novamente ou entre em contato com o time responsável."
    );
  } finally {
    jq(".app-overlay").hide();
    jq("#processingModal").remove();
    jq("#btnApproveTasks, #btnRejectTasks").prop("disabled", false);
  }
}

function createAssignmentPayload(result, reason) {
  return {
    result: String(result ?? "").trim(),
    instanceTaskEnvelope: {
      formFields: [],
      comments: String(reason ?? "").trim()
    }
  };
}

async function processaMovimentacao(id, result, reason, token) {
  try {
    if (!token) throw new Error("Token de autenticação não encontrado.");

    const response = await jq.ajax({
      url: `${window.location.origin}/api/2/assignments/${id}`,
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(createAssignmentPayload(result, reason))
    });

    return { success: true, response };
  } catch (error) {
    console.error(`Erro ao processar tarefa:`, error);
    
    // Objeto bruto
    console.log("Erro bruto:", error);

    // Status HTTP
    console.log("Status:", error.status);

    // Texto da resposta (string)
    console.log("ResponseText:", error.responseText);

    // Se o jQuery já tiver parseado o JSON
    if (error.responseJSON) {
      console.log("ResponseJSON:", error.responseJSON);
    }
    return {
      success: false,
      status: error?.status || null,
      error: extractMovementError(error)
    };
  }
}

async function buscaToken() {
  try {
    var usuarioLogado = getCurrentZeevUserId();
    if (!usuarioLogado) throw new Error("ID do usuário inválido.");

    var apiUrl = `${window.location.origin}/api/internal/legacy/1.0/datasource/get/1.0/` +
      (window.location.origin.includes('hml')
        ? "yjbbrV4FLfJUDeTgo97d3CmCz9CCIBqtlH2OupdGmAiSrUr8-LKFdChlE37fCDRMhGf@-i0xUw8t9Pl8mXHU6w__"
        : "DDwgBioycx75M0IiEFF-sdk0HwdR17CgcklxG-9Wy5WHeAyX4eV9pCstsjxLBqOYG2SnaXgEA6YhPK1R8LpVdw__"
      );

    var responseToken = await jq.ajax({ url: apiUrl, method: "GET", headers: { "Content-Type": "application/json" } });
    const token = responseToken?.success?.[0]?.cod || (() => { throw new Error("Token não encontrado."); })();

    var response = await jq.ajax({
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
  jq("#containerReport tr").each(function () {
    jq(this).find("small").toggleClass("d-none", isMobile);
    jq('table.table th:nth-last-child(2), table.table td:nth-last-child(2)').hide();
  });
}

async function verificaAtrasos(dominio) {
  const tokenElement = jq('input[name="__RequestVerificationToken"]');
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

        jq('body').append(modalHTML);
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createTaskSelectionState,
    reconcileTaskSelectionIds,
    resolveZeevUserId,
    escapeTaskMessage,
    extractMovementError,
    createAssignmentPayload,
    movimentaTarefas,
    processaMovimentacao
  };
}
