import { Context } from "hono";
import MeasuresRepository from "../repositories/measures-repository";
import { BlankEnv, BlankInput } from "hono/types";
import z from "zod";

export default class GetMeasuresUseCase {
  constructor(private readonly manager: MeasuresRepository) {}

  public async execute(
    c: Context<BlankEnv, "/:customer_code/list", BlankInput>
  ) {
    const params = c.req.param();
    const measure_type = z
      .enum(["WATER", "GAS"])
      .optional()
      .safeParse(c.req.query("measure_type")?.toUpperCase());

    if (measure_type.error) {
      return c.json(
        {
          error_code: "INVALID_TYPE",
          error_description: "Tipo de medição não permitida",
        },
        400
      );
    }
    try {
      const result = await this.manager.findAll({
        customer_code: params.customer_code,
        measure_type: measure_type.data,
      });

      if (result.rows.length === 0)
        return c.json(
          {
            error_code: "MEASURES_NOT_FOUND",
            error_description: "Nenhuma leitura encontrada",
          },
          404
        );

      return c.json({
        customer_code: params.customer_code,
        measures: result.rows.map((r) => {
          const { customer_code, ...rest } = r;
          return rest;
        }),
      });
    } catch (e) {
      console.log(e);
      return c.json(
        {
          error_code: "INTERNAL_SERVER_ERROR",
          error_description: "Erro interno no servidor",
        },
        500
      );
    }
  }
}
