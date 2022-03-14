const { generateReport } = require('../generateReport.js');
const XLSX = require('xlsx');
const fs = require('fs');
var moment = require('moment');

let cache = {
    // format - URL: {DATA, REFRESH_DATE_UNIX
    // urls are cached for 1 day
};

// helper function to determine if cache needs to be refreshed (returns true if so)
const requireRefresh = (params) => {
    let currentTime = moment().unix();
    let refreshTime;
    try {
        refreshTime = cache[params.url]['refreshDateUnix'];
        return currentTime > refreshTime ? true : false;
    } catch(err) {
        console.log("Error in requireRefresh function", err);
    }
};

module.exports = {
    all_metrics: {
        page: async (req, res) => {
            console.log('url requested: ', req.query.url);
            // if url is not found, resolve
            if(!req.query.url) return res.status(400).json({message:"url query parameter not found."});
            
            try {
                let reportData;

                // use cached data if found and doesn't need refresh

                if (cache.hasOwnProperty(req.query.url) && !requireRefresh({url:req.query.url})) {

                    console.log("Serving resource from cache");

                    reportData = cache[req.query.url].data;

                } else {

                    // if not cached, generate data

                    reportData = await generateReport(req.query.url);

                    console.log("Report created, saving to cache");

                    //save to cache

                    cache[req.query.url] = {

                        data: reportData,

                        refreshDateUnix: moment().add(1, 'days').unix()

                    };

                }

                // optional name or default

                let filename = req.body.saveName !== undefined ? `${req.body.saveName}.xlsx` : `lighthouse_problem_files_${moment().format('YYYY-MM-DD')}.xlsx`;

               

                // Writing file to server

                XLSX.writeFile(reportData, filename);

   

                // set headers

                res.status(201);

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

                res.setHeader('Content-Disposition', 'attachment; filename=' + filename);

               

                // return file in response

                const stream = fs.createReadStream(filename);

                stream.pipe(res);

   

            } catch(err) {

                console.log("Error in controller while generating report", err);

                res.status(err.code).json({"error":err.message,message:"Error creating report in controller"});

            }

           

        }

    },

    network_calls: {

        all: (req, res) => {

           

        },

    },

};