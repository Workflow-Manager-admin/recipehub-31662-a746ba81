import React, { useState, useEffect } from "react";
import "./App.css";

/*
  Color Palette:
    --primary: #4caf50 (green)
    --secondary: #ff9800 (orange)
    --accent: #e91e63 (pink)
*/

// Helper function for API requests (replace with actual backend URL)
const API_BASE = "http://localhost:3001"; // Update this as needed

// PUBLIC_INTERFACE
function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ onlyFavorites: false, category: "" });

  // Fetch recipes and favorites after login
  useEffect(() => {
    if (user) {
      fetchRecipes();
      fetchFavorites();
    }
  }, [user]);

  // Fetch recipes (with optional search/filtering)
  async function fetchRecipes() {
    try {
      let q = `?q=${encodeURIComponent(search)}`;
      if (filters.category) q += `&category=${encodeURIComponent(filters.category)}`;
      const response = await fetch(`${API_BASE}/recipes${q}`);
      const data = await response.json();
      setRecipes(data);
    } catch {
      setRecipes([]);
    }
  }

  // Fetch favorites for user
  async function fetchFavorites() {
    try {
      const response = await fetch(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      setFavorites(data);
    } catch {
      setFavorites([]);
    }
  }

  // User authentication handlers
  async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUser(data);
    } catch {
      alert("Invalid credentials");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error();
      alert("Registration successful. Please log in!");
    } catch {
      alert("Failed to register");
    }
  }

  function handleLogout() {
    setUser(null);
    setRecipes([]);
    setFavorites([]);
    setCurrentRecipe(null);
    setShowEditor(false);
  }

  // Favorites
  async function toggleFavorite(recipeId) {
    if (!user) return;
    try {
      let isFav = favorites.some((fav) => fav._id === recipeId);
      let resp;
      if (isFav) {
        resp = await fetch(`${API_BASE}/favorites/${recipeId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      } else {
        resp = await fetch(`${API_BASE}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify({ recipeId }),
        });
      }
      if (resp.ok) fetchFavorites();
    } catch {}
  }

  // CRUD
  function handleEdit(recipe) {
    setCurrentRecipe(recipe);
    setShowEditor(true);
  }
  function handleNewRecipe() {
    setCurrentRecipe(null);
    setShowEditor(true);
  }
  function handleCloseEditor() {
    setCurrentRecipe(null);
    setShowEditor(false);
  }

  async function handleDelete(recipeId) {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      const resp = await fetch(`${API_BASE}/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (resp.ok) {
        fetchRecipes();
        fetchFavorites();
      }
    } catch {}
  }

  async function handleSaveRecipe(e) {
    e.preventDefault();
    const form = e.target;
    const body = {
      title: form.title.value,
      description: form.description.value,
      ingredients: form.ingredients.value.split("\n"),
      steps: form.steps.value.split("\n"),
      category: form.category.value,
    };
    const method = currentRecipe ? "PUT" : "POST";
    const url = currentRecipe
      ? `${API_BASE}/recipes/${currentRecipe._id}`
      : `${API_BASE}/recipes`;
    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(body),
      });
      if (resp.ok) {
        setShowEditor(false);
        setCurrentRecipe(null);
        fetchRecipes();
      }
    } catch {}
  }

  // Sharing by copying link (assumes backend is served somewhere public)
  function handleShare(recipeId) {
    const link = `${window.location.origin}/recipe/${recipeId}`;
    navigator.clipboard.writeText(link);
    alert("Recipe link copied to clipboard!");
  }

  // Render for authentication
  if (!user) {
    return (
      <div className="app">
        <Header />
        <div className="container auth-page">
          <div className="auth-forms">
            <form className="login-form" onSubmit={handleLogin}>
              <h2>Login</h2>
              <input name="username" type="text" placeholder="Username" required autoComplete="username" />
              <input name="password" type="password" placeholder="Password" required autoComplete="current-password" />
              <button className="btn" type="submit">Login</button>
            </form>
            <form className="register-form" onSubmit={handleRegister}>
              <h2>Register</h2>
              <input name="username" type="text" placeholder="Username" required />
              <input name="password" type="password" placeholder="Password" required />
              <button className="btn btn-secondary" type="submit">Register</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Filtered recipe list
  let visibleRecipes = recipes;
  if (filters.onlyFavorites) visibleRecipes = recipes.filter((r) => favorites.some(f => f._id === r._id));

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <div className="main-layout">
        <Sidebar
          favorites={favorites}
          user={user}
          filters={filters}
          setFilters={setFilters}
          onSelectRecipe={setCurrentRecipe}
        />
        <main className="main-content">
          <div className="recipes-topbar">
            <div className="recipes-search">
              <input
                type="text"
                placeholder="Search recipes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" ? fetchRecipes() : undefined}
              />
              <button className="btn" onClick={fetchRecipes} aria-label="Search">🔍</button>
            </div>
            <button className="btn btn-accent" onClick={handleNewRecipe}>
              + New Recipe
            </button>
          </div>

          {showEditor ? (
            <RecipeEditor
              key={currentRecipe?._id || "new"}
              recipe={currentRecipe}
              onCancel={handleCloseEditor}
              onSave={handleSaveRecipe}
            />
          ) : currentRecipe ? (
            <RecipeDetail
              recipe={currentRecipe}
              onBack={() => setCurrentRecipe(null)}
              onEdit={() => handleEdit(currentRecipe)}
              onDelete={() => handleDelete(currentRecipe._id)}
              onShare={() => handleShare(currentRecipe._id)}
              isFavorite={favorites.some(f => f._id === currentRecipe._id)}
              toggleFavorite={() => toggleFavorite(currentRecipe._id)}
              user={user}
            />
          ) : (
            <RecipeList
              recipes={visibleRecipes}
              favorites={favorites}
              onSelect={setCurrentRecipe}
              toggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function Header({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="logo">
          <span className="logo-symbol" style={{ color: "var(--accent)" }}>🍲</span>&nbsp;RecipeHub
        </span>
        {
          user
            ? <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span className="username">{user.username}</span>
                <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
              </span>
            : null
        }
      </div>
    </nav>
  );
}

// PUBLIC_INTERFACE
function Sidebar({ favorites, user, filters, setFilters, onSelectRecipe }) {
  const categories = [
    "", "Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Vegan", "Vegetarian", "Gluten-Free"
  ];
  return (
    <aside className="sidebar">
      <h3>Filters</h3>
      <div className="sidebar-section">
        <label>
          <input
            type="checkbox"
            checked={filters.onlyFavorites}
            onChange={e => setFilters(f => ({ ...f, onlyFavorites: e.target.checked }))}
          />{" "}
          Favorites only
        </label>
        <label>
          Category:
          <select
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c || "All"}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="sidebar-section">
        <h4>Favorites</h4>
        {favorites.length === 0 && <div className="sidebar-note">No favorites yet.</div>}
        <ul className="favorites-list">
          {favorites.map(r =>
            <li key={r._id}>
              <button className="favorite-link" onClick={() => onSelectRecipe(r)}>{r.title}</button>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}

// PUBLIC_INTERFACE
function RecipeList({ recipes, favorites, onSelect, toggleFavorite }) {
  return (
    <div className="recipe-list">
      {recipes.length === 0 && (
        <div className="empty-results">No recipes found.</div>
      )}
      {recipes.map(recipe =>
        <div className="recipe-card" key={recipe._id || recipe.title}>
          <h3>{recipe.title}</h3>
          <div className="recipe-meta">
            <span>{recipe.category}</span>
            <button
              className="fav-star"
              aria-label="Favorite"
              onClick={() => toggleFavorite(recipe._id)}
              style={{ color: favorites.some(f => f._id === recipe._id) ? "var(--secondary)" : "#999" }}
            >
              ★
            </button>
          </div>
          <div className="recipe-desc">{recipe.description}</div>
          <button className="btn btn-secondary" onClick={() => onSelect(recipe)}>View Details</button>
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function RecipeDetail({ recipe, onBack, onEdit, onDelete, onShare, isFavorite, toggleFavorite, user }) {
  return (
    <div className="recipe-detail">
      <button className="btn btn-small" onClick={onBack}>← Back</button>
      <div className="detail-header">
        <h2>{recipe.title}</h2>
        <span style={{ marginLeft: 10, color: "var(--secondary)" }}>{recipe.category}</span>
        <button className="fav-star-large" aria-label="Favorite" onClick={toggleFavorite} style={{ color: isFavorite ? "var(--secondary)" : "#bbb" }}>★</button>
      </div>
      <div className="detail-section">
        <strong>Description:</strong>
        <p>{recipe.description}</p>
      </div>
      <div className="detail-section">
        <strong>Ingredients:</strong>
        <ul>
          {recipe.ingredients && recipe.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}
        </ul>
      </div>
      <div className="detail-section">
        <strong>Steps:</strong>
        <ol>
          {recipe.steps && recipe.steps.map((step, idx) => <li key={idx}>{step}</li>)}
        </ol>
      </div>
      <div className="detail-buttons">
        <button className="btn btn-accent" onClick={onEdit}>Edit</button>
        <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        <button className="btn btn-secondary" onClick={onShare}>Share</button>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function RecipeEditor({ recipe, onCancel, onSave }) {
  return (
    <form className="recipe-editor" onSubmit={onSave}>
      <h2>{recipe ? "Edit Recipe" : "New Recipe"}</h2>
      <div>
        <label>Title</label>
        <input name="title" defaultValue={recipe?.title || ""} required />
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" rows={2} defaultValue={recipe?.description || ""} />
      </div>
      <div>
        <label>Ingredients (one per line)</label>
        <textarea name="ingredients" rows={5} defaultValue={recipe?.ingredients?.join("\n") || ""} />
      </div>
      <div>
        <label>Steps (one per line)</label>
        <textarea name="steps" rows={5} defaultValue={recipe?.steps?.join("\n") || ""} />
      </div>
      <div>
        <label>Category</label>
        <select name="category" defaultValue={recipe?.category || ""}>
          <option value="">Select…</option>
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
          <option>Dessert</option>
          <option>Vegan</option>
          <option>Vegetarian</option>
          <option>Gluten-Free</option>
        </select>
      </div>
      <div className="editor-buttons">
        <button className="btn btn-primary" type="submit">
          Save
        </button>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default App;
