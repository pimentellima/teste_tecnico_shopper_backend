import { Context } from "hono";
import MeasuresRepository from "../domain/repositories/measures-repository";
import GetMeasuresUseCase from "../domain/use-cases/get-measures-use-case";
import { BlankEnv, BlankInput } from "hono/types";
import PatchMeasureUseCase from "../domain/use-cases/patch-measure-use-case";
import PostMeasureUseCase from "../domain/use-cases/post-measure-use-case";

export class MeasuresController {
  async getMeasures(c: Context<BlankEnv, "/:customer_code/list", BlankInput>) {
    return await new GetMeasuresUseCase(new MeasuresRepository()).execute(c);
  }

  async patchMeasure(c: Context<BlankEnv, "/confirm", BlankInput>) {
    return await new PatchMeasureUseCase(new MeasuresRepository()).execute(c);
  }

  async postMeasure(c: Context<BlankEnv, "/upload", BlankInput>) {
    return await new PostMeasureUseCase(new MeasuresRepository()).execute(c);
  }
}
