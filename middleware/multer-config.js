const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration du stockage des fichiers temporaires
const storage = multer.memoryStorage(); // Stocke les fichiers dans la mémoire temporaire

const upload = multer({ storage: storage }).single('image');

// Middleware pour redimensionner et optimiser l'image
const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const filename = `${Date.now()}_${req.file.originalname.split(' ').join('_')}`;
        const outputPath = path.join('images', filename);

        // Utilisation de sharp pour redimensionner et optimiser l'image
        await sharp(req.file.buffer)
            .resize(800) // Redimensionner à une largeur maximale de 800px (ajustez selon vos besoins)
            .toFormat('jpeg', { quality: 80 }) // Convertir en JPEG avec une qualité de 80%
            .toFile(outputPath);

        req.file.filename = filename;
        req.file.path = outputPath;

        next();
    } catch (error) {
        console.error('Erreur lors du traitement de l\'image :', error);
        res.status(500).json({ error: 'Erreur lors du traitement de l\'image.' });
    }
};

module.exports = { upload, processImage };