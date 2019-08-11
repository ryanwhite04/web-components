import { LitElement, html } from './dist/modules.js';

function dedent(string) {
  let lengths = string.split("\n").map(l => l.match(/^(\s+)\S+/)).filter(m => m).map(m => m[1].length)
  let mindent = Math.min(...lengths)
  mindent && (string = string.split("\n").map(l => l[0] === " " ? l.slice(mindent) : l).join("\n"))
  return string.trim().replace(/\\n/g, "\n")
}

export default class AceEditor extends LitElement {
  
  static get properties() {
    
    // AceEditor properties from editor.$options
    return {
      expand: { type: Boolean, attribute: true, reflect: true },
      alt: { type: Boolean, attribute: true, reflect: true },
      indent: { type: Boolean, attribute: true, reflect: true },
      baseurl: {
        type: String,
        attribute: true,
        reflect: true,
      },
      wrap: {
        type: Boolean,
        attribute: true,
        reflect: true,
      },
      theme: {
        type: String,
        attribute: true,
        reflect: true,
      },
      mode: {
        type: String,
        attribute: true,
        reflect: true,
      },
      readOnly: {
        type: Boolean,
        attribute: 'read-only',
        reflect: true,
      },
      softtabs: {
        type: Boolean,
        attribute: true,
        reflect: true,
      },
      fontSize: {
        type: Number,
        attribute: 'font-size',
        reflect: true,
      },
      tabSize: {
        type: Number,
        attribute: 'tab-size',
        reflect: true,
      },
      snippets: {
        type: String,
        attribute: true,
        reflect: true,
      },
      autocomplete: Object,
      minLines: {
        type: Number,
        attribute: 'min-lines',
        reflect: true,
      },
      maxLines: {
        type: Number,
        attribute: 'max-lines',
        reflect: true,
      },
      enableBasicAutocompletion: {
        type: Boolean,
        attribute: 'enable-basic-autocompletion',
        reflect: true,
      },
      enableLiveAutocompletion: {
        type: Boolean,
        attribute: 'enable-live-autocompletion',
        reflect: true,
      },
      enableSnippets: {
        type: Boolean,
        attribute: 'enable-snippets',
        reflect: true,
      },
      initialFocus: {
        type: Boolean,
        attribute: 'initial-focus',
        reflect: true,
      },
      placeholder: {
        type: String,
        attribute: true,
        reflect: true,
      },
    }
  }
  
  constructor() {
    super();
    // this.expand = false;
    // this.alt = false;
    this.indent = false;
    this.theme = 'github';
    this.mode = 'text';
    this.wrap = false;
    this.readOnly = false;
    this.softtabs = true;
    this.fontSize = 14;
    this.tabSize = 4;
    // this.snippets = '';
    // this.autocomplete = {};
    // this.minLines = 15;
    // this.maxLines = 30;
    this.enableBasicAutocompletion = true;
    this.enableLiveAutocompletion = false;
    this.enableSnippets = false;
    this.initialFocus = false;
    this.placeholder = '';
    console.log(this)
    this.baseurl = 'https://unpkg.com/ace-builds@1.4.1/src-min-noconflict'
    console.log({
      meta: import.meta,
      url: import.meta.url,
    })
//     this.baseurl = new URL('ace', import.meta.url).pathname;
  }
  
  async firstUpdated() {
    console.log('firstUpdates');
    this.ace = ace;
    this.prepare(ace.edit(this.renderRoot.getElementById('editor')));
  }
  
  prepare(editor) {
    console.log('prepare');
    let {
      alt,
      baseurl,
      initialFocus,
      enableSnippets,
      enableBasicAutocompletion,
      enableLiveAutocompletion,
      autocomplete,
      minLines,
      maxLines,
      mode,
      theme,
      placeholder,
      wrap,
      readOnly,
    } = this;
    
    editor.focus = () => {
      setTimeout(() => !editor.isFocused() && editor.textInput.focus())
      editor.textInput.$focusScroll = "browser"
      editor.textInput.focus();
    };

    this.injectStyle('#ace_editor\\.css');

    ['base', 'mode', 'theme', 'worker']
      .map(name => ace.config.set(`${name}Path`, baseurl))
    
    editor.on('change', (event, editor) => this.dispatchEvent(new CustomEvent('change', {
      detail: { value: editor.getValue() }
    })))
    
    editor.on('input', () => this.input(editor, placeholder));
    setTimeout(() => this.input(editor, placeholder), 100);
    
    initialFocus && editor.focus()

    editor.$blockScrolling = Infinity;
    editor.setTheme(`ace/theme/${this.theme}`);
    console.log({ editor, mode: this.mode });
    editor.session.setMode(`ace/theme/${this.mode}`);
    editor.setReadOnly(this.readOnly);
    editor.setOptions({
      wrap,
      enableSnippets: true,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion,
      minLines,
      maxLines,
      firstLineNumber: 0,
    })
    
    // snippets
    let snippetManager = ace.require('ace/snippets').snippetManager
    this.manager = snippetManager;
    this.registerSnippets = snippetManager.register.bind(snippetManager);
    
    // autocomplete
    ace.require('ace/ext/language_tools').addCompleter({
      getCompletions: (editor, session, pos, prefix, callback) =>
        callback(null, (prefix.length === 0) ? [] : (autocomplete || [])),
    });

    this.editor = editor;
        alt && this.swapAlt(alt)
    this.dispatchEvent(new CustomEvent('ready', { detail: { editor }}));
  }

