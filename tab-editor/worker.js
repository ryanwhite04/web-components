// importScripts('parse.js', 'yaml.js');

// const yaml = (value, onWarning) => jsyaml.safeLoad(value, { onWarning, json: true })

// self.addEventListener('message', ({ data }) => self.postMessage({
//   parsed: parse(data.split('\n')),
//   meta: yaml(data.split(/^---\s*$/m)[1]),
// }), false);

import parse from "./parse.js";
import toml from "./toml.js";
import "./yaml.js";
// import * as yaml from "https://unpkg.com/yaml@1.7.0/browser/dist/index.js?module";
// import yaml from "https://unpkg.com/yaml-with-import@1.0.6/src/yaml-with-import.js?module";
// const yaml = (value, onWarning) => jsyaml.safeLoad(value, { onWarning, json: true })

self.addEventListener('message', ({ data }) => self.postMessage({
  parsed: parse(data),
//   meta: yaml(data.split(/^---\s*$/m)[1]),
  meta: toml.parse(data.split(/^\+\+\+\s*$/m)[1] || ""),
}), false);