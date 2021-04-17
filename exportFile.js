const { Parser } = require('json2csv');
const fs = require('fs');

/*
Export function for local environment
Doesn't work for hosted server
Writes a local file, hosted server requires response object
*/

module.exports.exportFile = (exportData, fileName = "unnamed.csv", options = {}) => {
    const json2csvParser = options.fields ? new Parser({fields: options.fields}) : new Parser();
    // if meta info is provided in options, append to top of file
    const csv = options.metaInfo ? options.metaInfo + json2csvParser.parse(exportData) : json2csvParser.parse(exportData);
    console.log(csv)
    fs.writeFile(fileName, csv, function(err) {
        if (err) throw err;
        console.log('file saved: ', fileName);
    });
};