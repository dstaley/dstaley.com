import build from "@dstaley/zola-wasm";

const baseUrl =
  process.env.VERCEL_ENV === "production"
    ? "https://dstaley.com"
    : `https://${process.env.VERCEL_URL}`;

await build(".", baseUrl);
