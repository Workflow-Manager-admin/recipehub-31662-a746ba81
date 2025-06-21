//
// Recipes service: contains logic for CRUD, search, share.
//

// In-memory recipes store for MVP/demo only
const recipes = [];
let nextId = 1;

class RecipesService {
  // PUBLIC_INTERFACE
  async list(query) {
    // Simple search and filter logic
    let result = recipes.slice();
    if (query.q) {
      const q = query.q.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    if (query.author) {
      result = result.filter(r => r.author === query.author);
    }
    // TODO: tags, pagination.
    return result;
  }

  // PUBLIC_INTERFACE
  async getById(id) {
    return recipes.find(r => r.id === parseInt(id));
  }

  // PUBLIC_INTERFACE
  async create(data, user) {
    if (!user) throw new Error('Unauthorized');
    if (!data.title || !data.description) throw new Error('Title and description required');
    const recipe = {
      id: nextId++,
      title: data.title,
      description: data.description,
      ingredients: data.ingredients || [],
      instructions: data.instructions || '',
      author: user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags || [],
      shared: false,
    };
    recipes.push(recipe);
    return recipe;
  }

  // PUBLIC_INTERFACE
  async update(id, data, user) {
    const recipe = recipes.find(r => r.id === parseInt(id));
    if (!recipe) throw new Error('Recipe not found');
    if (!user || recipe.author !== user.username) throw new Error('Unauthorized: Only author can edit');
    Object.assign(recipe, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return recipe;
  }

  // PUBLIC_INTERFACE
  async delete(id, user) {
    const idx = recipes.findIndex(r => r.id === parseInt(id));
    if (idx === -1) throw new Error('Recipe not found');
    const recipe = recipes[idx];
    if (!user || recipe.author !== user.username) throw new Error('Unauthorized: Only author can delete');
    recipes.splice(idx, 1);
    return true;
  }

  // PUBLIC_INTERFACE
  async share(id, user) {
    // For MVP: just return a static link (in production, generate unique/persistent share link)
    const recipe = recipes.find(r => r.id === parseInt(id));
    if (!recipe) throw new Error('Recipe not found');
    recipe.shared = true;
    return `${process.env.FRONTEND_URL || 'https://example.com/recipes'}/${id}`;
  }
}

module.exports = new RecipesService();
