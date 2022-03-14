const verifyUrlParam = (req, res, next) => {
    // if url is not found, resolve
    if(!req.query.url) return res.status(400).json({message:"url query parameter not found."});
    
    // resolve middleware
    return next();
};

module.exports = verifyUrlParam;