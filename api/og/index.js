//@ts-check
import { readFile } from "node:fs/promises";
import { ImageResponse } from "@vercel/og";
import yaml from "yaml";

/**
 * @typedef {ConstructorParameters<typeof ImageResponse>[0]} ReactElement
 */

const BASE_URL = process.env.VERCEL_URL?.includes("localhost")
  ? `http://${process.env.VERCEL_URL}`
  : `https://${process.env.VERCEL_URL}`;

const frontmatterRegex =
  /^---(?:\r?\n|\r)(?:([\s\S]*?)(?:\r?\n|\r))?---(?:\r?\n|\r|$)/;

/**
 *
 * @param {string} tag
 * @param {*} props
 * @returns {ReactElement}
 */
function h(tag, props) {
  const el = { type: tag, props, key: null };
  return el;
}

/**
 *
 * @param {string} css
 * @returns
 */
function extractTTFURL(css) {
  const urlRegex = /src:\s*url\(([^)]+)\)/;

  const match = css.match(urlRegex);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 *
 * @param {string} name
 */
async function loadGoogleFont(name) {
  const url = new URL("https://fonts.googleapis.com/css");
  url.searchParams.append("family", name);

  const css = await fetch(url).then((res) => res.text());

  const ttfUrl = extractTTFURL(css);
  if (!ttfUrl) {
    throw new Error(`unable to determine TTF URL from ${css}`);
  }

  const data = await fetch(ttfUrl).then((res) => res.arrayBuffer());

  return { name, data };
}

/**
 *
 * @param {Request} request
 * @returns {Promise<ImageResponse>}
 */
export async function GET(request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return new Response("400 Bad Request", { status: 400 });
  }

  try {
    const fileContents = await readFile(`./content/${slug}`, "utf-8");
    const match = frontmatterRegex.exec(fileContents);
    const matter = yaml.parse(match[1]);

    const font = await loadGoogleFont("Lilita One");

    return new ImageResponse(
      h("div", {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          fontSize: 72,
          background: "#493cc0",
          color: "white",
          fontFamily: `"${font.name}"`,
        },
        children: [
          h("img", {
            src: `${BASE_URL}/img/avi.jpg`,
            width: "300",
            height: "300",
            style: {
              position: "absolute",
              bottom: 0,
              right: 0,
            },
          }),
          h("p", {
            style: {
              width: "1040px",
              margin: "0",
              marginLeft: "80px",
              textShadow: "8px 8px rgba(0, 0, 0, 0.25)",
              textTransform: "uppercase",
              textWrap: "balance",
            },
            children: matter.title,
          }),
        ],
      }),
      {
        fonts: [
          {
            ...font,
            style: "normal",
          },
        ],
      }
    );
  } catch (err) {
    console.error(err);
    return new Response("500 Internal Server Error", { status: 500 });
  }
}
