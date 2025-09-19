// ✅ Hyphen moved to the end of the class
export const allowedTextRegex = /^[a-zA-Z\s_-]*$/;

export const sanitizeInput = (value: string) =>
  value.replace(/[^\p{L}\p{N}\s_-]/gu, "");
// \p{L} = letters, \p{N} = numbers
