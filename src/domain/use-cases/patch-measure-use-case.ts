import { Context } from "hono";
import MeasuresRepository from "../repositories/measures-repository";
import { BlankEnv, BlankInput } from "hono/types";
import z from "zod";

const schema = z.object({
  measure_uuid: z.string().uuid(),
  confirmed_value: z.string(),
});

export default class PatchMeasureUseCase {
  constructor(private readonly manager: MeasuresRepository) {}

  public async execute(
    c: Context<BlankEnv, "/confirm", BlankInput>
  ) {
    const validation = schema.safeParse(await c.req.json());
    if (validation.error) {
      return c.json(
        {
          error_code: "INVALID_DATA",
          error_description:
            "Os dados fornecidos no corpo da requisição são inválidos",
        },
        400
      );
    }

    const { confirmed_value, measure_uuid } = validation.data;

    try {
      const result = await this.manager.findById(measure_uuid);

      if (result.rows.length === 0) {
        return c.json(
          {
            error_code: "MEASURE_NOT_FOUND",
            error_description: "Leitura não encontrada",
          },
          404
        );
      }
      if (result.rows[0].has_confirmed) {
        return c.json(
          {
            error_code: "CONFIRMATION_DUPLICATE",
            error_description: "Leitura já confirmada",
          },
          409
        );
      }

      await this.manager.updateValue(measure_uuid, confirmed_value);

      return c.json({
        success: true,
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
