const fs = require("fs");

var jsonManager = {};
const errorLabel = "MODULO JsonManager: ";

/** It just reads a json file.. */
jsonManager.readFile = function(path) {
    try {
        let f = fs.readFileSync(path);
        return JSON.parse(f);
        
    } catch (error) {
        console.log(errorLabel + error);
        return error;
    }
}

/** It just creates a json file.. */
jsonManager.createFile = function(object, fileName) {
    try {
        let obj = JSON.stringify(object);
        fs.writeFileSync(fileName, obj);
        
    } catch (error) {
        console.log(errorLabel + error);
        return error;
    }
}

module.exports = jsonManager;

