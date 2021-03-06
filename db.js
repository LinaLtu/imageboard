const spicedPg = require('spiced-pg');
const config = require('./config');

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/images`
);

function getImages(offset) {
    const q =
        `SELECT * FROM images ORDER BY created_at DESC LIMIT 6 OFFSET ` +
        offset;

    return db
        .query(q)
        .then(results => {
            let images = results.rows;
            images.forEach(function(image) {
                let url = config.s3Url + image.image;
                image.image = url;
            });
            return images;
        })
        .catch(err => console.log(err));
}

function getImageById(id) {
    const q = `SELECT * FROM images WHERE id = $1`;
    const param = [id];

    return db
        .query(q, param)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => console.log(err));
}

function insertImageIntoDB(image, username, title, description) {
    const q = `INSERT INTO images (image, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *`;
    const params = [image, username, title, description];

    return db
        .query(q, params)
        .then(results => {
            let images = results.rows;
            images.forEach(function(image) {
                let url = config.s3Url + image.image;
                image.image = url;
            });
            return images[0];
        })
        .catch(err => console.log(err));
}

function insertComment(imageId, username, comment) {
    const q = `INSERT INTO comments (image_id, username, comment) VALUES ($1, $2, $3) RETURNING *`;
    const params = [imageId, username, comment];

    return db
        .query(q, params)
        .then(comments => {
            console.log('A comment has been inserted', comments);
        })
        .catch(err => console.log(err));
}

function getComments(imageId) {
    const q = `SELECT * FROM comments WHERE image_id = $1  ORDER BY created_at DESC`;
    const param = [imageId];

    return db
        .query(q, param)
        .then(results => {
            let comments = results.rows;
            return comments;
        })
        .catch(err => console.log(err));
}

module.exports.getImages = getImages;
module.exports.insertImageIntoDB = insertImageIntoDB;
module.exports.getImageById = getImageById;
module.exports.insertComment = insertComment;
module.exports.getComments = getComments;
