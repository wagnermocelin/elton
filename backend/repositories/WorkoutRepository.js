import connectSupabase from '../config/supabase.js';

class WorkoutRepository {
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
      'SELECT * FROM workouts ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.getPool().query(
      'SELECT * FROM workouts WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByTrainer(trainerId) {
    const result = await this.getPool().query(
      'SELECT * FROM workouts WHERE trainer_id = $1 ORDER BY created_at DESC',
      [trainerId]
    );
    return result.rows;
  }

  async create(workoutData) {
    const {
      name,
      description,
      exercises = [],
      trainerId
    } = workoutData;

    const result = await this.getPool().query(
      `INSERT INTO workouts (name, description, exercises, trainer_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, description, JSON.stringify(exercises), trainerId]
    );

    return result.rows[0];
  }

  async update(id, workoutData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      trainerId: 'trainer_id'
    };

    Object.keys(workoutData).forEach(key => {
      if (key !== 'id') {
        const dbField = fieldMap[key] || key;
        // Se for exercises, converter para JSON
        if (key === 'exercises') {
          fields.push(`${dbField} = $${paramCount}`);
          values.push(JSON.stringify(workoutData[key]));
        } else {
          fields.push(`${dbField} = $${paramCount}`);
          values.push(workoutData[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE workouts 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM workouts WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

export default new WorkoutRepository();
