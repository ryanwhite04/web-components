importScripts('parse.js', 'yaml.js');

const yaml = (value, onWarning) => jsyaml.safeLoad(value, { onWarning, json: true })

self.addEventListener('message', ({ data }) => self.postMessage({
  parsed: parse(data.split('\n')),
  meta: yaml(data.split(/^---\s*$/m)[1]),
}), false);