const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;

    const book = new Book({
        ...bookObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        averageRating: 0,
        ratings: []
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

// Fonction pour renvoyer tous les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

// Fonction pour renvoyer un livre spécifique
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !' });
            }
            res.status(200).json(book);
        })
        .catch(error => res.status(400).json({ error }));
};

// Fonction pour renvoyer les 3 livres avec la meilleure note moyenne
exports.getBestRatedBooks = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

// Fonction pour mettre à jour un livre spécifique
exports.updateBook = (req, res, next) => {
    let bookObject = {};

    if (req.file) {
        // Si un fichier est fourni, parsez les données du livre envoyées en chaîne JSON
        bookObject = {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };
    } else {
        // Sinon, utilisez les données envoyées directement dans le corps de la requête
        bookObject = { ...req.body };
    }

    // Supprimer l'ancienne image si une nouvelle est fournie
    if (req.file) {
        Book.findOne({ _id: req.params.id })
            .then(book => {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.log(err);
                });
            })
            .catch(error => res.status(500).json({ error }));
    }

    // Mise à jour du livre dans la base de données
    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre mis à jour !' }))
        .catch(error => res.status(400).json({ error }));
};

// Fonction pour supprimer un livre spécifique
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé !' });
            }

            // Récupérer le nom de l'image associée
            const filename = book.imageUrl.split('/images/')[1];

            // Supprimer l'image du répertoire
            fs.unlink(`images/${filename}`, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
                }

                // Supprimer le livre de la base de données
                Book.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
    const { userId, rating } = req.body;

    // Vérifier que la note est bien comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
    }

    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé.' });
            }

            // Vérifier si l'utilisateur a déjà noté ce livre
            const existingRating = book.ratings.find(r => r.userId === userId);
            if (existingRating) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
            }

            // Ajouter la nouvelle note au tableau des notes
            book.ratings.push({ userId: userId, grade: rating });

            // Calculer la nouvelle moyenne des notes
            book.averageRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length;

            // Sauvegarder les changements
            book.save()
                .then(updatedBook => res.status(200).json(updatedBook))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID de livre invalide.' });
            }
            res.status(500).json({ error });
        });
};