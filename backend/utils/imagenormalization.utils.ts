import sharp from "sharp";

/**
 * Normalize signature image:
 * - resize
 * - grayscale
 * - remove noise
 * - standard format
 */
export const normalizeImage = async (base64: string) => {
  const buffer = Buffer.from(
    base64.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const normalizedBuffer = await sharp(buffer)
    .resize(300, 150, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255 },
    })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();

  return normalizedBuffer.toString("base64");
};