// Função para pausar ou retomar intervalos e timeouts
let intervalIds = [];
let timeoutIds = [];

async function alternarIntervalosETimeouts(devePausar) {
    if (devePausar) {
        // Pausar intervalos e timeouts
        await new Promise(resolve => {
            for (let i = 1; i < 99999; i++) {
                window.clearInterval(i);
                window.clearTimeout(i);
                intervalIds.push(i);
                timeoutIds.push(i);
            }
            resolve();
        });

        window.originalSetInterval = window.setInterval;
        window.setInterval = () => {
            console.log("Bloqueado: setInterval");
            return null;
        };

        window.originalSetTimeout = window.setTimeout;
        window.setTimeout = () => {
            console.log("Bloqueado: setTimeout");
            return null;
        };

        console.log("Todos os intervalos e timeouts foram pausados.");
    } else {
        window.setInterval = window.originalSetInterval;
        window.setTimeout = window.originalSetTimeout;

        console.log("Intervalos e timeouts restaurados ao comportamento normal.");
    }
}
