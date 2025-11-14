import connectSupabase from '../config/supabase.js';

class PaymentRepository {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (!this.pool) {
      this.pool = connectSupabase();
    }
    return this.pool;
  }

  async findAll() {
    const result = await this.getPool().query(
      `SELECT p.*, 
              s.name as student_name,
              s.email as student_email
       FROM payments p
       LEFT JOIN students s ON p.student_id = s.id
       ORDER BY p.year DESC, p.month DESC, p.created_at DESC`
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.getPool().query(
      `SELECT p.*, 
              s.name as student_name,
              s.email as student_email
       FROM payments p
       LEFT JOIN students s ON p.student_id = s.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByStudent(studentId) {
    const result = await this.getPool().query(
      `SELECT * FROM payments 
       WHERE student_id = $1 
       ORDER BY year DESC, month DESC`,
      [studentId]
    );
    return result.rows;
  }

  async findByTrainer(trainerId) {
    const result = await this.getPool().query(
      `SELECT p.*, 
              s.name as student_name,
              s.email as student_email
       FROM payments p
       LEFT JOIN students s ON p.student_id = s.id
       WHERE p.trainer_id = $1
       ORDER BY p.year DESC, p.month DESC`,
      [trainerId]
    );
    return result.rows;
  }

  async create(paymentData) {
    const {
      studentId,
      month,
      year,
      amount,
      dueDate,
      paymentDate,
      status = 'pending',
      paymentMethod,
      notes,
      trainerId
    } = paymentData;

    const result = await this.getPool().query(
      `INSERT INTO payments 
       (student_id, month, year, amount, due_date, payment_date, status, payment_method, notes, trainer_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [studentId, month, year, amount, dueDate, paymentDate, status, paymentMethod, notes, trainerId]
    );

    return result.rows[0];
  }

  async update(id, paymentData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Mapear campos camelCase para snake_case
    const fieldMap = {
      studentId: 'student_id',
      dueDate: 'due_date',
      paymentDate: 'payment_date',
      paymentMethod: 'payment_method',
      trainerId: 'trainer_id'
    };

    Object.keys(paymentData).forEach(key => {
      if (key !== 'id') {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(paymentData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE payments 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM payments WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  async findOverdue(trainerId) {
    const result = await this.getPool().query(
      `SELECT p.*, 
              s.name as student_name,
              s.email as student_email
       FROM payments p
       LEFT JOIN students s ON p.student_id = s.id
       WHERE p.trainer_id = $1 
       AND p.status IN ('pending', 'overdue')
       AND p.due_date < NOW()
       ORDER BY p.due_date ASC`,
      [trainerId]
    );
    return result.rows;
  }

  async markAsOverdue(trainerId) {
    const result = await this.getPool().query(
      `UPDATE payments 
       SET status = 'overdue' 
       WHERE trainer_id = $1 
       AND status = 'pending' 
       AND due_date < NOW()
       RETURNING id`,
      [trainerId]
    );
    return result.rowCount;
  }
}

export default new PaymentRepository();
