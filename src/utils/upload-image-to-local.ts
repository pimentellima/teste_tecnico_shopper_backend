import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
const writeFile = promisify(fs.writeFile);

export default async function uploadImageToLocal(imageBase64: string) {
  const uploadDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const fileName = crypto.randomUUID() + ".jpeg";
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, base64Data, "base64");
  return { fileName, filePath };
}
