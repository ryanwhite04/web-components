import { aliases, names, families, notes, formats } from './soundfonts.js'
import Tone from './tone.js'
import { html } from 'lit-element'
import 'mwc-fab'
import AceEditor from 'ace-editor'

const { Players } = Tone();

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// Set up the instruments and stuff
let collection = new Array(128).fill(false);

collection.play = function({
  note,
  duration,
  offset,
}, id = 24) {
  if (this[id]) {
    this[id] === 'loading' || this[id].play(note, duration, offset)
  } else {
    this.load(id)
  }
}

async function loadInstrument(id = 24, ext = 'mp3') {

  function buffer(ogg) {
    return new Promise((resolve, reject) => new Players(ogg, resolve))
  }
  
  const player = (await fetch(`https://ryanwhite04.com/soundfonts/${names[id]}.json`)
    .then(response => response.json())
    .then(buffer)
    .catch(console.error)).toMaster()

  return {
    name: names[id],
    notes: { first: 21, last: 109 },
    family: families[~~(id / 16)],
    play: (note, duration, offset) => {
      console.log('play', player.has(note), player.get(note), { note, duration, offset })
      player.has(note) && player.get(note).start(undefined, undefined, duration)
    },
  }
}

function download(app) {
  return function(editor, args) {
    console.log('download', { app, editor, args })
  }
}

function upload(app) {
  return function(editor, args) {
    console.log('upload', { app, editor, args })
  }
}

// Find the right method, call on correct element
async function enterFullscreen(e) {
  console.log('enterFullScreen', { e })
  return await e.requestFullScreen ?
    e.requestFullScreen() :
    e.mozRequestFullScreen ?
      e.mozRequestFullScreen() :
      e.webkitRequestFullscreen ?
        e.webkitRequestFullscreen() :
        e.msRequestFullscreen ?
          e.msRequestFullscreen() :
          console.log("can't go full screen")
}

// Whack fullscreen
function exitFullscreen() {
  console.log('exitFullScreen')
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}
  
class TabEditor extends AceEditor {
  
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

  get fullscreen() {
    return document.fullscreenElement === this;
  }

  set fullscreen(fullscreen) {
    if (fullscreen) {
      (document.fullscreen || enterFullscreen(this).then(e => {
        console.log('has entered fullscreen', e)
        this._fullscreen = true;
        this.requestUpdate()
      }))
    } else {
      document.fullscreen && exitFullscreen();
      this._fullscreen = false;
      this.requestUpdate()
    }
  }

  set src(src) {
    return this.editor && this.load(src)
  }
  
  get src() {
    return this.getAttribute('src')
  }
  
  toggle() {
    this.paused = !this.paused
  }
  
  constructor() {
    super();

//     ace.config.set('basePath', 'https://unpkg.com/ace-builds/src-min-noconflict');
//     ['base', 'mode', 'theme', 'worker'].map(name => ace.config.set(`${name}Path`, baseurl))
//     ace.config.set('modePath', './');

    this.convert = false;
    this.controls = false;
    this.alt = true;
    this.tempo = 120;
    this.parsed = false;
    this.paused = true;
    this.fullscreen = false;
    this.worker = new Worker(new URL('worker.js', import.meta.url).pathname);
    this.instruments = ['Guitar']

    collection.load = async (id) => {
      console.log('request instrument load', id, collection[id])
      if (!collection[id]) {
        this.message(`Loading ${names[id]}`);
        let instrument = loadInstrument(id);
        collection[id] = 'loading';
        collection[id] = await instrument;
        this.message(`Finished Loading ${names[id]}`)
      }
    }
  }

