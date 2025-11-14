import connectSupabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';

class UserRepository {
  constructor() {
    this.pool = connectSupabase();
  }

  async findById(id) {
    const result = await this.pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIdWithPassword(id) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await this.pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findByEmailWithPassword(email) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async create(userData) {
    const { name, email, password, role = 'trainer', status = 'active' } = userData;
    
    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await this.pool.query(
      `INSERT INTO users (name, email, password, role, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, status, created_at, updated_at`,
      [name, email, hashedPassword, role, status]
    );

    return result.rows[0];
  }

  async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach(key => {
      if (key !== 'id' && key !== 'password') {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, status, created_at, updated_at
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await this.pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );

    return result.rows[0];
  }

  async delete(id) {
    const result = await this.pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  async count() {
    const result = await this.pool.query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }

  async findAll() {
    const result = await this.pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async matchPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new UserRepository();
