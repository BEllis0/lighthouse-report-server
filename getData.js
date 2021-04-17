const Axios = require('axios');
require('dotenv').config();

// return promise with data
module.exports.getData = (url, category = 'performance') => {
    return new Promise((resolve, reject) => {
        let request = Axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&category=${category}&key=${process.env.pageSpeedKey}`)
        .then(response => {
            resolve(response.data);
        })
        .catch(err => {
            reject(err);
        });
    });
}