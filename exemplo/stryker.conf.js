/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
    mutate: [
        'exemplo/capturar.js',
        'exemplo/abrirLoja.js',
        'exemplo/comprarItem.js',
        'exemplo/recuperarSave.js',
        'exemplo/usarPocao.js'
    ],
    packageManager: 'npm',
    reporters: ['html', 'dashboard', 'clear-text'],
    testRunner: 'command',
    commandRunner: {
        command: 'mocha --config ./exemplo/.mocharc.js'
    },
    mochaOptions: {
        config: './exemplo/.mocharc.js'
    }
}