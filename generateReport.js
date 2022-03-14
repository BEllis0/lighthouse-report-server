require('dotenv').config();

const { getData } = require('./getData.js');

const XLSX = require('xlsx');

 

 

module.exports.generateReport = async (url) => {

    // ================================
    // get data
    // ================================

    let data;

    // get data
    await getData(url)
        .then(response => {
            data = response;
        })
        .catch(err => {
            console.log("Error getting data: ", err);
            return err;
        });

    // ================================ 
    // var references
    // ================================

    const categories = data.lighthouseResult.audits;

    // do not contain array of objects

    const blockingTime = categories["total-blocking-time"];
    const estInputLatency = categories["estimated-input-latency"];
    const totalByteWeight = categories["total-byte-weight"];

    // NEEDS TESTING

    const metrics = categories["metrics"];
    const bootupTime = categories["bootup-time"];
    const diagnostics = categories["diagnostics"];
    const legacyJs = categories["legacy-javascript"];
    const thirdPartyFacades = categories["third-party-facades"];
    const responsiveImages = categories["uses-responsive-images"];
    const criticalRequestChains = categories["critical-request-chains"];
    const noDocWrite = categories["no-document-write"];
    const largestContentPaint = categories["largest-contentful-paint"];
    const maxPotentialFid = categories["max-potential-fid"];
    const firstContentfulPaint = categories["first-contentful-paint"];
    const webpImages = categories["uses-webp-images"];
    const firstMeaningfulPaint = categories["first-meaningful-paint"];

    const categoryObj = {
        "Unused javaScript": categories["unused-javascript"],
        "Unminified javaScript": categories["unminified-javascript"],
        "Render-Blocking Resources": categories["render-blocking-resources"],
        "Unminified CSS": categories["unminified-css"],
        "Unused CSS Rules": categories["unused-css-rules"],
        "Duplicated javaScript": categories["duplicated-javascript"],
        "Third Party Summary": categories["third-party-summary"],
        "Largest Paint Element": categories["largest-contentful-paint-element"],
        "Unsized Images": categories["unsized-images"],
        "Network Round Trip Time": categories["network-rtt"],
        "Long Cache TTL": categories["uses-long-cache-ttl"],
        "DOM Size": categories["dom-size"],
        "Long Tasks": categories["long-tasks"],
        "Passive Event Listeners": categories["uses-passive-event-listeners"],
        "Off Screen Images": categories["offscreen-images"],
        "Redirects": categories["redirects"],
        "Resource Summary": categories["resource-summary"],
        "Non-Composited Animations": categories["non-composited-animations"],
        "Text Compression": categories["uses-text-compression"],
        "Font Display": categories["font-display"],
        "Optimized Images": categories["uses-optimized-images"],
        "Network Requests": categories["network-requests"],
        "Screenshots": categories["screenshot-thumbnails"],
        "User Timings": categories["user-timings"],
        "Layout Shift Elements": categories["layout-shift-elements"],
        "Cumulative Layout Shift": categories["cumulative-layout-shift"],
        "Server Response Time": categories["server-response-time"],
        "Rel PreConnect": categories["uses-rel-preconnect"],
        "Main ThreadWork Tasks": categories["main-thread-tasks"],
        "Main ThreadWork Breakdown": categories["mainthread-work-breakdown"],
    };

    // ================================
    // functions to clean data, create and build workbooks
    // ================================

    const cleanData = async (dataToClean) => {
        if (dataToClean.details.items.length > 0 && dataToClean.details.items[0].hasOwnProperty("wastedPercent")) {
            dataToClean.details.items.forEach((current, i, arr) => {
                // round percentage, add %
                current["wastedPercent"] = `${Math.ceil(current["wastedPercent"] * 100) / 100}%`
            });

        }

        if (dataToClean.details.items.length > 0 && dataToClean.details.items[0].hasOwnProperty("url")) {
            dataToClean.details.items.forEach((current, i, arr) => {
                // // set a new property on the items
                let substring = current.url.split('.')[1];
                current["Source"] = substring;
            });
        }

        if (dataToClean.details.items.length > 0 && dataToClean.id === "network-requests") {
            dataToClean.details.items.forEach((current, i, arr) => {
                // set total time column and index
                current["Total Time"] = current.endTime - current.startTime;
                current["index"] = i+1;
            });
        }
    };

    const createWorkbook = () => {
        console.log("Creating workbook");
        return XLSX.utils.book_new();
    };

    // add new worksheet
    const createWorkSheet = (category, options) => {

        return XLSX.utils.json_to_sheet(category, {
            skipHeader: options.skipHeader !== undefined ? options.skipHeader : true,
            origin: options.origin !== undefined ? options.origin : "A1"
        });
    };

    const appendWorkSheet = (workbook, sheet, sheetName = "unnamed sheet") => {
        return XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    };

    // append row(s) to a worksheet
    // Assumes skip headers and origin at A1 unless specified in options obj

    const appendrow = (workbook, sheetName, data, options) => {

        return XLSX.utils.sheet_add_json(workbook.Sheets[sheetName], data, {
            skipHeader: options.skipHeader !== undefined ? options.skipHeader : true,
            origin: options.origin !== undefined ? options.origin : "A1"
        });
    };

    // ================================
    // cleaning data, creating workbook & adding sheets
    // ================================

    let wb = createWorkbook();

    for (let [key,data] of Object.entries(categoryObj)) {
        // clean

        // console.log("Cleaning data")
        cleanData(data);
        // build workbook, sheets and add rows for meta info
        let ws = createWorkSheet(data.details.items, {origin: "A6", skipHeader: false});
        appendWorkSheet(wb, ws, key);

        appendrow(wb, key, [
            {url: url}
        ], {origin: "A1"});
        appendrow(wb, key, [
            {id: data.id}
        ], {origin: "A2"});
        appendrow(wb, key, [
            {title: data.title}
        ], {origin: "A3"});
        appendrow(wb, key, [
            {description: data.description}
        ], {origin: "A4"});
    }

    // ================================
    // return workbook
    // ================================

    return wb;
};