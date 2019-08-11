
# Files

- ### demo.html

  ```html
  <!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <script src="custom-element.js"></script>
      <custom-element></custom-element>
    </body>
  </html>
  ```

- ### custom-element.js
  Defines CustomElement as custom-element
  normally this would also include the element defintion, but I want to allow someone to import the class separately and define it with another name if they choose.
  ```js
  // custom-element.js

  import CustomElement from './index.js';
  customElements.define('custom-element', CustomElement);
  ```

- ### index.js
  ```js
  // index.js

  import {
    a,
    b,
    c
  }'./modules.bundled.js';

  export default class CustomElement{

  }
  ```

- ### modules.js
  This is where dependencies are added to be used with the element
  ```js
  import 'a'; // imports @polymer/lit-element
  export { b, c } from 'b.c'
  export { d } from 'd'
  ```

- ### modules.bundles.js
  built with rollup.
  It's just modules.js with all dependencies inlined
  ```js

  // @polymer/lit-element
  // contents of this file and all imports inlined

  // a
  class a extends LitElement {

  }

  // b.c
  export class b {
    ...
  }

  export c
  ```

- ### unpkg.js
  ```js

  import a from 'https://unpkg.com/a?module';
  import { b, c } from 'https://unpkg.com/b.c?module';
  import d from 'https://unpkg.com/d?module';

  export default class CustomElement

  ```

