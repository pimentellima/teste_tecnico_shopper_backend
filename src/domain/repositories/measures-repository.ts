import pool from "../../../db";
import { MeasureDTO } from "../dto/measure-dto";

export default class MeasuresRepository {
  async findAll(params: {
    customer_code: string;
    measure_type?: "WATER" | "GAS";
  }) {
    return params.measure_type
      ? await pool.query<MeasureDTO>(
          "SELECT * from measures WHERE customer_code = $1 AND measure_type = $2",
          [params.customer_code, params.measure_type]
        )
      : await pool.query<MeasureDTO>(
          "SELECT * from measures WHERE customer_code = $1",
          [params.customer_code]
        );
  }

  async findById(measure_uuid: string) {
    return await pool.query<MeasureDTO>(
      "SELECT has_confirmed FROM measures WHERE measure_uuid = $1",
      [measure_uuid]
    );
  }

  async find(params: { customer_code: string; measure_type: string }) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS measures (
        measure_uuid UUID PRIMARY KEY, 
        measure_datetime TEXT, 
        customer_code TEXT, 
        image_url TEXT, 
        has_confirmed BOOLEAN DEFAULT FALSE, 
        measure_value TEXT,
        measure_type TEXT
      )
    `);

    return await pool.query<MeasureDTO>(
      "SELECT * FROM measures WHERE customer_code = $1 AND measure_type = $2",
      [params.customer_code, params.measure_type]
    );
  }

  async updateValue(measure_uuid: string, measure_value: string) {
    await pool.query(
      "UPDATE measures SET has_confirmed = true, measure_value = $1 WHERE measure_uuid = $2",
      [measure_value, measure_uuid]
    );
  }

  async create(data: Omit<MeasureDTO, "has_confirmed">) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS measures (
        measure_uuid UUID PRIMARY KEY, 
        measure_datetime TEXT, 
        customer_code TEXT, 
        image_url TEXT, 
        has_confirmed BOOLEAN DEFAULT FALSE, 
        measure_value TEXT,
        measure_type TEXT
      )
    `);

    await pool.query(
      `INSERT INTO measures 
        (customer_code, measure_datetime, measure_uuid, image_url, has_confirmed, measure_type, measure_value) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.customer_code,
        data.measure_datetime,
        data.measure_uuid,
        data.image_url,
        false,
        data.measure_type.toUpperCase(),
        data.measure_value,
      ]
    );
  }
}
