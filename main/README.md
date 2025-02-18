# Ticket-Raiz

Este projeto é um repositório contendo os arquivos fonte de personalização do BPMN Zeev da empresa Raiz Educação, apelidado internamente de Ticket Raiz.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

- `src/js/`: Contém os arquivos JavaScript utilizados para a personalização.
- `src/css/`: Contém os arquivos CSS utilizados para a estilização.

## Acesso aos Arquivos pelo GitHub Pages

Os arquivos deste repositório são acessíveis pelo GitHub Pages nas seguintes branches:

### Branch `main`

- [main.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/main.js)
- [utils/datas.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/utils/datas.js)
- [utils/components.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/utils/components.js)
- [apps/solicitacaoCompras.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/apps/solicitacaoCompras.js)
- [main.css](https://antonio-silva-raiz.github.io/Ticket-Raiz/main.css)
- [apps/solicitacaoPagamento.css](https://antonio-silva-raiz.github.io/Ticket-Raiz/apps/solicitacaoPagamento.css)

### Branch `dev`

- [main.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/dev/main.js)
- [utils/datas.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/dev/utils/datas.js)
- [utils/components.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/dev/utils/components.js)
- [apps/solicitacaoCompras.js](https://antonio-silva-raiz.github.io/Ticket-Raiz/dev/apps/solicitacaoCompras.js)
- [main.css](https://antonio-silva-raiz.github.io/Ticket-Raiz/dev/main.css)
- [apps/solicitacaoPagamento.css](https://antonio-silva-raiz.github.io/Ticket-Raiz/dev/apps/solicitacaoPagamento.css)

## Funções JavaScript

### `src/js/utils/datas.js`

- `formatarData(data)`: Formata uma data no formato `dd/MM/yyyy`.
- `obterDataFormatadaMesDia(data)`: Formata uma data no formato `MM-dd`.
- `isFeriadoOuFimDeSemana(data)`: Verifica se uma data é feriado ou fim de semana.
- `adicionarDiasUteis(data, diasUteis)`: Adiciona um número específico de dias úteis a uma data.
- `converteParaDate(dataStr)`: Converte uma string no formato `dd/MM/yyyy` para um objeto `Date`.

### `src/js/utils/components.js`

- `mostrarAlerta(type, title, message, duration)`: Exibe um alerta customizado com um timer e animação.
- `removeAlert(alert)`: Remove um alerta com animação.

### `src/js/main.js`

- Funções para personalizar a interface do usuário com base no domínio e na página atual.
- `attachEventHandlers(selectedNumbers)`: Anexa manipuladores de eventos para checkboxes de tarefas.
- `chkReload(selectedNumbers)`: Remarca os checkboxes após um reload.
- `addActionRow()`: Adiciona uma nova linha com um botão para aprovar tarefas.
- `converterParaData(dataStr)`: Converte uma string no formato `dd/MM/yyyy` para um objeto `Date`.
- `validaPendencias()`: Valida se o usuário possui tarefas pendentes para correção.
- `approveTasks(taskNumbers)`: Aprova tarefas via API.
- `applyDNoneForMobile()`: Aplica a classe `d-none` para elementos em dispositivos móveis.
- `verificaAtrasos(dominio)`: Verifica atrasos nas tarefas e exibe um modal com as informações.

### `src/js/apps/solicitacaoCompras.js`

- Arquivo para funções relacionadas à solicitação de compras (atualmente vazio).

## Contribuição

Para contribuir com este projeto, faça um fork do repositório, crie uma branch para suas alterações e envie um pull request.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.