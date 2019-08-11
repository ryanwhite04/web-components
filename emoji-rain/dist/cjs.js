'use strict';

var litElement = require('@polymer/lit-element');

/*
The MIT License (MIT)

Copyright (c) 2015 Monica Dinculescu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
*/

/**
* Unborks the canvas pixel ratio on retina screens.
* From http://www.html5rocks.com/en/tutorials/canvas/hidpi/
*/
function scaleCanvas(canvas) {
    const context = canvas.getContext('2d');
    // Finally query the various pixel ratios.
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    const ratio = devicePixelRatio / backingStoreRatio;
    
    // Upscale the canvas if the two ratios don't match.
    if (devicePixelRatio !== backingStoreRatio) {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      canvas.width = oldWidth * ratio;
      canvas.height = oldHeight * ratio;
      canvas.style.width = oldWidth + 'px';
      canvas.style.height = oldHeight + 'px';

      // Now scale the context to counter the fact that we've manually scaled our canvas element.
      context.scale(ratio, ratio);
    }
}

/**
* Gets you an obscure ready-to-be-used emoji object with a whole bunch of
* undocumented properties because your faithful author was too lazy
* to create a separate class for this. Leaving it public just in case
* you want to use this (why do you?) <3
*/
function Drop({
  y = Math.random(),
  x = Math.random(),
  speed = 10,
  opacity = 0.002,
  emojis = [],
  size = 10,
  power = 20,
} = {}) {
    
    return {
        emoji: emojis[Math.floor((Math.random() * emojis.length))],
        x,
        y: Math.pow(y, power),
        speed: Math.ceil(Math.random() * speed),
        opacity: 1,
        opacitySpeed: opacity * (Math.random() * 2 + 1),
        size: Math.ceil(Math.random() * size),
    };
}

class EmojiRain extends litElement.LitElement {

  static get properties() {
    return {
      speed: { type: Number, reflect: true },
      volume: { type: Number, reflect: true },
      power: { type: Number, reflect: true },
      size: { type: Number, reflect: true },
      paused: { type: Boolean, reflect: true },
      emojis: { type: {
        fromAttribute: value => value.split(","),
        toAttribute: value => value.join(","),
      }, reflect: true },
    }
  }