  async firstUpdated() {

    await super.firstUpdated();
    
    const { editor, save, src } = this;
    let host = this;
    const dom = ace.require("ace/lib/dom");

    const commands = [{
      name: 'toggle',
      exec: function(editor) {
        host.toggle()
      },
      bindKey: { win: 'Alt-Enter', mac: 'Alt-Enter' },
    }, {
      name: 'download',
      exec: download(this),
      bindKey: { win: 'Ctrl-S', mac: 'Ctrl-S' },
    }, {
      name: 'upload',
      exec: upload(this),
      bindKey: { win: 'Ctrl-O', mac: 'Ctrl-O' },
    }, {
      name: 'movelinesup',
      exec: () => this.tempo += 10,
      // multiSelectAction: "forEach",
      // scrollIntoView: "cursor",
      readOnly: true
    }, {
      name: 'movelinesdown',
      exec: () => this.tempo -= 10,
      // multiSelectAction: "forEach",
      // scrollIntoView: "cursor",
      readOnly: true
    }, {
      name: 'gotolineend',
      exec: this.tick('next'),
      multiSelectAction: "forEach",
      // scrollIntoView: "cursor",
      readOnly: true
    }, {
      name: 'gotolinestart',
      exec: this.tick('prev'),
      multiSelectAction: "forEach",
      // scrollIntoView: "cursor",
      readOnly: true
    }, {
      name: "Toggle Fullscreen",
      bindKey: "F11",
      exec: function(editor) {
          var fullScreen = dom.toggleCssClass(document.body, "fullScreen")
          dom.setCssClass(editor.container, "fullScreen", fullScreen)
          editor.setAutoScrollEditorIntoView(!fullScreen)
          editor.resize()
      }
    }]

    //add command to all new editor instances
    ace.require("ace/commands/default_commands").commands.push()

    editor.renderer.setScrollMargin(10, 10);

    function scroll(speed) {
        var top = editor.container.getBoundingClientRect().top
        speed = speed || 10
        if (top > 60 && speed < 500) {
            if (speed > top - speed - 50)
                speed = top - speed - 50
            else
                setTimeout(scroll, 10, speed + 10)
            window.scrollBy(0, speed)
        }
    }

    window.scroll = scroll;
    
    commands.map(({ name, ...command }) => {
      editor.commands.addCommand({
        ...(editor.commands.commands[name] || { name }),
        ...command,
      })
    })
    
	ace.config.setModuleUrl("ace/mode/tab", new URL("mode.js", import.meta.url).pathname);
    editor.session.setMode('ace/mode/tab')
    editor.setOptions({
      firstLineNumber: 0,
      enableSnippets: true,
      scrollPastEnd: 1,
      autoScrollEditorIntoView: true,
    })
    
    let autocomplete = {
      Instrument: names.map((name, i) => ({
        name,
        value: `Instrument: ${name}`,
        meta: families[~~(i/8)],
      }))
    }

    // autocomplete
    ace.require('ace/ext/language_tools').addCompleter({
      getCompletions: (editor, session, pos, prefix, callback) => {
        console.log('getting Completions', {
          editor, session, pos, prefix, callback
        }, autocomplete[prefix])
        return callback(null, autocomplete[prefix] || [])
      },
    });
    
    const debounced = debounce((event, editor) => {
      try {
        this.parsed = false;
        save && saveSession(editor.session, save);
        this.worker.postMessage(this.value)
      } catch(err) { this.message(err) }
    }, 250)
    
    if (src) {
      await this.load(src)
    } else if (save) {
      localStorage.hasOwnProperty(save) && loadSession(editor.session, save)
    }

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

  render(fullscreenIcon) {
    let {
      controls,
      paused,
      instruments,
      left,
      right,
      toggle,
      editor,
      _fullscreen,
    } = this;
    
    paused ?
      (this.timer && clearInterval(this.timer)) :
      (this.timer = setInterval(() => this.editor.execCommand('gotolineend'), 15000 / this._tempo))
      
    // console.log('render', { controls, paused, instruments, _fullscreen })
    return html`
      <style>
      
        /* from https://developers.google.com/web/fundamentals/web-components/customelements#upgrades */
        ace-editor:not(:defined) {
          display: none;
        }
        :host {
          display: block;
          position: relative;
        }
        #controls {
          display: flex;
          justify-content: center;
          // float: right;
          margin: 1em;
          margin-top: -5em;
        }
        #toggle-fullscreen {
          position: absolute;
          top: 1em;
          right: 0;
        }
        mwc-fab {
          margin: 0 1em;
          align-self: center;
        }
        .ace_editor {
            position: relative !important;
            border: 1px solid lightgray;
            margin: auto;
            height: 200px;
            width: 80%;
        }

        .ace_editor.fullScreen {
            height: auto;
            width: auto;
            border: 0;
            margin: 0;
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 10;
        }

        .fullScreen {
            overflow: hidden
        }

        body {
            transform: translateZ(0);
        }
      </style>
      ${super.render()}
      
      ${controls ? html`<div id="controls">
        <mwc-fab id="left" @click="${this.left}" icon="arrow_left" mini></mwc-fab>
        <mwc-fab id="toggle-playback" @click="${() => this.toggle()}" icon="${paused ? 'play_arrow' : 'pause'}"></mwc-fab>
        <mwc-fab id="right" @click="${this.right}" icon="arrow_right" mini></mwc-fab>
        <mwc-fab id="toggle-fullscreen" @click="${() => this.fullscreen = !this.fullscreen}" icon="${_fullscreen ? 'fullscreen_exit' : 'fullscreen'}" mini></mwc-fab>
      </div>` : ""}
    `
  }

  left() {
    this.editor.execCommand('gotolinestart')
  }

  right() {
    this.editor.execCommand('gotolineend')
  }
  
  message(message) {
    this.dispatchEvent(new CustomEvent('message', { detail: { message }}));
  }
  
  async load(src) {
    this.editor.session.setValue(await fetch(src).then(response => response.text()).catch(console.error), 1)
  }

  set meta(meta) {
    const {
      Tempo, tempo,
      Capo, capo,
      Instruments, instruments,
      Instrument, instrument,
    } = meta;
    this.tempo = Tempo || tempo;
    this.capo = Capo || capo;
    this.instruments = Instruments || instruments || [Instrument] || [instrument]

    this._meta = meta;
  }

  get meta() {
    return this._meta;
  }

  set tempo(tempo) {
    this._tempo = (typeof tempo === "number" && Number.isInteger(tempo)) ? tempo : 120;
  }

  get tempo() {
    return this._tempo
  }

  set capo(capo) {
    this._capo = (typeof capo === "number" && Number.isInteger(capo)) ? capo : 0;
  }

  get capo() {
    return this._capo;
  }

  set instruments(instruments) {
    console.log('set instruments', { instruments })
    this._instruments = instruments.map(instrument => {
      instrument = aliases[instrument] ? aliases[instrument] : instrument;
      if (typeof instrument === "number" && Number.isInteger(instrument) && instrument > -1 && instrument < 128) {
        instrument = instrument
      } else if (typeof instrument === "string" && names.includes(instrument)) {
        instrument = names.indexOf(instrument)
      } else if (typeof instrument === "string" && families.includes(instrument)) {
        instrument = 8 * families.indexOf(instrument)
      }
      return instrument;
    })

    console.log('set instruments', this._instruments)
  }

  get instruments() {
    return this._instruments
  }

  tick(direction = 'next') {
    const host = this;
    return function (editor, { count, ...args }) {
      let { row, column } = editor.getCursorPosition();
      let { parsed, instruments, tuning, tempo, capo } = host;
      console.log('tick', direction, {
        row, column, parsed, instruments, tuning, tempo, capo
      })
      if (parsed) {
        let line = parsed[row];
        if (line && line.columns && line.columns[column]) {

          let {
          	value,
            open,
            instrument,
            siblings,
            nextRow,
            previousRow,
            columns,
          } = line;

          console.log('line', {
            value, open, instrument, siblings, nextRow, previousRow, columns
          })
          
          let {
          	play,
          	position,
          	further,
          	pause,
          	type,
          } = columns[column][direction]

//           console.log('ticks', {
//             direction
//           }, {
//             row,
//             column,
//           }, {
//             Instrument,
//             Instruments,
//             Tuning,
//             Tempo,
//             Capo,
//           }, {
//           	open,
//           	instrument,
//           	siblings,
//           	nextRow,
//           	previousRow,
//           	columns,
//           }, {
//             play,
//             position, 
//             further,
//             type,
//           });
          
    	  if (row === position[0] && column === position[1]) {
    	  	host.paused = true;
    	  	further = false;;
    	  }
          editor.navigateTo(...position);
          // editor.renderer.scrollToRow(Math.max(position.row - 10, 0));
          editor.renderer.scrollCursorIntoView(undefined, 100 / editor.renderer.$size.scrollerHeight)
          play && Number.isInteger(play.note) && collection.play({
            note: play.note + open + capo,
            duration: play.duration ? (play.duration*16/tempo) : undefined,
          }, instruments[instrument] || instruments[0]);
          console.log('Player', {
            collection,
            instruments,
            instrument,
          })
          pause && (host.paused = true);
          further && this.exec(editor, { count: count + 1, ...args });
        }
      } else {
        host.message('Parsing Tab...')
      }
    }
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