  set snippets(src) {
    return fetch(src)
      .then(response => response.json())
      .then(this.register)
      .catch(console.error)
  }

  register(snippets) {

    console.log('register', snippets, {
      manager: this.manager,
      register: this.manager.register,
    })

    return this.manager.register(Object.entries(snippets).map(convert))

    function convert([name, content]) {
      content = typeof content === 'string' ? content : content.join('\n')
      return {
        name,
        tabTrigger: name,
        content
      }
    }
  }
  
  swapAlt() {
    // Tell ace that the alt key is held down for mousedown events
    // This makes it so blockselection is always on
    // It also allows block selection on chromebooks
    this.editor._eventRegistry.mousedown[1] = (func => e => func({
      ...e, ...e.__proto__,
      getButton: () => e.getButton(),
      domEvent: { ...e.domEvent,
        altKey: !e.domEvent.altKey,
        shiftKey: e.domEvent.shiftKey,
        ctrlKey: e.domEvent.ctrlKey,
      },
    }))(this.editor._eventRegistry.mousedown[1])
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
          height: 240px;
        }
        #editor {
          border: 1px solid #e3e3e3;
          border-radius: 4px;
          height: 100%;
          width: 100%;
          @apply --ace-editor;
        }
      </style>
      <div id="editor">${this.indent ? this.textContent : dedent(this.textContent)}</div>
    `;
  }
  
  addCommands(commands, editor) {
    commands.map(({ name, ...command }) => {
      this.editor.commands.addCommand({
        ...(this.editor.commands.commands[name] || { name }),
        ...command,
      })
    })
  }
  
  /**
   * Injects a style element into ace-widget's shadow root
   * @param {CSSSelector} selector for an element in the same shadow tree or document as `ace-widget`
   */
  injectStyle(selector){
    const lightStyle = this.getRootNode().querySelector(selector) || document.querySelector(selector);
    this.shadowRoot.appendChild(lightStyle.cloneNode(true));
  }
  
  set readOnly (v) { this._readOnly = v; this.editor && this.editor.setReadOnly(v) }  
  set wrap     (v) { this._wrap = v;     this.editor && this.editor.setOption('wrap', v) }
  set tabSize  (v) { this._tabSize = v;  this.editor && this.editor.setOption('tabSize', v) }
  set fontSize (v) { this._fontSize = v; this.editor && this.editor.setFontSize(v) }
  set mode     (v) {
    this._mode = v;
    this.editor &&
      this.editor.session &&
      this.editor.session.setMode(`ace/mode/${v}`)
  }
  set theme    (v) { this._theme = v;    this.editor && this.editor.setTheme(`ace/theme/${v}`) }
  set softTabs (v) { this._softTabs = v; this.editor && this.editor.setOption('softTabs', v) }
  set value    (v) { this._value = v;    this.editor && this.editor.setValue(v) }
    
  get readOnly()   { return this.editor ? this.editor.getOption('readOnly') : this._readOnly }
  get wrap()       { return this.editor ? this.editor.getOption('wrap')     : this._wrap }
  get tabSize()    { return this.editor ? this.editor.getOption('tabSize')  : this._tabSize }  
  get fontSize()   { return this.editor ? this.editor.getFontSize()         : this._fontSize} 
  get mode()       {
    return this.editor ? this.editor.getOption('mode').split('/')[2] : this._mode}
  get theme()      { return this.editor ? this.editor.getOption('theme').split('/')[2] : this._theme }
  get softTabs()   { return this.editor ? this.editor.getOption('softTabs') : this._softTabs }
  get value()      { return this.editor ? this.editor.getValue() : this._value }

  focus() { this.editor.focus() }

  input(editor, placeholder) {
    let shouldShow = !editor.getSession().getValue().length;
    let node = editor.renderer.emptyMessageNode;
    if (!shouldShow && node) {
        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode);
        editor.renderer.emptyMessageNode = null;
    } else if (shouldShow && !node) {
        node = editor.renderer.emptyMessageNode = document.createElement('div');
        node.textContent = placeholder;
        node.className = 'ace_comment';
        node.style.padding = '0 9px';
        node.style.zIndex = '1';
        node.style.position = 'absolute';
        node.style.color = '#aaa';
        editor.renderer.scroller.appendChild(node);
    }
  }
}
