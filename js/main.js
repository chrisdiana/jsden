(function() {
  const asciiLogo = '     _________  _____  __\r\n __ \/ \/ __\/ _ \\\/ __\/ |\/ \/\r\n\/ \/\/ \/\\ \\\/ \/\/ \/ _\/\/    \/ \r\n\\___\/___\/____\/___\/_\/|_\/';

  let tutorialText = `${asciiLogo}

Welcome to JSDen!

Press <i class="highlight">Ctrl+Enter</i> to evaluate code.

Write to the result window with <i class="highlight">log()</i>:

  <i>log(Math.random())</i>

Clear the result panel with <i class="highlight">clear()</i>.

Use <i class="highlight">help()</i> for more commands and info.

`;

    let helpText = `
JSDen Help
----------

# Built-in functions

  <span class="highlight">help()</span>        // - display additional help info
  <span class="highlight">info()</span>        // - more info about JSDen
  <span class="highlight">reset()</span>       // - reset the doc to this tutorial
  <span class="highlight">clear()</span>       // - empty the results
  <span class="highlight">save()</span>        // - save doc state to localStorage
  <span class="highlight">log()</span>         // - log element to results
  <span class="highlight">toggleRunBtn()</span>// - toggle run button
  <span class="highlight">setTheme()</span>    // - set using 'dark' or 'light' theme
  <span class="highlight">resultEl</span>      // - returns result element


# Saving

  The document state is stored in localStorage
  on page-unload. You can also use <i class="highlight">save()</i> to save
  the current state.


# External scripts

  Add external scripts using <a href="https://www.skypack.dev" target="_blank">Skypack</a> (or dynamic imports):

  <span class="highlight">import confetti from 'https://cdn.skypack.dev/canvas-confetti';</span>
  <span class="highlight">confetti();</span>


# Editor options

  Configure editor options <a href="https://codemirror.net/5/doc/manual.html#config" target="_blank">using CodeMirror</a>

    <span class="highlight">editor.setOption('tabSize', 2)</span>
    <span class="highlight">editor.setOption('theme', 'monokai')</span>
    <span class="highlight">editor.setOption('vimMode', true)</span>


# Result window

  Change the result window by calling functions
  on the #result div:

    <span class="highlight">resultEl.style = 'background:green';</span>


# Font size

  Change font size by <span class="highlight">Ctrl/Cmd + (-/+)</span> with
  standard browser zoom options.


# How to install

  <b>iOS Safari</b>
    Go to Share Menu > Add to Home Screen

  <b>Chrome</b>
    Go to Settings > Add to Home Screen
  `;

    let infoText = `${asciiLogo}

JSDen

Version: ${VERSION}

Source code available on Github:
<a href="https://github.com/chrisdiana/jsden" target="_blank">
  https://github.com/chrisdiana/jsden
</a>
  `;

  if (navigator.userAgent.indexOf('Mac OS X') != -1) {
    tutorialText = tutorialText.replace('Ctrl', 'Cmd');
  }

  const splitEls = ['#editor-container', '#result-container'];
  const editorEl = document.getElementById('editor-container');
  const resultEl = document.getElementById('result');
  const runEl = document.getElementById('run');

  const mobileBreakpoint = 700;
  const storageKey = 'jsden';

  let currentMode = 'dark';

  let split;
  let splitOptions = {
    minSize: 0,
  };

  const editor = CodeMirror(editorEl, {
    lineNumbers: false,
    tabSize: 2,
    theme: 'monokai',
    styleActiveLine: true,
    matchBrackets: true,
    autoCloseTags: true,
    lineWrapping: true,
    autofocus: true,
    hint: CodeMirror.hint.javascript,
    extraKeys: {"Ctrl-Space": "autocomplete"},
    mode: {name: "javascript", globalVars: true}
  });

  function debounce(func){
    let timer;
    return (event) => {
      if(timer) clearTimeout(timer);
      timer = setTimeout(func, 100, event);
    }
  }

  function setSplit() {
    if(split) {
      split.destroy();
    }
    if(document.body.clientWidth > mobileBreakpoint) {
      splitOptions.direction = 'horizontal';
      splitOptions.gutterSize = 10;
    } else {
      splitOptions.direction = 'vertical';
      splitOptions.gutterSize = 14;
    }
    split = window.Split(splitEls, splitOptions);
  }

  function updateResult(result, resultType) {
    let containerEl = document.createElement('div');
    containerEl.className = 'result-item';

    if(resultType === 'error') {
      containerEl.innerHTML = `<span class="result-error">ERROR: ${result}</span>`;
    } else if(resultType === 'info') {
      containerEl.innerHTML = `<span class="result-info">${result}</span>`;
    } else {
      const jsonResult = JSON.stringify(result);
      if(jsonResult) {
        containerEl = renderjson(JSON.parse(jsonResult));
      } else {
        containerEl.innerHTML = `<pre class="renderjson">${jsonResult}</pre>`;
      }
    }

    resultEl.appendChild(containerEl);
  }

  async function evaluate() {
    let selection = editor.getValue();
    let text = selection.toString();
    text = text.trim();

    if (text.length > 0) {
      try {
        text = `${encodeURIComponent(text)} /*${Math.random()}*/`;
        const dataUri = 'data:text/javascript;charset=utf-8,' + text;
        const module = await import(dataUri);
      } catch (e) {
        console.error(e);
        result = e.message;
        resultType = 'error';
        updateResult(result, resultType);
      }
      save();
    }
  }

  function tutorial() {
    updateResult(tutorialText, 'info');
  }

  function clear() {
    resultEl.innerHTML = '';
  }

  function save() {
    const state = {
      editor: editor.options,
      value: editor.getValue(),
      split: split.getSizes(),
      mode: currentMode,
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function setTheme(mode) {
    if(mode === 'dark') {
      currentMode = 'dark';
      editor.setOption('theme', 'monokai');
      document.body.classList.remove('light-mode');
    } else {
      currentMode = 'light';
      editor.setOption('theme', 'default');
      document.body.classList.add('light-mode');
    }
  }

  function updateAvailablePrompt(callback) {
    save();
    window.alert('Update found. Click ok to run update. All changes have been saved.');
    callback();
  }


  // Events
  document.addEventListener('keypress',
    (e) => (e.ctrlKey && e.code === 'Enter' && evaluate() && e.preventDefault()));

  document.addEventListener('keydown',
    (e) => (e.metaKey && e.code === 'Enter' && evaluate() && e.preventDefault()));

  window.onbeforeunload = () => save();
  window.onresize = debounce(e => setSplit());

  runEl.addEventListener('click', () => (evaluate(), editor.focus()));

  editor.on("keyup", function (cm, event) {
    if(event.ctrlKey && event.code === 'Space') {
      if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
          event.keyCode != 13) {        /*Enter - do not open autocomplete list just after item has been selected in it*/
          CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
      }
    }
  });

  // API
  const api = {
    clear,
    save,
    editor,
    tutorial,
    help: () => updateResult(helpText, 'info'),
    reset: () => (clear(), updateResult(tutorialText, 'info')),
    log: (x) => updateResult(x),
    info: () => updateResult(infoText, 'info'),
    toggleRunBtn: () => runEl.classList.toggle('hide'),
    setTheme,
    resultEl,
    updateAvailablePrompt,
  };

  // Init
  window.addEventListener('DOMContentLoaded', () => {
    setSplit();

    // extend api to global window
    for(var x in api) {
      window[x] = api[x];
    }

    const storedState = localStorage.getItem(storageKey);

    if (storedState) {
      const state = JSON.parse(storedState);
      currentMode = state.mode;
      setTheme(currentMode);
      split.setSizes(state.split);
      editor.options = state.editor;
      editor.setValue(state.value);
      if(!state.value.trim().length) {
        tutorial();
      }
    } else {
      tutorial();
    }

    editor.focus();
  });

})();
