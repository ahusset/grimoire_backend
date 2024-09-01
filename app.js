const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');  // Import des routes utilisateur
const bookRoutes = require('./routes/book');  // Import des routes des livres (si vous en avez)
const path = require('path');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(error => console.log('Connexion à MongoDB échouée !', error));

// Initialisation de l'application Express
const app = express();

// Middleware pour parser les corps de requêtes en JSON
app.use(express.json());

// Middleware pour configurer les en-têtes CORS
app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        next();
});

// Middleware pour servir les fichiers statiques (images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes API pour l'authentification utilisateur
app.use('/api/auth', userRoutes);

// Routes API pour les livres (si vous en avez)
app.use('/api/books', bookRoutes);

module.exports = app;