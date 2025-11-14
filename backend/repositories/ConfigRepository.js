import connectSupabase from '../config/supabase.js';

class ConfigRepository {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (!this.pool) {
      this.pool = connectSupabase();
    }
    return this.pool;
  }

  async findByTrainer(trainerId) {
    const result = await this.getPool().query(
      'SELECT * FROM configs WHERE trainer_id = $1',
      [trainerId]
    );
    return result.rows[0] || null;
  }

  async create(configData) {
    const {
      gymName = 'Power Training',
      logo,
      trainerId,
      emailConfig = {
        enabled: true,
        provider: 'ethereal',
        smtpHost: '',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@zen.com',
        fromName: 'Power Training',
        emailTemplates: {
          welcomeSubject: 'Bem-vindo ao Power Training - Ative sua conta',
          welcomeEnabled: true,
          resetPasswordSubject: 'Redefinir Senha - Power Training',
          resetPasswordEnabled: true
        }
      }
    } = configData;

    const result = await this.getPool().query(
      `INSERT INTO configs (gym_name, logo, trainer_id, email_config) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [gymName, logo, trainerId, JSON.stringify(emailConfig)]
    );

    return result.rows[0];
  }

  async update(trainerId, configData) {
    // Buscar config existente
    const existing = await this.findByTrainer(trainerId);
    
    if (!existing) {
      return this.create({ ...configData, trainerId });
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Atualizar gym_name e logo
    if (configData.gymName !== undefined) {
      fields.push(`gym_name = $${paramCount}`);
      values.push(configData.gymName);
      paramCount++;
    }

    if (configData.logo !== undefined) {
      fields.push(`logo = $${paramCount}`);
      values.push(configData.logo);
      paramCount++;
    }

    // Merge do emailConfig
    if (configData.emailConfig) {
      const currentEmailConfig = existing.email_config || {};
      const newEmailConfig = { ...currentEmailConfig };

      Object.keys(configData.emailConfig).forEach(key => {
        if (key === 'emailTemplates' && configData.emailConfig.emailTemplates) {
          newEmailConfig.emailTemplates = {
            ...(currentEmailConfig.emailTemplates || {}),
            ...configData.emailConfig.emailTemplates
          };
        } else {
          newEmailConfig[key] = configData.emailConfig[key];
        }
      });

      fields.push(`email_config = $${paramCount}`);
      values.push(JSON.stringify(newEmailConfig));
      paramCount++;
    }

    if (fields.length === 0) {
      return existing;
    }

    values.push(trainerId);
    const query = `
      UPDATE configs 
      SET ${fields.join(', ')} 
      WHERE trainer_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.getPool().query(query, values);
    return result.rows[0];
  }
}

export default new ConfigRepository();
