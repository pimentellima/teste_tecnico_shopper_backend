import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import { MeasuresController } from "./controller/MeasuresController";

config();
const app = new Hono();
const port = 8080;

app.use("/uploads/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
  return c.text(`Servidor rodando na porta ${port}`);
});
app.post("/upload", new MeasuresController().postMeasure);
app.patch("/confirm", new MeasuresController().patchMeasure);
app.get("/:customer_code/list", new MeasuresController().getMeasures);

serve({
  fetch: app.fetch,
  port,
});
