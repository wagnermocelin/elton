import connectSupabase from '../config/supabase.js';

class MeasurementRepository {
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
      `SELECT m.*, 
              s.name as student_name,
              u.name as trainer_name
       FROM measurements m
       LEFT JOIN students s ON m.student_id = s.id
       LEFT JOIN users u ON m.trainer_id = u.id
       ORDER BY m.date DESC`
    );
    return result.rows;
  }

  async findByStudent(studentId) {
    const result = await this.getPool().query(
      `SELECT m.*, 
              u.name as trainer_name
       FROM measurements m
       LEFT JOIN users u ON m.trainer_id = u.id
       WHERE m.student_id = $1
       ORDER BY m.date DESC`,
      [studentId]
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.getPool().query(
      'SELECT * FROM measurements WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(measurementData) {
    const {
      studentId,
      date = new Date(),
      weight, height, imc, bodyFat, fatMass, leanMass,
      waistHipRatio, bodyDensity, skinFoldSum, armMuscleArea, armFatArea,
      shoulders, chest, waist, abdomen, hip,
      calfLeft, calfRight, thighLeft, thighRight,
      proximalThighLeft, proximalThighRight,
      relaxedArmLeft, relaxedArmRight,
      contractedArmLeft, contractedArmRight,
      bicepsFold, tricepsFold, midAxillaryFold,
      chestFold, abdominalFold, subscapularFold, thighFold,
      trainerId
    } = measurementData;

    const result = await this.getPool().query(
      `INSERT INTO measurements 
       (student_id, date, weight, height, imc, body_fat, fat_mass, lean_mass,
        waist_hip_ratio, body_density, skin_fold_sum, arm_muscle_area, arm_fat_area,
        shoulders, chest, waist, abdomen, hip,
        calf_left, calf_right, thigh_left, thigh_right,
        proximal_thigh_left, proximal_thigh_right,
        relaxed_arm_left, relaxed_arm_right,
        contracted_arm_left, contracted_arm_right,
        biceps_fold, triceps_fold, mid_axillary_fold,
        chest_fold, abdominal_fold, subscapular_fold, thigh_fold,
        trainer_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
               $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36) 
       RETURNING *`,
      [studentId, date, weight, height, imc, bodyFat, fatMass, leanMass,
       waistHipRatio, bodyDensity, skinFoldSum, armMuscleArea, armFatArea,
       shoulders, chest, waist, abdomen, hip,
       calfLeft, calfRight, thighLeft, thighRight,
       proximalThighLeft, proximalThighRight,
       relaxedArmLeft, relaxedArmRight,
       contractedArmLeft, contractedArmRight,
       bicepsFold, tricepsFold, midAxillaryFold,
       chestFold, abdominalFold, subscapularFold, thighFold,
       trainerId]
    );

    return result.rows[0];
  }

  async update(id, measurementData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Mapear campos camelCase para snake_case
    const fieldMap = {
      studentId: 'student_id',
      bodyFat: 'body_fat',
      fatMass: 'fat_mass',
      leanMass: 'lean_mass',
      waistHipRatio: 'waist_hip_ratio',
      bodyDensity: 'body_density',
      skinFoldSum: 'skin_fold_sum',
      armMuscleArea: 'arm_muscle_area',
      armFatArea: 'arm_fat_area',
      calfLeft: 'calf_left',
      calfRight: 'calf_right',
      thighLeft: 'thigh_left',
      thighRight: 'thigh_right',
      proximalThighLeft: 'proximal_thigh_left',
      proximalThighRight: 'proximal_thigh_right',
      relaxedArmLeft: 'relaxed_arm_left',
      relaxedArmRight: 'relaxed_arm_right',
      contractedArmLeft: 'contracted_arm_left',
      contractedArmRight: 'contracted_arm_right',
      bicepsFold: 'biceps_fold',
      tricepsFold: 'triceps_fold',
      midAxillaryFold: 'mid_axillary_fold',
      chestFold: 'chest_fold',
      abdominalFold: 'abdominal_fold',
      subscapularFold: 'subscapular_fold',
      thighFold: 'thigh_fold',
      trainerId: 'trainer_id'
    };

    Object.keys(measurementData).forEach(key => {
      if (key !== 'id') {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(measurementData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE measurements 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM measurements WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

export default new MeasurementRepository();
