const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createTaskSelectionState,
  reconcileTaskSelectionIds,
  createAssignmentPayload,
  movimentaTarefas,
  processaMovimentacao
} = require("../src/js/main.js");

test("preserva a seleção enquanto o Zeev esvazia o tbody", () => {
  const selection = createTaskSelectionState(["3256142"]);

  const checkedIds = reconcileTaskSelectionIds(selection, []);

  assert.deepEqual(checkedIds, []);
  assert.deepEqual(selection.values(), ["3256142"]);
});

test("restaura a tarefa selecionada depois do redraw", () => {
  const selection = createTaskSelectionState(["3256142"]);

  const checkedIds = reconcileTaskSelectionIds(selection, ["3256142"]);

  assert.deepEqual(checkedIds, ["3256142"]);
  assert.equal(selection.has("3256142"), true);
});

test("descarta uma seleção que não pertence ao novo resultado", () => {
  const selection = createTaskSelectionState(["3256142"]);

  const checkedIds = reconcileTaskSelectionIds(selection, ["9999999"]);

  assert.deepEqual(checkedIds, []);
  assert.deepEqual(selection.values(), []);
});

test("normaliza IDs e permite desmarcar uma tarefa", () => {
  const selection = createTaskSelectionState();

  selection.set(3256142, true);
  assert.equal(selection.has("3256142"), true);

  selection.set(" 3256142 ", false);
  assert.equal(selection.has(3256142), false);
});

test("bloqueia lote vazio antes de buscar token ou chamar a API", async () => {
  let modal = null;
  let ajaxCalls = 0;

  global.jq = (selector) => {
    if (selector === ".task-check-action:checked") {
      return {
        map() {
          return { get: () => [] };
        }
      };
    }

    return {
      hide() { return this; },
      remove() { return this; },
      prop() { return this; }
    };
  };
  global.jq.ajax = async () => {
    ajaxCalls++;
    return {};
  };
  global.mostrarModal = (title, message) => {
    modal = { title, message };
  };

  try {
    await movimentaTarefas(true);
  } finally {
    delete global.jq;
    delete global.mostrarModal;
  }

  assert.equal(ajaxCalls, 0);
  assert.equal(modal.title, "Atenção!");
  assert.match(modal.message, /Nenhuma tarefa está selecionada/);
});

test("não envia uma movimentação sem token", async () => {
  let ajaxCalls = 0;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  global.jq = {
    ajax: async () => {
      ajaxCalls++;
      return {};
    }
  };
  console.error = () => {};
  console.log = () => {};

  try {
    const response = await processaMovimentacao("3256142", "1", "Aprovado", null);
    assert.equal(response, null);
  } finally {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    delete global.jq;
  }

  assert.equal(ajaxCalls, 0);
});

test("monta o contrato de conclusão esperado pela API do Zeev", () => {
  assert.deepEqual(createAssignmentPayload("1", "Aprovado"), {
    result: "1",
    instanceTaskEnvelope: {
      formFields: [],
      comments: "Aprovado"
    }
  });
});

test("envia a aprovação com o envelope obrigatório da tarefa", async () => {
  let request = null;

  global.window = { location: { origin: "https://raizeducacao.zeev.it" } };
  global.jq = {
    ajax: async (options) => {
      request = options;
      return { success: true };
    }
  };

  try {
    const response = await processaMovimentacao("3256142", "1", "Aprovado", "temporary-token");

    assert.deepEqual(response, { success: true });
    assert.equal(request.url, "https://raizeducacao.zeev.it/api/2/assignments/3256142");
    assert.equal(request.method, "PUT");
    assert.equal(request.headers.Authorization, "Bearer temporary-token");
    assert.deepEqual(JSON.parse(request.data), {
      result: "1",
      instanceTaskEnvelope: {
        formFields: [],
        comments: "Aprovado"
      }
    });
  } finally {
    delete global.jq;
    delete global.window;
  }
});
