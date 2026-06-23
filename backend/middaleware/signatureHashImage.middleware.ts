import crypto from "crypto";
import { normalizeImage } from "../utils/imagenormalization.utils";

export const getNormalizedImageHash = async (base64: string) => {
  const normalized = await normalizeImage(base64);

  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
};