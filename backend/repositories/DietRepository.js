import connectSupabase from '../config/supabase.js';

class DietRepository {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (!this.pool) {
      this.pool = connectSupabase();
    }
    return this.pool;
  }

  calculateTotals(meals = []) {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    meals.forEach(meal => {
      if (meal.totals) {
        totals.calories += meal.totals.calories || 0;
        totals.protein += meal.totals.protein || 0;
        totals.carbs += meal.totals.carbs || 0;
        totals.fat += meal.totals.fat || 0;
      }
    });

    return totals;
  }

  async findAll() {
    const result = await this.getPool().query(
      `SELECT d.*, 
              s.name as student_name
       FROM diets d
       LEFT JOIN students s ON d.student_id = s.id
       ORDER BY d.created_at DESC`
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.getPool().query(
      'SELECT * FROM diets WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByStudent(studentId) {
    const result = await this.getPool().query(
      'SELECT * FROM diets WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    return result.rows;
  }

  async create(dietData) {
    const {
      studentId,
      name,
      goals = { calories: 0, protein: 0, carbs: 0, fat: 0 },
      meals = [],
      notes,
      status = 'active',
      trainerId
    } = dietData;

    // Calcular totais
    const totals = this.calculateTotals(meals);

    const result = await this.getPool().query(
      `INSERT INTO diets (student_id, name, goals, totals, meals, notes, status, trainer_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [studentId, name, JSON.stringify(goals), JSON.stringify(totals), 
       JSON.stringify(meals), notes, status, trainerId]
    );

    return result.rows[0];
  }

  async update(id, dietData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      studentId: 'student_id',
      trainerId: 'trainer_id'
    };

    Object.keys(dietData).forEach(key => {
      if (key !== 'id' && key !== 'totals') { // totals será calculado
        const dbField = fieldMap[key] || key;
        // Se for JSONB, converter para JSON
        if (['goals', 'meals'].includes(key)) {
          fields.push(`${dbField} = $${paramCount}`);
          values.push(JSON.stringify(dietData[key]));
        } else {
          fields.push(`${dbField} = $${paramCount}`);
          values.push(dietData[key]);
        }
        paramCount++;
      }
    });

    // Calcular totais se meals foi atualizado
    if (dietData.meals) {
      const totals = this.calculateTotals(dietData.meals);
      fields.push(`totals = $${paramCount}`);
      values.push(JSON.stringify(totals));
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE diets 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM diets WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

export default new DietRepository();
