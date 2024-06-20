---
title: "Dynamic Open Graph Images with @vercel/og and Zola"
description: "Static sites can have a little dynamic, as a treat."
date: 2024-06-20T12:00:00-07:00

extra:
  has_opengraph: true
  text_wrap: "wrap"
---

The website you're currently reading is a static site, built with the static site generator [Zola](https://www.getzola.org/). I've always been a fan of static sites. There's something lovely about the idea that it's all just a collection of HTML and CSS files that you can toss on basically any hosting service and have a website going. One of the neat things about hosting on Vercel, though, is that I can opt-in to some of their more dynamic features, even when using a static site. So, inspired by [Zach Leatherman](https://www.zachleat.com/web/automatic-opengraph/), I wanted to see if I could add support for dynamic Open Graph image generation using Vercel's [`@vercel/og`](https://vercel.com/docs/functions/og-image-generation/og-image-api) library. Spoiler alert: you can!

Whether you're using a static site generator like Zola or [Hugo](https://gohugo.io/), or a JavaScript framework like [Next.js](https://nextjs.org/) or [Astro](https://astro.build/), Vercel gives you access to [API routes](https://vercel.com/docs/functions), which are basically functions that can run in response to an incoming request. Frameworks usually have much nicer implementations (including a fancy file-based router), but static sites still can have API routes by simply dropping some JavaScript into a folder named `api` in the root of your project. When deployed to Vercel, their build system will bundle those files into separate functions and deploy them, making them available at `/api`.

However, what about local development? `zola serve` isn't going to magically understand how to invoke HTTP endpoints written in JavaScript. That's where the [Vercel CLI](https://vercel.com/docs/cli) comes into play. If you're using a known framework, running `vercel dev` inside your project will start two servers, one being your framework on a random port, and the other being a proxy server that knows how to route requests to either your API endpoints or to your framework's server. For instance, when I run `vercel dev` in the folder for this website, `vercel` runs the proxy server on port 3000, and starts the `zola` binary on port 51579. This allows me to run both Zola and Vercel Functions locally for development.

The next question that you probably have is how can you install JavaScript dependencies in a static site project that doesn't use a JavaScript package manager? Well, the answer is pretty unexciting. It's simply "use a JavaScript package manager". Even if your project is configured using a static site framework preset, Vercel is smart enough to install dependencies when it sees a `package.json` file. This is admittedly a bit weird, especially considering that the "Install Command" listed in my project's "Build & Development Settings" configuration is "None", but I'm thankful for the behavior as it allows me to install `@vercel/og`, which is the magical piece that allows me to support dynamic Open Graph images like this one:

![](/api/og?slug=posts/2024-06-20-dynamic-open-graph-images-with-vercel-og-and-zola/index.md)

So now that we know how to create API routes and install JavaScript dependencies, let's generate some Open Graph images. Dropping the following example from Vercel into `/api/og.jsx` should make the `/api/og` URL return a static "Hello, world!" image.

```tsx
import { ImageResponse } from '@vercel/og'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
        }}
      >
        Hello, World!
      </div>
    )
  )
}
```

However, if you run this locally and try to access `/api/og`, you'll get a `404 NOT_FOUND` error. This is because the Vercel CLI by itself doesn't generate API routes from files ending in `.jsx`. If you try to simply rename the file to `og.js`, you'll get `Error: Unexpected token '<'`. This makes sense given that we have JSX in a `.js` file. Ultimately, I wasn't able to figure out how to get the Vercel CLI to work well with JSX. However, at the end of the day JSX is transformed to plain JavaScript anyway, so we can just perform the transform manually. [Satori](https://github.com/vercel/satori), the underlying engine used by `@vercel/og` that renders markup to images, expects objects with a `type` property that contains a string value and a `props` property containing, well, props. This is also where the `children` prop goes. Without JSX, our example from above looks like this:

```js
import { ImageResponse } from '@vercel/og'

export function GET() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
        },
        children: 'Hello, World!'
      }
    }
  )
}
```

With this code we're now able to dynamically generate Open Graph images even though we're using a static site! There's a few other nice things I've added to my own Open Graph images. The first is a simple helper function named `h()` (real ones know) that allows me to build the image using a slightly nicer syntax than plain objects.

```js
function h(tag, props) {
  return { type: tag, props };
}
```

With `h()`, the above example looks like this:

```js
export function GET() {
  return new ImageResponse(
    h('div', {
      style: {
        display: 'flex',
        fontSize: 128,
        background: 'white',
        width: '100%',
        height: '100%',
      },
      children: 'Hello, World!'
    })
  )
}
```

Satori also supports custom fonts if you provide a font file, but I didn't want to go through the trouble of storing a font file within my repo. Thankfully, Google Fonts will happily give you a compatible font file if you ask nicely (read: using the older `/css` endpoint with a non-browser `User-Agent`). This means that with a small helper function, I'm able to load the TTF data for any font hosted by Google Fonts:

```js
function extractTTFURL(css) {
  const urlRegex = /src:\s*url\(([^)]+)\)/;

  const match = css.match(urlRegex);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

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
```

Finally, I didn't want to pass in the title via a URL parameter, mainly because I didn't want people to be able to generate arbitrary Open Graph images with my face on them (especially since generating images isn't free!). So, with a small tweak to `vercel.json` to bundle the Markdown files for posts with the function's code, I'm now able to read the frontmatter during function invocation. This means I can trivially configure how the function works via frontmatter, instead of creating an ever-growing list of URL parameters.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "api/og/index.js": {
      "includeFiles": "content/**/*.md"
    }
  }
}
```

As someone who spends a lot of time working with sites deployed on Vercel using frameworks like Next.js, it's nice to see that there's still some benefit to hosting static sites on Vercel. While I wish the documentation was better, I'm glad that Vercel makes functionality like Vercel Functions available to static sites.

If you're curious to see the full implementation, it's all [open source](https://github.com/dstaley/dstaley.com/blob/master/api/og/index.js).