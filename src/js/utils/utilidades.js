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


(function(){
  const L = (...a)=>console.log('[FILE-CAPTURE]', ...a);

  // 1) Capture-phase listener (RODA ANTES do bubble / jQuery handlers)
  function captureHandler(e){
    try {
      const el = e.target;
      if (el && el.matches && el.matches('input[type="file"]')) {
        for (const f of el.files) L('capture change', f, el);
      }
    } catch(err){}
  }
  document.addEventListener('change', captureHandler, true);
  window.addEventListener('change', captureHandler, true);

  // 2) Patch FormData.append
  if (!FormData.prototype._fcPatched) {
    const origAppend = FormData.prototype.append;
    FormData.prototype.append = function(name, value, filename){
      try { if (value instanceof File) L('FormData.append', name, value, filename); } catch(e){}
      return origAppend.apply(this, arguments);
    };
    FormData.prototype._fcPatched = true;
  }

  // 3) Patch XHR.send
  if (!XMLHttpRequest.prototype._fcPatched) {
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body){
      try {
        if (body instanceof FormData) {
          for (const [k,v] of body.entries()) if (v instanceof File) L('XHR.send FormData file', k, v);
        }
      } catch(e){}
      return origSend.apply(this, arguments);
    };
    XMLHttpRequest.prototype._fcPatched = true;
  }

  // 4) Patch showOpenFilePicker (if present)
  if (window.showOpenFilePicker && !window._fcShowOpenPatched) {
    const origPicker = window.showOpenFilePicker;
    window.showOpenFilePicker = async function(...args){
      const handles = await origPicker.apply(this, args);
      L('showOpenFilePicker handles', handles);
      try {
        for (const h of handles) if (h.getFile) L('showOpenFilePicker file', await h.getFile());
      } catch(e){}
      return handles;
    };
    window._fcShowOpenPatched = true;
  }

  // 5) Patch attachShadow to add capture listener on new shadow roots
  if (!Element.prototype._fcShadowPatched) {
    const origAttach = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(init){
      const root = origAttach.apply(this, [init]);
      try {
        root.addEventListener('change', function(e){
          const el = e.target;
          if (el && el.matches && el.matches('input[type="file"]')) {
            for (const f of el.files) L('shadow change', f, el);
          }
        }, true);
      } catch(e){}
      return root;
    };
    Element.prototype._fcShadowPatched = true;
  }

  // 6) Scan existing open shadowRoots (best-effort; closed mode not accessible)
  (function scan(node){
    try {
      if (node.shadowRoot) {
        node.shadowRoot.addEventListener('change', function(e){
          const el=e.target;
          if (el && el.matches && el.matches('input[type="file"]')) for (const f of el.files) L('existing shadow change', f, el);
        }, true);
      }
    } catch(e){}
    for (let c=node.firstElementChild; c; c=c.nextElementSibling) scan(c);
  })(document);

  // 7) Attach to same-origin iframes
  Array.from(document.querySelectorAll('iframe')).forEach(f=>{
    try {
      const doc = f.contentDocument;
      if (doc) {
        doc.addEventListener('change', function(e){
          const el = e.target;
          if (el && el.matches && el.matches('input[type="file"]')) {
            for (const file of el.files) L('iframe change', file, el, f.src);
          }
        }, true);
      }
    } catch(err){
      L('iframe attach failed (cross-origin?)', f, err && err.message);
    }
  });
  // observe for new iframes
  new MutationObserver((mut)=> {
    for (const m of mut) for (const n of m.addedNodes) if (n.tagName === 'IFRAME') {
      try { n.contentDocument.addEventListener('change', captureHandler, true); } catch(e){ L('new iframe cross-origin?', n); }
    }
  }).observe(document.body, {childList:true, subtree:true});

  // 8) Hook jQuery.event.dispatch (if jQuery present) to read files inside jQuery handlers
  try {
    if (window.jQuery && !window.jQuery._fcPatched) {
      const jq = window.jQuery;
      if (jq.event && jq.event.dispatch) {
        const origDispatch = jq.event.dispatch;
        jq.event.dispatch = function(event){
          try {
            const el = event.target;
            if (el && el.matches && el.matches('input[type="file"]')) {
              for (const f of el.files) L('jQuery.dispatch file', f, el);
            }
          } catch(e){}
          return origDispatch.apply(this, arguments);
        };
        jq._fcPatched = true;
      }
    }
  } catch(e){}

  L('file-capture: installed. Agora abra o modal e faça o upload (veja logs).');
})();
