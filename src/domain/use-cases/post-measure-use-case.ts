import { Context } from "hono";
import MeasuresRepository from "../repositories/measures-repository";
import { BlankEnv, BlankInput } from "hono/types";
import z from "zod";
import isSameMonthYear from "../../utils/is-same-month-year";
import uploadImageToLocal from "../../utils/upload-image-to-local";
import getImageMeasureFromGemini from "../../services/get-image-measure-from-gemini";

const schema = z.object({
  image: z.string().base64(),
  customer_code: z.string(),
  measure_datetime: z.string().datetime(),
  measure_type: z.enum(["WATER", "GAS"]),
});

export default class PostMeasureUseCase {
  constructor(private readonly manager: MeasuresRepository) {}

  public async execute(c: Context<BlankEnv, "/upload", BlankInput>) {
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

    const { image, customer_code, measure_datetime, measure_type } =
      validation.data;
      
    try {
      const customerMeasures = await this.manager.find({
        customer_code,
        measure_type,
      });

      const existingMeasureInMonth = customerMeasures.rows.some((measure) =>
        isSameMonthYear(
          new Date(measure_datetime),
          new Date(measure.measure_datetime)
        )
      );

      if (existingMeasureInMonth) {
        return c.json(
          {
            error_code: "DOUBLE_REPORT",
            error_description: "Leitura do mês já realizada",
          },
          400
        );
      }
      const { fileName, filePath } = await uploadImageToLocal(image);
      const fileUri = "http://localhost:8080/uploads/" + fileName;
      const measure_value = await getImageMeasureFromGemini(filePath);

      const measureUUID = crypto.randomUUID();
      await this.manager.create({
        customer_code,
        measure_datetime,
        measure_uuid: measureUUID,
        image_url: fileUri,
        measure_value,
        measure_type,
      });

      return c.json({
        image_url: fileUri,
        measure_value,
        measure_uuid: measureUUID,
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
