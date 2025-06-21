const express = require('express');
const healthController = require('../controllers/health');

// Application controllers
const recipesController = require('../controllers/recipes');
const usersController = require('../controllers/users');
const favoritesController = require('../controllers/favorites');

// Middleware
const authenticate = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// User Registration & Authentication
router.post('/api/auth/register', usersController.register.bind(usersController));
router.post('/api/auth/login', usersController.login.bind(usersController));
router.get('/api/auth/profile', authenticate, usersController.profile.bind(usersController));

// Recipes
router.get('/api/recipes', recipesController.list.bind(recipesController));
router.get('/api/recipes/:id', recipesController.get.bind(recipesController));
router.post('/api/recipes', authenticate, recipesController.create.bind(recipesController));
router.put('/api/recipes/:id', authenticate, recipesController.update.bind(recipesController));
router.delete('/api/recipes/:id', authenticate, recipesController.delete.bind(recipesController));

// Recipe sharing
router.post('/api/recipes/:id/share', authenticate, recipesController.share.bind(recipesController));

// Favorites
router.get('/api/favorites', authenticate, favoritesController.list.bind(favoritesController));
router.post('/api/favorites/:recipeId', authenticate, favoritesController.add.bind(favoritesController));
router.delete('/api/favorites/:recipeId', authenticate, favoritesController.remove.bind(favoritesController));

module.exports = router;
