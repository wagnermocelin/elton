import connectSupabase from '../config/supabase.js';

class ExerciseRepository {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (!this.pool) {
      this.pool = connectSupabase();
    }
    return this.pool;
  }

  async findAll(filters = {}) {
    const { search, category, muscleGroup, equipment, difficulty, popular, trainerId } = filters;
    
    let query = `
      SELECT * FROM exercises 
      WHERE (is_custom = false OR trainer_id = $1)
    `;
    const params = [trainerId];
    let paramCount = 2;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR $${paramCount} = ANY(tags))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (muscleGroup) {
      query += ` AND muscle_group = $${paramCount}`;
      params.push(muscleGroup);
      paramCount++;
    }

    if (equipment) {
      query += ` AND equipment = $${paramCount}`;
      params.push(equipment);
      paramCount++;
    }

    if (difficulty) {
      query += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    if (popular === 'true' || popular === true) {
      query += ` AND popular = true`;
    }

    query += ` ORDER BY is_custom DESC, popular DESC, name ASC LIMIT 1000`;

    const result = await this.getPool().query(query, params);
    return result.rows;
  }

  async findById(id) {
    const result = await this.getPool().query(
      'SELECT * FROM exercises WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(exerciseData) {
    const {
      name,
      category = 'outro',
      muscleGroup,
      equipment = 'nenhum',
      difficulty = 'intermediario',
      description = '',
      instructions = '',
      videoUrl = '',
      isCustom = false,
      trainerId,
      tags = [],
      popular = false
    } = exerciseData;

    const result = await this.getPool().query(
      `INSERT INTO exercises 
       (name, category, muscle_group, equipment, difficulty, description, 
        instructions, video_url, is_custom, trainer_id, tags, popular) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [name, category, muscleGroup, equipment, difficulty, description,
       instructions, videoUrl, isCustom, trainerId, tags, popular]
    );

    return result.rows[0];
  }

  async update(id, exerciseData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      muscleGroup: 'muscle_group',
      videoUrl: 'video_url',
      isCustom: 'is_custom',
      trainerId: 'trainer_id'
    };

    Object.keys(exerciseData).forEach(key => {
      if (key !== 'id') {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(exerciseData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE exercises 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM exercises WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

export default new ExerciseRepository();
