const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const auth = require('../middleware/auth');
const { upload, processImage } = require('../middleware/multer-config');  // Middleware multer et sharp


// Route pour créer un livre avec optimisation de l'image
router.post('/', auth, upload, processImage, bookCtrl.createBook);

router.get('/', bookCtrl.getAllBooks);

router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
// Route pour mettre à jour un livre avec optimisation de l'image
router.put('/:id', auth, upload, processImage, bookCtrl.updateBook);

// Définir la route pour supprimer un livre par ID
router.delete('/:id', auth, bookCtrl.deleteBook);

// Définir la route pour noter un livre
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;


