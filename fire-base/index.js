import {
  LitElement,
  html,
  firebase,
} from './dist/modules.js';

console.log(import.meta, import.meta.resolve)
class FireBase extends LitElement {
  static get properties() {
    return {
      apiKey: {
        type: String,
        attribute: 'api-key',
      },
      projectId: {
        type: String,
        attribute: 'project-id',
      },
      messagingSenderId: {
        type: String,
        attribute: 'messaging-sender-id',
      },
    }
  }

  constructor() {
    super();
    firebase.initializeApp({
      apiKey: this.key,
      authDomain: this.authDomain,
      databaseURL: this.databaseURL,
      projectId: this.projectId,
      storageBucket: this.storageBucket,
      messagingSenderId: this.messagingSenderId,
    })
  }

  get authDomain() {
    return `${this.projectId}.firebaseapp.com`;
  }

  get storageBucket() {
    return `${this.projectId}.appspot.com`;
  }

  get databaseURL() {
    return `https://${this.projectId}.firebaseio.com`;
  }

  render() {
    return html`<div>
      
    </div>`
  }

}

customElements.define('fire-base', FireBase);