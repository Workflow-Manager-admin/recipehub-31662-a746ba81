//
// Controller for user authentication, registration, profile.
//

const usersService = require('../services/users');

class UsersController {
  // PUBLIC_INTERFACE
  /**
   * Register a new user.
   */
  async register(req, res) {
    try {
      const user = await usersService.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Login a user.
   */
  async login(req, res) {
    try {
      const { token, user } = await usersService.login(req.body);
      res.status(200).json({ token, user });
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get current user profile.
   */
  async profile(req, res) {
    try {
      res.status(200).json(req.user);
    } catch (err) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
  }
}

module.exports = new UsersController();
