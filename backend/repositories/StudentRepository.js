import connectSupabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';

class StudentRepository {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (!this.pool) {
      this.pool = connectSupabase();
    }
    return this.pool;
  }

  async findById(id) {
    const result = await this.getPool().query(
      `SELECT id, name, email, is_email_verified, phone, birth_date, gender, 
              join_date, status, service_type, blocked, block_reason, photo, 
              trainer_id, created_at, updated_at 
       FROM students WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIdWithPassword(id) {
    const result = await this.getPool().query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await this.getPool().query(
      `SELECT id, name, email, is_email_verified, phone, birth_date, gender, 
              join_date, status, service_type, blocked, block_reason, photo, 
              trainer_id, created_at, updated_at 
       FROM students WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async findByEmailWithPassword(email) {
    const result = await this.getPool().query(
      'SELECT * FROM students WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findByTrainer(trainerId) {
    const result = await this.getPool().query(
      `SELECT id, name, email, is_email_verified, phone, birth_date, gender, 
              join_date, status, service_type, blocked, block_reason, photo, 
              trainer_id, created_at, updated_at 
       FROM students WHERE trainer_id = $1 ORDER BY name ASC`,
      [trainerId]
    );
    return result.rows;
  }

  async create(studentData) {
    const {
      name,
      email,
      password,
      phone,
      birthDate,
      gender,
      serviceType = 'personal',
      status = 'active',
      trainerId
    } = studentData;

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const result = await this.getPool().query(
      `INSERT INTO students 
       (name, email, password, phone, birth_date, gender, service_type, status, trainer_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, name, email, is_email_verified, phone, birth_date, gender, 
                 join_date, status, service_type, blocked, block_reason, photo, 
                 trainer_id, created_at, updated_at`,
      [name, email, hashedPassword, phone, birthDate, gender, serviceType, status, trainerId]
    );

    return result.rows[0];
  }

  async update(id, studentData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Mapear campos camelCase para snake_case
    const fieldMap = {
      isEmailVerified: 'is_email_verified',
      birthDate: 'birth_date',
      joinDate: 'join_date',
      serviceType: 'service_type',
      blockReason: 'block_reason',
      trainerId: 'trainer_id'
    };

    Object.keys(studentData).forEach(key => {
      if (key !== 'id' && key !== 'password') {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(studentData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE students 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, name, email, is_email_verified, phone, birth_date, gender, 
                join_date, status, service_type, blocked, block_reason, photo, 
                trainer_id, created_at, updated_at
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await this.getPool().query(
      'UPDATE students SET password = $1 WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );

    return result.rows[0];
  }

  async setEmailVerificationToken(id, token, expires) {
    const result = await this.getPool().query(
      `UPDATE students 
       SET email_verification_token = $1, email_verification_expires = $2 
       WHERE id = $3 
       RETURNING id`,
      [token, expires, id]
    );
    return result.rows[0];
  }

  async setPasswordResetToken(id, token, expires) {
    const result = await this.getPool().query(
      `UPDATE students 
       SET password_reset_token = $1, password_reset_expires = $2 
       WHERE id = $3 
       RETURNING id`,
      [token, expires, id]
    );
    return result.rows[0];
  }

  async findByEmailVerificationToken(token) {
    const result = await this.getPool().query(
      `SELECT * FROM students 
       WHERE email_verification_token = $1 
       AND email_verification_expires > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  }

  async findByPasswordResetToken(token) {
    const result = await this.getPool().query(
      `SELECT * FROM students 
       WHERE password_reset_token = $1 
       AND password_reset_expires > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM students WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  async count() {
    const result = await this.getPool().query('SELECT COUNT(*) as count FROM students');
    return parseInt(result.rows[0].count);
  }

  async countByTrainer(trainerId) {
    const result = await this.getPool().query(
      'SELECT COUNT(*) as count FROM students WHERE trainer_id = $1',
      [trainerId]
    );
    return parseInt(result.rows[0].count);
  }

  async matchPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new StudentRepository();
