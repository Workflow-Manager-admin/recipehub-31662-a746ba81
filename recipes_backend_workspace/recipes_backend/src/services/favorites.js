//
// Favorites service
//
const recipesService = require('./recipes');
// In-memory favorite relations: { userId: [recipeId, ...] }
const favorites = {};

class FavoritesService {
  // PUBLIC_INTERFACE
  async list(user) {
    const ids = favorites[user.id] || [];
    return (await Promise.all(ids.map(id => recipesService.getById(id)))).filter(Boolean);
  }

  // PUBLIC_INTERFACE
  async add(user, recipeId) {
    if (!user || !user.id) throw new Error('Unauthorized');
    if (!favorites[user.id]) favorites[user.id] = [];
    const intRecipeId = parseInt(recipeId);
    if (!favorites[user.id].includes(intRecipeId)) {
      favorites[user.id].push(intRecipeId);
    }
    return { status: 'ok', message: 'Added to favorites' };
  }

  // PUBLIC_INTERFACE
  async remove(user, recipeId) {
    if (!user || !user.id) throw new Error('Unauthorized');
    if (!favorites[user.id]) return;
    const intRecipeId = parseInt(recipeId);
    favorites[user.id] = favorites[user.id].filter(id => id !== intRecipeId);
    return { status: 'ok', message: 'Removed from favorites' };
  }
}

module.exports = new FavoritesService();
