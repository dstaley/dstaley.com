//@ts-check
import { readFile } from "node:fs/promises";
import { ImageResponse } from "@vercel/og";
import yaml from "yaml";

/**
 * @typedef {ConstructorParameters<typeof ImageResponse>[0]} ReactElement
 */

const regex = /^---(?:\r?\n|\r)(?:([\s\S]*?)(?:\r?\n|\r))?---(?:\r?\n|\r|$)/;

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
 * @param {Request} request
 * @returns {Promise<ImageResponse>}
 */
export async function GET(request) {
  const fontData = await fetch(
    "https://fonts.gstatic.com/s/lilitaone/v15/i7dPIFZ9Zz-WBtRtedDbUEY.ttf"
  ).then((res) => res.arrayBuffer());

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return new Response("400 Bad Request", { status: 400 });
  }

  try {
    const fileContents = await readFile(`./content/${slug}`, "utf-8");
    const match = regex.exec(fileContents);
    const matter = yaml.parse(match[1]);

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
          fontFamily: '"Lilita One"',
        },
        children: [
          h("img", {
            src: `https://${process.env.VERCEL_URL}/img/avi.jpg`,
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
              width: "90%",
              margin: "0",
              marginLeft: "80px",
              textShadow: "10px 10px rgba(0, 0, 0, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              textWrap: "balance",
            },
            children: matter.title,
          }),
        ],
      }),
      {
        fonts: [
          {
            name: "Lilita One",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (err) {
    return new Response("500 Internal Server Error", { status: 500 });
  }
}
