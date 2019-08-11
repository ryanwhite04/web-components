import {
  LitElement,
  html
} from './dist/modules.js';

export default class StopWatch extends LitElement {

  static get properties() {
    return {
      disabled: {
        type: Boolean,
        reflect: true,
      },
      interval: {
        type: Number,
        reflect: true,
      },
      time: {
        type: Number,
        reflect: true,
      },
      paused: {
        type: Boolean,
        reflect: true,
      },
    }
  }

  constructor({
    paused = false,
    interval = 100,
  } = {}) {
    super();
    this.interval = interval;
    this.paused = paused;
  }

  firstUpdated(changedProperties) {
    this.reset();
    this.paused || this.start();
  }

  reset() {
    this.time = 0;
    this.origin = Date.now();
    this.dispatchEvent(new CustomEvent('stop'))
  }

  start() {
    if (this.paused) {
       console.warn('Start Called whilst stopwatch running')
    }
    this.paused = false;
    this.origin = Date.now() - this.time;
    this.tick();
    this.dispatchEvent(new CustomEvent('start'))
  }

  stop() {
    this.paused = true;
    this.dispatchEvent(new CustomEvent('stop'))
  }

  tick() {
    if (!this.paused) {
      this.time = Date.now() - this.origin;
      setTimeout(this.tick.bind(this), this.interval)
    }
  }

  click(e) { this.disabled || (this.paused ? this.start() : this.stop()) }

  get label() {
    return `${Math.floor(this.time/1000).toString()}.${(this.time%1000).toString()[0].padStart(1, "0")}`;
  }

  render() {
    const {
      time,
      raised,
      paused,
      disabled,
      click,
      label,
    } = this;
    const icon = paused ? 'hourglass_empty' : 'hourglass_full';
    return html`<mwc-button
      ?raised=${raised}
      ?disabled=${disabled}
      icon=${icon}
      @click=${click}
      >
      ${label}
    </mwc-button>`;
  }

}

customElements.define('stop-watch', StopWatch);
