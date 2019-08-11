const { getPackageInformation } = require('./.pnp.js');

function find(name) {
  const {
    packageLocation: location,
    packageDependencies: dependencies,
  } = getPackageInformation({ name: null, reference: null });
  
  const reference = dependencies.get(name);

  return name ?
    getPackageInformation({ name, reference }) :
    { location, dependencies };
}

console.log(find(process.argv[2]))