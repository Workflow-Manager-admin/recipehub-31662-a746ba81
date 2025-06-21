//
// Controller for recipe CRUD, search, and sharing.
//

const recipesService = require('../services/recipes');

class RecipesController {
  // PUBLIC_INTERFACE
  /**
   * Get list of recipes, optionally filter/search.
   * Query params: q (search), tags, author, page, limit
   */
  async list(req, res) {
    try {
      const data = await recipesService.list(req.query);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get a single recipe by id.
   */
  async get(req, res) {
    try {
      const recipe = await recipesService.getById(req.params.id);
      if (!recipe) {
        res.status(404).json({ status: 'error', message: 'Recipe not found' });
      } else {
        res.status(200).json(recipe);
      }
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new recipe. Requires authentication.
   */
  async create(req, res) {
    try {
      const user = req.user;
      const recipe = await recipesService.create(req.body, user);
      res.status(201).json(recipe);
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update recipe by id. Requires authentication.
   */
  async update(req, res) {
    try {
      const user = req.user;
      const recipe = await recipesService.update(req.params.id, req.body, user);
      res.status(200).json(recipe);
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete recipe by id. Requires authentication.
   */
  async delete(req, res) {
    try {
      const user = req.user;
      await recipesService.delete(req.params.id, user);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Share a recipe - returns a shareable link or similar.
   */
  async share(req, res) {
    try {
      const link = await recipesService.share(req.params.id, req.user);
      res.status(200).json({ link });
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new RecipesController();
