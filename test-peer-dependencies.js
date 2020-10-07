const { exception } = require('console');
const fs = require('fs');

let dependencyBundlesConfig = {};
let dependencyExternalsConfig = {};
let packageConfig = {};

function readDependencyBundles() {
    // read the package.json to determine current 'bundle' peer dependencies
    fs.readFile('dependency-bundles.json', 'utf8', (err, data) => {
        if (err) {
            throw `Unable to read 'dependency.bundles.json'.  Error: ${err}`;
        }

        dependencyBundlesConfig = JSON.parse(data);
        readDependencyExternals();
    });
};

function readDependencyExternals() {
    // read the package.json to determine current 'external' peer dependencies
    fs.readFile('dependency-externals.json', 'utf8', (err, data) => {
        if (err) {
            throw `Unable to read 'dependency.externals.json'.  Error: ${err}`;
        }

        dependencyExternalsConfig = JSON.parse(data);
        readPackage();
    })
};

function readPackage() {
    // read the package.json to determine current 'bundle' peer dependencies
    fs.readFile('package.json', 'utf8', (err, data) => {
        if (err) {
            throw `Unable to read 'package.json'.  Error: ${err}`;
        }

        packageConfig = JSON.parse(data);
        validateDependencies();
    });
};

function validateDependencies() {
    const dependencies = packageConfig.dependencies;
    const dependenciesNames = Object.keys(dependencies);

    const dependenciesNeedingConfiguration = [];

    for (let i = 0; i < dependenciesNames.length; i++) {
        const dependencyName = dependenciesNames[i];

        // ignore definitely typed dependencies
        if (dependencyName[0] === "@") {
            continue;
        }

        // dependency not being bundled
        if (dependencyExternalsConfig.externals[dependencyName]) {
            continue;
        }

        // depepdency is being bundled
        if (dependencyBundlesConfig.bundles.indexOf(dependencyName) > -1) {
            continue;
        }

        dependenciesNeedingConfiguration.push(dependencyName);
    }

    if (dependenciesNeedingConfiguration.length > 0) {
        const error = [
            "One or more package.json dependencies are not configured to be 'external' or 'bundled'. ",
            `Please configure these dependencies (${dependenciesNeedingConfiguration.join(", ")})`,
            "in either 'dependency-bundles.json' or 'dependency-externals.json'."
        ];
        throw error.join(" ");
    }
}

// start the process by reading the first configuration file
readDependencyBundles();