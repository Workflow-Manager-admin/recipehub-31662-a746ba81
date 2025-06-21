//
// Users/authentication service
//

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
// In-memory users for demo/MVP
const users = [];

class UsersService {
  // PUBLIC_INTERFACE
  async register(data) {
    if (!data.username || !data.password)
      throw new Error('Username and password required');
    if (users.some(u => u.username === data.username))
      throw new Error('Username already taken');
    const user = {
      id: users.length + 1,
      username: data.username,
      password: await bcrypt.hash(data.password, 8)
    };
    users.push(user);
    return { id: user.id, username: user.username };
  }

  // PUBLIC_INTERFACE
  async login(data) {
    if (!data.username || !data.password)
      throw new Error('Username and password required');
    const user = users.find(u => u.username === data.username);
    if (!user) throw new Error('User not found');
    const pwMatch = await bcrypt.compare(data.password, user.password);
    if (!pwMatch) throw new Error('Invalid credentials');
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return { token, user: { id: user.id, username: user.username } };
  }
}

module.exports = new UsersService();
