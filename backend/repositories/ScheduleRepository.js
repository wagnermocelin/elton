import connectSupabase from '../config/supabase.js';

class ScheduleRepository {
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
      `SELECT s.*, 
              st.name as student_name
       FROM schedules s
       LEFT JOIN students st ON s.student_id = st.id
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.getPool().query(
      'SELECT * FROM schedules WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByStudent(studentId) {
    const result = await this.getPool().query(
      'SELECT * FROM schedules WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
    return result.rows;
  }

  async create(scheduleData) {
    const {
      studentId,
      name,
      startDate,
      endDate,
      weekSchedule = {},
      trainerId
    } = scheduleData;

    const result = await this.getPool().query(
      `INSERT INTO schedules 
       (student_id, name, start_date, end_date, monday, tuesday, wednesday, thursday, friday, saturday, sunday, trainer_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [studentId, name, startDate, endDate,
       weekSchedule.monday || null,
       weekSchedule.tuesday || null,
       weekSchedule.wednesday || null,
       weekSchedule.thursday || null,
       weekSchedule.friday || null,
       weekSchedule.saturday || null,
       weekSchedule.sunday || null,
       trainerId]
    );

    return result.rows[0];
  }

  async update(id, scheduleData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      studentId: 'student_id',
      startDate: 'start_date',
      endDate: 'end_date',
      trainerId: 'trainer_id'
    };

    Object.keys(scheduleData).forEach(key => {
      if (key !== 'id' && key !== 'weekSchedule') {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(scheduleData[key]);
        paramCount++;
      }
    });

    // Tratar weekSchedule separadamente
    if (scheduleData.weekSchedule) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        fields.push(`${day} = $${paramCount}`);
        values.push(scheduleData.weekSchedule[day] || null);
        paramCount++;
      });
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE schedules 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.getPool().query(
      'DELETE FROM schedules WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

export default new ScheduleRepository();
