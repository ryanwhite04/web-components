const {
    VERSIONS,
    topLevel,
    getPackageInformation,
    findPackageLocator,
    resolveToUnqualified,
    resolveUnqualified,
    resolveRequest,
    setup,
} = require("pnpapi");

function getInformation(request, issuer) {
    return getPackageInformation(findPackageLocator(resolveRequest(request, issuer)))
}

console.log([
    getInformation("", "./mine-sweeper/"),
    getInformation("emoji-rain", "./mine-sweeper/"),
]);