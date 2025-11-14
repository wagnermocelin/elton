import connectSupabase from '../config/supabase.js';

class FoodRepository {
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
    const { search, category, popular, trainerId } = filters;
    
    let query = `
      SELECT * FROM foods 
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

    if (popular === 'true' || popular === true) {
      query += ` AND popular = true`;
    }

    query += ` ORDER BY is_custom DESC, popular DESC, name ASC LIMIT 1000`;

    const result = await this.getPool().query(query, params);
    return result.rows;
  }

  async findById(id) {
    const result = await this.getPool().query(
      'SELECT * FROM foods WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(foodData) {
    const {
      name,
      category = 'outro',
      servingAmount = 100,
      servingUnit = 'g',
      calories,
      protein,
      carbs,
      fat,
      fiber = 0,
      sodium = 0,
      isCustom = false,
      trainerId,
      source = 'TACO',
      tags = [],
      popular = false
    } = foodData;

    const result = await this.getPool().query(
      `INSERT INTO foods 
       (name, category, serving_amount, serving_unit, calories, protein, carbs, fat, 
        fiber, sodium, is_custom, trainer_id, source, tags, popular) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING *`,
      [name, category, servingAmount, servingUnit, calories, protein, carbs, fat,
       fiber, sodium, isCustom, trainerId, source, tags, popular]
    );

    return result.rows[0];
  }

  async update(id, foodData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      servingAmount: 'serving_amount',
      servingUnit: 'serving_unit',
      isCustom: 'is_custom',
      trainerId: 'trainer_id'
    };

    Object.keys(foodData).forEach(key => {
      if (key !== 'id') {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(foodData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE foods 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM foods WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  calculateMacros(food, amount, unit = 'g') {
    // Converter para 100g base
    let multiplier = amount / 100;
    
    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      fiber: Math.round(food.fiber * multiplier * 10) / 10
    };
  }
}

export default new FoodRepository();
