import crypto from "crypto";

/**

* Generate HMAC SHA256 signature
  */
  export const generateSignature = (
  payload: any,
  secret: string
  ): string => {
  const data = typeof payload === "string"
  ? payload
  : JSON.stringify(payload);

return crypto
.createHmac("sha256", secret)
.update(data)
.digest("hex");
};
