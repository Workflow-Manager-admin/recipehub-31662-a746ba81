//
// Controller for favorites - save/unsave, list.
//

const favoritesService = require('../services/favorites');

class FavoritesController {
  // PUBLIC_INTERFACE
  /**
   * List user's favorite recipes.
   */
  async list(req, res) {
    try {
      const result = await favoritesService.list(req.user);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Add a recipe to favorites.
   */
  async add(req, res) {
    try {
      const result = await favoritesService.add(req.user, req.params.recipeId);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Remove a recipe from favorites.
   */
  async remove(req, res) {
    try {
      await favoritesService.remove(req.user, req.params.recipeId);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new FavoritesController();
