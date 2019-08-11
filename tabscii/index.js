import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@0.6.2/lit-element.js?module'
import 'https://unpkg.com/@material/mwc-fab@0.1.2/mwc-fab.js?module'
import TabEditor from './node_modules/tab-editor/index.js'

class TabEditor extends LitElement {
  
  static get properties() {
    return {
      paused: { type: Boolean, attribute: true, reflect: true }, // readOnly, returns a booolean indicating whether the element is paused
      tempo: { type: Number, attribute: true, reflect: true },
      capo: { type: Number, attribute: true, refelct: true },
      instruments: Array,
      controls: { type: Boolean, attribute: true, reflect: true },
      fullscreen: { type: Boolean, attribute: true, reflect: true },
      src: { type: String, attribute: true, reflect: true },
      save: { type: String, attribute: true, reflect: true },
      playbackRate: Number, // Not Implemented yet, alternative to tempo from media element
      volume: Number, // Is a double indicating the audio volume, from 0.0 (silent) to 1.0 (loudest)
      convert: Boolean, // Wether or not to parse the textContent and try to convert it to a stricter format
    }
  }

  constructor() {
    super();
  }

  async firstUpdated() {

    await super.firstUpdated();

    editor.on('change', debounced)

    this.worker.addEventListener('message', ({ data: { meta, parsed } }) => {
      console.log('Finished Parsing', {
        meta, parsed
      })
      this.parsed = parsed;
      this.meta = meta;
    })

    this.worker.addEventListener('error', console.error)
    this.worker.postMessage(this.value)

  }

}


customElements.define('tab-editor', TabEditor);

export default TabEditor;

function rename(oldName, newName) {
  localStorage.setItem(newName, localStorage.getItem(oldName))
  localStorage.removeItem(oldName)
}

function saveSession(session, name) {
  let value = session.getValue();
  let options = session.getOptions();
  let mode = session.getMode().$id;
  let selection = session.selection.toJSON();
  let scrollTop = session.getScrollTop();
  let scrollLeft = session.getScrollLeft();
  let { $session, ...undoManager } = session.getUndoManager();
  return localStorage.setItem(name, JSON.stringify({
    value,
    options,
    mode,
    selection,
    scrollTop,
    scrollLeft,
    undoManager,
  }))
}

function loadSession(session, name) {
  let {
    value,
    options,
    mode,
    selection,
    scrollTop,
    scrollLeft,
    undoManager,
  } = JSON.parse(localStorage.getItem(name));
  session.setValue(value);
  session.selection.fromJSON(selection);
  session.setOptions(options);
  session.setMode(mode);
  session.setScrollTop(scrollTop);
  session.setScrollLeft(scrollLeft);
  session.setUndoManager(Object.assign(session.getUndoManager(), undoManager));
}