  constructor() {
    super();
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext('2d');
    this.speed = 10;
    this.volume = 250;
    this.power = 3;
    this.size = 30;
    this.paused = false;
    this.emojis = [
      "⌚","⌛","⏩","⏪","⏫","⏬","⏰","⏳","⚪","⚫","⚽","⚾",
      "⛄","⛅","⛎","⛔","⛪","⛲","⛳","⛵","⛺","⛽","✅","✊",
      "✋","✨","❌","❎","❓","❔","❕","❗","➕","➖","➗","➰",
      "⬛","⬜","⭐","⭕","🀄","🃏","🆎","🆑","🆒","🆓","🆔","🆕",
      "🆖","🆗","🆘","🆙","🆚","🈁","🈚","🈯","🈲","🈳","🈴","🈵",
      "🈶","🈸","🈹","🈺","🉐","🉑","🌀","🌁","🌂","🌃","🌄","🌅",
      "🌆","🌇","🌈","🌉","🌊","🌋","🌌","🌏","🌑","🌓","🌔","🌕",
      "🌙","🌛","🌟","🌠","🌰","🌱","🌴","🌵","🌷","🌸","🌹","🌺",
      "🌻","🌼","🌽","🌾","🌿","🍀","🍁","🍂","🍃","🍄","🍅","🍆",
      "🍇","🍈","🍉","🍊","🍌","🍍","🍎","🍏","🍑","🍒","🍓","🍔",
      "🍕","🍖","🍗","🍘","🍙","🍚","🍛","🍜","🍝","🍞","🍟","🍠",
      "🍡","🍢","🍣","🍤","🍥","🍦","🍧","🍨","🍩","🍪","🍫","🍬",
      "🍭","🍮","🍯","🍰","🍱","🍲","🍳","🍴","🍵","🍶","🍷","🍸",
      "🍹","🍺","🍻","🎀","🎁","🎂","🎃","🎄","🎅","🎆","🎇","🎈",
      "🎉","🎊","🎋","🎌","🎍","🎎","🎏","🎐","🎑","🎒","🎓","🎠",
      "🎡","🎢","🎣","🎤","🎥","🎦","🎧","🎨","🎩","🎪","🎫","🎬",
      "🎭","🎮","🎯","🎰","🎱","🎲","🎳","🎴","🎵","🎶","🎷","🎸",
      "🎹","🎺","🎻","🎼","🎽","🎾","🎿","🏀","🏁","🏂","🏃","🏄",
      "🏆","🏈","🏊","🏠","🏡","🏢","🏣","🏥","🏦","🏧","🏨","🏩",
      "🏪","🏫","🏬","🏭","🏮","🏯","🏰","🐌","🐍","🐎","🐑","🐒",
      "🐔","🐗","🐘","🐙","🐚","🐛","🐜","🐝","🐞","🐟","🐠","🐡",
      "🐢","🐣","🐤","🐥","🐦","🐧","🐨","🐩","🐫","🐬","🐭","🐮",
      "🐯","🐰","🐱","🐲","🐳","🐴","🐵","🐶","🐷","🐸","🐹","🐺",
      "🐻","🐼","🐽","🐾","👀","👂","👃","👄","👅","👆","👇","👈",
      "👉","👊","👋","👌","👍","👎","👏","👐","👑","👒","👓","👔",
      "👕","👖","👗","👘","👙","👚","👛","👜","👝","👞","👟","👠",
      "👡","👢","👣","👤","👦","👧","👨","👩","👪","👫","👮","👯",
      "👰","👱","👲","👳","👴","👵","👶","👷","👸","👹","👺","👻",
      "👼","👽","👾","👿","💀","💁","💂","💃","💄","💅","💆","💇",
      "💈","💉","💊","💋","💌","💍","💎","💏","💐","💑","💒","💓",
      "💔","💕","💖","💗","💘","💙","💚","💛","💜","💝","💞","💟",
      "💠","💡","💢","💣","💤","💥","💦","💧","💨","💩","💪","💫",
      "💬","💮","💯","💰","💱","💲","💳","💴","💵","💸","💹","💺",
      "💻","💼","💽","💾","💿","📀","📁","📂","📃","📄","📅","📆",
      "📇","📈","📉","📊","📋","📌","📍","📎","📏","📐","📑","📒",
      "📓","📔","📕","📖","📗","📘","📙","📚","📛","📜","📝","📞",
      "📟","📠","📡","📢","📣","📤","📥","📦","📧","📨","📩","📪",
      "📫","📮","📰","📱","📲","📳","📴","📶","📷","📹","📺","📻",
      "📼","🔃","🔊","🔋","🔌","🔍","🔎","🔏","🔐","🔑","🔒","🔓",
      "🔔","🔖","🔗","🔘","🔙","🔚","🔛","🔜","🔝","🔞","🔟","🔠",
      "🔡","🔢","🔣","🔤","🔥","🔦","🔧","🔨","🔩","🔪","🔫","🔮",
      "🔯","🔰","🔱","🔲","🔳","🔴","🔵","🔶","🔷","🔸","🔹","🔺",
      "🔻","🔼","🔽","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘",
      "🕙","🕚","🕛","🗻","🗼","🗽","🗾","🗿","😁","😂","😃","😄",
      "😅","😆","😉","😊","😋","😌","😍","😏","😒","😓","😔","😖",
      "😘","😚","😜","😝","😞","😠","😡","😢","😣","😤","😥","😨",
      "😩","😪","😫","😭","😰","😱","😲","😳","😵","😷","😸","😹",
      "😺","😻","😼","😽","😾","😿","🙀","🙅","🙆","🙇","🙈","🙉",
      "🙊","🙋","🙌","🙍","🙎","🙏","🚀","🚃","🚄","🚅","🚇","🚉",
      "🚌","🚏","🚑","🚒","🚓","🚕","🚗","🚙","🚚","🚢","🚤","🚥",
      "🚧","🚨","🚩","🚪","🚫","🚬","🚭","🚲","🚶","🚹","🚺","🚻",
      "🚼","🚽","🚾","🛀"
    ];
//     window.addEventListener('resize', e => setTimeout(this.resizeWindow.bind(this), 50), false);
    const myObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
//           console.log('width', entry.contentRect.width);
//           console.log('height', entry.contentRect.height);
      });
    });
    myObserver.observe(this);
  }

  firstUpdated(changedProperties) {
    this.paused || this.start();
  }

  generate() {
    this.drops = [...new Array(this.volume)].map(() => new Drop(this));
  }

  set volume(volume) {
    this._volume = volume;
    this.generate();
  }

  get volume() {
    return this._volume;
  }

  set emojis(emojis) {
    this._emojis = emojis;
    this.generate();
  }

  get emojis() {
    return this._emojis;
  }
  
  set paused(paused) {
    paused ? this.stop() : this.start();
    this._paused = paused;
  }

  get paused() {
    return this._paused;
  }

  start() {
    scaleCanvas(this.canvas);
    this.resizeWindow();
    this.rain();
    this.dispatchEvent(new CustomEvent('start'));
  }

  stop() {
    clearTimeout(this.timeout);
    window.cancelAnimationFrame(this.animationFrame);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dispatchEvent(new CustomEvent('stop'));
  }

  rain() {
    this.timeout = setTimeout(() => {
      this.animationFrame = window.requestAnimationFrame(this.rain.bind(this));
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drops.forEach(this.paint.bind(this));
    }, 1000 / 60);
  }

  /**
  * Draws one emoji on the canvas.
  */
  paint(drop, i, drops) {
      const { canvas } = this;
      const context = canvas.getContext('2d');
      const x = Math.ceil(drop.x*canvas.width);
      const y = Math.ceil(drop.y*canvas.width);

      (y >= canvas.height || drop.opacity < 0.1) ?
        (drops[i] = new Drop(this)) :
        Object.assign(drop, {
          y: drop.y + (drop.speed / canvas.height),
          opacity: drop.opacity - drop.opacitySpeed,
        });

      context.globalAlpha = drop.opacity;
      context.font = `${drop.size}px serif`;
      context.fillText(drop.emoji, x, y);
      context.restore();

      return drops;
  }


  toggle(e) {
      this.paused = !this.paused;
  }

  updated(changedProperties) {
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.width  = this.offsetWidth;
    this.canvas.height = this.offsetHeight;
  }

  /**
  * Hopefully updates the canvas size when the window resizes.
  */
  resizeWindow(canvas) {
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.width  = this.offsetWidth;
      this.canvas.height = this.offsetHeight;
  }

  render() {
    const style = `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      canvas {
        position: absolute;
        display: block;
        width: 100%;
        height: 100%;
        background: transparent;
      }
      ::slotted(*) {
        position: relative;
      }
    `;
    return litElement.html`
    <style>${style}</style>
    ${this.canvas}
    <slot></slot>
    `;
  }

}

customElements.define('emoji-rain', EmojiRain);

module.exports = EmojiRain;
