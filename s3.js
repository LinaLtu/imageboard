const knox = require('knox');
const fs = require('fs');

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env;
} else {
    secrets = require('./secrets');
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'cactusimages'
});

function upload(req, res, next) {
    if (!req.file) {
        res.sendStatus(500);
        return;
    }
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        if (wasSuccessful) {
            fs.unlink(req.file.path, () => {});
            next();
        } else {
            console.log('Error in s3Response:', s3Response.statusCode);
            res.sendStatus(500);
        }
    });
}

module.exports.upload = upload;
