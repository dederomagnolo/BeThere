const fs = require('fs');
const path = require('path');

module.exports = app => { // verificar todos os arquivos da pasta controllers para importar
    fs
        .readdirSync(__dirname)
        .filter(file => ((file.indexOf('.')) !== 0 && (file !== 'index.js')))
        .forEach(file => require(path.resolve(__dirname, file))(app));
}