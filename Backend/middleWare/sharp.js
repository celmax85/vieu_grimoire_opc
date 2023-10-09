const sharp = require('sharp');
const fs = require('fs');

const optimizeImage = async (req, res, next) => {
    try {
        if (req.file) {
            const inputImagePath = req.file.path;
            const outputImagePath = `uploads/opt_${req.file.filename}`;

            await sharp(inputImagePath)
                .resize(200, 200)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(outputImagePath);

            fs.unlink(inputImagePath, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Fichier d'origine supprimé : ${inputImagePath}`);
                }
            });
        }
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error optimizing image');
    }
}

module.exports = { optimizeImage };