//@ts-check
import { readFile } from "node:fs/promises";
import { ImageResponse } from "@vercel/og";
import yaml from "yaml";
import { format, isValid, parse } from "date-fns";

/**
 * @typedef {ConstructorParameters<typeof ImageResponse>[0]} ReactElement
 */

const BASE_URL = process.env.VERCEL_URL?.includes("localhost")
  ? `http://${process.env.VERCEL_URL}`
  : `https://${process.env.VERCEL_URL}`;

const fontCache = new Map();

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
  if (fontCache.has(name)) return fontCache.get(name);
  const url = new URL("https://fonts.googleapis.com/css");
  url.searchParams.append("family", name);

  const css = await fetch(url).then((res) => res.text());

  const ttfUrl = extractTTFURL(css);
  if (!ttfUrl) {
    throw new Error(`unable to determine TTF URL from ${css}`);
  }

  const data = await fetch(ttfUrl).then((res) => res.arrayBuffer());

  const font = { name, data };
  fontCache.set(name, font);
  return font;
}

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function GET(request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return new Response("400 Bad Request", { status: 400 });
  }

  try {
    const fileContents = await readFile(`./content/${slug}`, "utf-8");
    const match = frontmatterRegex.exec(fileContents);
    if (!match) {
      throw new Error("unable to parse frontmatter");
    }
    const matter = yaml.parse(match[1]);

    if (slug.startsWith("movies/") && !slug.endsWith("/_index.md")) {
      return buildMovieTicketImage({
        title: matter.title,
        rating: matter.extra?.rating ?? "NR",
        theater: matter.extra?.theater ?? "",
        // Keep the screening's wall-clock time independent of the server timezone.
        startTime: matter.date.slice(0, 16).replace("T", " "),
        screen: matter.extra?.screen == null ? null : String(matter.extra.screen),
        seat: matter.extra?.seat == null ? null : String(matter.extra.seat),
      });
    }

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
          fontFamily: font.name,
        },
        children: [
          matter.extra?.opengraph_image ? h("img", {
            src: `${BASE_URL}/${matter.extra.opengraph_image}`,
          }) : null,
          h("div", {
            style: {
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "#493cc0",
              opacity: 0.75
            }
          }),
          h("img", {
            src: `${BASE_URL}/img/head-and-shoulders.png`,
            width: 400,
            height: 400,
            style: {
              position: "absolute",
              bottom: 0,
              right: 0,
            },
          }),
          h("div", {
            style: {
              display: "flex",
              alignItems: "center",
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            children: [
              h("p", {
                style: {
                  width: "940px",
                  margin: "0",
                  marginLeft: "80px",
                  textShadow: "8px 8px rgba(0, 0, 0, 0.25)",
                  textTransform: "uppercase",
                  textWrap: matter.extra.text_wrap ?? "balance",
                },
                children: matter.title,
              }),
            ]
          })
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

const DEFAULT_TITLE_FONT_SIZE = 54;

/**
 * Format the deliberately timezone-less screening value without allowing the host
 * timezone to move the screening into a different day.
 *
 * @param {string} value
 */
function formatStartTime(value) {
  try {
    const start = parse(value, "yyyy-MM-dd HH:mm", new Date());
    if (!isValid(start) || format(start, "yyyy-MM-dd HH:mm") !== value) {
      throw new RangeError("Invalid start time");
    }

    return format(start, "h:mma  EEE  MM/dd/yyyy");
  } catch {
    throw new Error(`startTime must use YYYY-MM-DD HH:mm; received "${value}"`);
  }
}

/**
 *
 * @param {{
 *   title: string;
 *   rating: string;
 *   theater: string;
 *   startTime: string;
 *   screen: string | null;
 *   seat: string | null;
 * }} ticket
 * @param {{titleFontSize?: number, render?: (element: ReactElement, options: ConstructorParameters<typeof ImageResponse>[1]) => Response | Promise<Response>}} [options]
 * @returns {Promise<Response>}
 */
async function buildMovieTicketImage(
  { title, rating, theater, startTime, screen, seat },
  { titleFontSize = DEFAULT_TITLE_FONT_SIZE, render = (element, options) => new ImageResponse(element, options) } = {},
) {
  try {
    const [serifFont, sansFont, monoFont, ratingFont] = await Promise.all([
      loadGoogleFont("Instrument Serif"),
      loadGoogleFont("LINE Seed JP:700"),
      loadGoogleFont("Lekton"),
      loadGoogleFont("Bree Serif"),
    ]);
    const formattedStartTime = formatStartTime(startTime);

    const width = 640;
    const height = 480;
    const paddingX = 38;
    const paddingTop = 38;
    const paddingBottom = 51;
    const ink = "#22211f";
    const paperColor = "#F8F7F2";
    const rip = await readFile(new URL("../../static/img/rip.svg", import.meta.url), "utf8");
    const ripPath = rip.match(/<path\b[^>]*\bd="([^"]+)"/)[1];
    const paper = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="560" viewBox="-40 -40 720 560">
      <defs>
        <clipPath id="edge"><rect width="32" height="${height}"/></clipPath>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g fill="${paperColor}" filter="url(#shadow)">
        <rect x="19" width="${width - 19}" height="${height}"/>
        <g clip-path="url(#edge)">
          <path d="${ripPath}" transform="translate(${Math.round(height * 600 / 798)} 0) rotate(90) scale(${height / 798})"/>
        </g>
      </g>
    </svg>`;

    let grainSeed = 42;
    const random = () => {
      grainSeed = (Math.imul(grainSeed, 1664525) + 1013904223) >>> 0;
      return grainSeed / 4294967296;
    };
    const printWidth = width - 2 * paddingX;
    const printHeight = height - paddingTop - paddingBottom;
    const grain = Array.from({ length: 10000 }, () => {
      const x = Math.floor(random() * printWidth);
      const y = Math.floor(random() * printHeight);
      const size = 1;
      const opacity = (0.06 + random() * 0.22).toFixed(2);
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" opacity="${opacity}"/>`;
    }).join("");
    const dropouts = Array.from({ length: 23 }, () => {
      const y = Math.floor(random() * printHeight);
      const thickness = 1;
      const opacity = (0.12 + random() * 0.2).toFixed(2);
      return `<rect y="${y}" width="100%" height="${thickness}" opacity="${opacity}"/>`;
    }).join("");
    const thermalTexture = `<svg xmlns="http://www.w3.org/2000/svg" width="${printWidth}" height="${printHeight}" viewBox="0 0 ${printWidth} ${printHeight}">
      <defs>
        <linearGradient id="density">
          <stop offset="0" stop-color="${paperColor}" stop-opacity="0.03"/>
          <stop offset="0.18" stop-color="${paperColor}" stop-opacity="0.13"/>
          <stop offset="0.36" stop-color="${paperColor}" stop-opacity="0"/>
          <stop offset="0.64" stop-color="${paperColor}" stop-opacity="0.09"/>
          <stop offset="0.82" stop-color="${paperColor}" stop-opacity="0.02"/>
          <stop offset="1" stop-color="${paperColor}" stop-opacity="0.07"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#density)"/>
      <g fill="${paperColor}">${grain}${dropouts}</g>
    </svg>`;

    const detail = (label, value, font, separated = false, boxed = false) =>
      h("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: printWidth / 3,
          minWidth: 0,
          ...(separated ? {
            borderLeft: "2px solid rgba(31,30,27,.62)",
            paddingLeft: 29,
          } : {}),
        },
        children: [
          h("div", {
            style: {
              fontFamily: monoFont.name,
              fontSize: 19,
              letterSpacing: 3,
            },
            children: label,
          }),
          h("div", {
            style: {
              fontFamily: font.name,
              fontWeight: boxed ? 700 : 400,
              fontSize: 38,
              lineHeight: 1,
              textTransform: "uppercase",
              ...(boxed ? {
                backgroundColor: ink,
                color: paperColor,
                padding: 13,
                letterSpacing: -2,
              } : {}),
            },
            children: value,
          }),
        ],
      });

    const ticket = h("div", {
      style: {
        position: "relative",
        display: "flex",
        width,
        height,
        transform: "rotate(-4deg)",
        color: ink,
      },
      children: [
        h("img", {
          src: `data:image/svg+xml;base64,${Buffer.from(paper).toString("base64")}`,
          width: 720,
          height: 560,
          style: { position: "absolute", left: -40, top: -40 },
        }),
        h("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px`,
          },
          children: [
            h("div", {
              style: {
                display: "flex",
                height: 29,
                flexShrink: 0,
                borderBottom: "1px solid rgba(31,30,27,.72)",
                fontFamily: monoFont.name,
                fontSize: 20,
                letterSpacing: 4,
                lineHeight: 1,
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              },
              children: theater,
            }),
            h("div", {
              "data-ticket-part": "title",
              style: {
                display: "flex",
                marginTop: 48,
                overflow: "hidden",
                fontFamily: serifFont.name,
                fontSize: titleFontSize,
                lineHeight: `${Math.round(titleFontSize * 0.92)}px`,
                letterSpacing: 1,
                textTransform: "uppercase",
              },
              children: title,
            }),
            h("div", {
              "data-ticket-part": "details",
              style: {
                display: "flex",
                flexDirection: "column",
                marginTop: "auto",
                flexShrink: 0,
              },
              children: [
                h("div", {
                  style: {
                    fontFamily: monoFont.name,
                    fontSize: 26,
                    letterSpacing: 2,
                    lineHeight: 1,
                    whiteSpace: "pre",
                    textTransform: "uppercase",
                  },
                  children: formattedStartTime,
                }),
                h("div", {
                  style: { display: "flex", marginTop: 34 },
                  children: [
                    ...(seat ? [detail("SEAT", seat, sansFont, false, true)] : []),
                    detail("RATING", rating || "NR", ratingFont, Boolean(seat)),
                    ...(screen ? [detail("AUD", screen, monoFont, true)] : []),
                  ],
                }),
              ],
            }),
          ],
        }),
        h("img", {
          src: `data:image/svg+xml;base64,${Buffer.from(thermalTexture).toString("base64")}`,
          width: printWidth,
          height: printHeight,
          style: { position: "absolute", left: paddingX, top: paddingTop },
        }),
      ],
    });

    return await render(
      h("div", {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#3A6EA5",
        },
        children: ticket,
      }),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            ...serifFont,
            style: "normal",
            weight: 400,
          },
          {
            ...sansFont,
            style: "normal",
            weight: 700,
          },
          {
            ...monoFont,
            style: "normal",
            weight: 400,
          },
          {
            ...ratingFont,
            style: "normal",
            weight: 400,
          },
        ],
      },
    );
  } catch (err) {
    console.error(err);
    return new Response("500 Internal Server Error", { status: 500 });
  }
}
