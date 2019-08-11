const fs = require('fs').promises

function write(dir) {
  return async ({ instrument, content }) => {
    await fs.writeFile(`${dir}/${instrument}.js`, content).catch(console.error)
  }
}

async function build(dir) {
  const files = await fs.readdir(dir).catch(console.error)
  
  files
    .filter(file => file.endsWith('.json'))
    .map(file => file.split('.json')[0])
    .map(instrument => ({
      instrument,
      json: require(`./${dir}/${instrument}.json`)
    }))
    .map(({ json, instrument }) => ({
      instrument,
      content: `export default ${JSON.stringify(json, null, 2)}`
    }))
    .map(write(dir))
}

build('dist')
