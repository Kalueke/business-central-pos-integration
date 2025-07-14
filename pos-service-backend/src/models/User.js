const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In-memory user storage (replace with database in production)
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@pos.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // password: admin123
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'cashier',
    email: 'cashier@pos.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // password: cashier123
    firstName: 'Cashier',
    lastName: 'User',
    role: 'cashier',
    isActive: true,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class User {
  static async findByUsername(username) {
    return users.find(user => user.username === username && user.isActive);
  }

  static async findByEmail(email) {
    return users.find(user => user.email === email && user.isActive);
  }

  static async findById(id) {
    return users.find(user => user.id === id && user.isActive);
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    
    const user = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'cashier',
      isActive: true,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(user);
    return user;
  }

  static async update(id, updateData) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return users[userIndex];
  }

  static async delete(id) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    users[userIndex].isActive = false;
    users[userIndex].updatedAt = new Date().toISOString();
    return true;
  }

  static async updateLastLogin(id) {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex].lastLogin = new Date().toISOString();
    users[userIndex].updatedAt = new Date().toISOString();
    return users[userIndex];
  }

  static async getAll(limit = 50, offset = 0) {
    return users
      .filter(user => user.isActive)
      .slice(offset, offset + limit)
      .map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
  }

  static async count() {
    return users.filter(user => user.isActive).length;
  }

  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  static toJSON(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = User; 