---
title: "Running Zola on WebAssembly"
description: "Just because you're compiling software written in Rust doesn't mean you can't also fail to compile software written in C."
date: 2023-01-09T12:00:00-08:00

extra:
  has_opengraph: true
  opengraph_image: img/running-zola-on-wasm.png
---

The site you're reading this on is built using [Zola](https://www.getzola.org/) (unless of course you're reading this from some future date where I've decided to rebuild the site using something _other_ than Zola, in which case how's the future?) and hosted on [Vercel](https://vercel.com/) (again, unless you're reading this after that's no longer the case). One of the neat features of Vercel is first-party support for various static-site generators, including the ability to control which version is used to render your site. When I was moving this site from Netlify to Vercel, I set the `ZOLA_VERSION` environment variable to the latest available version, `0.16.1`, and was greeted with the following build log:

```
[16:16:06.599] Cloning github.com/dstaley/dstaley.com (Branch: master, Commit: fcf0f09)
[16:16:07.092] Cloning completed: 493.016ms
[16:16:07.480] Looking up build cache...
[16:16:07.773] Build Cache not found
[16:16:07.807] Running "vercel build"
[16:16:08.310] Vercel CLI 28.2.5
[16:16:08.522] Installing Zola version 0.16.1
[16:16:08.953] zola: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by zola)
[16:16:08.953] zola: /lib64/libm.so.6: version `GLIBC_2.29' not found (required by zola)
[16:16:08.953] zola: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.26' not found (required by zola)
[16:16:08.954] zola: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by zola)
[16:16:08.954] zola: /lib64/libc.so.6: version `GLIBC_2.27' not found (required by zola)
[16:16:08.954] zola: /lib64/libc.so.6: version `GLIBC_2.29' not found (required by zola)
[16:16:08.954] Error: Command "zola build" exited with 1
```

Even though Zola is written in Rust, it still relies on [glibc](https://www.gnu.org/software/libc/), the GNU C Library. The update to v15 changed how the Zola binary for Linux was built, causing it to rely on newer versions of glibc. After a few emails with Vercel's support team, I confirmed that the build environment used by Vercel only had access to glibc 2.26, hence the errors when attempting to use the latest version of Zola.

Now, at this point, I had a few options if I wanted to use the latest version of Zola to build my site, but the easiest was probably setting up my Vercel project to download a custom-built version of Zola that was built against a lower version of glibc. While it certainly would have worked, and wouldn't have been too much effort, it also wasn't a fun or interesting solution.

<video autoplay loop muted playsinline title="Scene from the 2010 film Inception in which Arthur, played by Joseph Gordon-Levitt, is seen holding a rifle before Eames, played by Tom Hardy, says 'You musn't be afraid to dream a little bigger, darling' before pulling out a grenade launcher.">
    <source src="/img/dream-a-little-bigger-darling.mp4" type="video/mp4">
</video>

Instead, I decided to see if I could compile Zola to WASM targeting the WebAssembly System Interface (WASI) and run it as a standard npm package.

Spoiler: I could!

With most Rust projects, compiling for WASI is relatively simple. You can run `cargo build --target wasm32-wasi` and get a neat `.wasm` file that will then run using WASI runtimes like [node](https://nodejs.org/api/wasi.html), [Wasmtime](https://wasmtime.dev/), [WasmEdge](https://wasmedge.org/), and more. That is, unless the Rust project you're compiling uses features that aren't available in Rust's WASI implementation (such as networking, which has _some_ support, but not enough for large libraries like [hyper](https://github.com/hyperium/hyper)). Zola, being a static site generator, heavily relies on networking support to provide the `zola serve` command, which allows you to preview your static site using a local web server. If I wanted to build a WASM version of Zola that could be used to build my site, I was going to need to remove all of the networking code.

One really neat aspect of Rust is its support for [conditional compilation](https://doc.rust-lang.org/reference/conditional-compilation.html), which allows you to exclude code from being compiled based on a number of different conditions. One of those conditions is called "features", which are basically what it says on the tin: optional features of your application. This meant that I could mark complete sections of code as relying on the `serve` feature using the `#[cfg(feature = "serve")]` attribute. By making the `serve` feature a default feature, and compiling with the `--no-default-features` flag, I could make sure that any code that relied on networking was completely disabled.

However, networking isn't the only feature of Rust that isn't available in WASI. WebAssembly is single-threaded (although support for threads [has been proposed](https://github.com/WebAssembly/wasi-threads)), so code that relied on spawning threads was also not going to work in my WASM port. The main instance of this lack of support came from [`rayon`](https://github.com/rayon-rs/rayon), which is a data parallelism library that provides parallel loops that function the same way as sequential loops in the standard library. That parity is important, as I was able to basically [provide an alternate implementation of `rayon`](https://github.com/dstaley/zola/blob/wasm/components/libs/src/no_rayon.rs) that simply used the sequential version of the method provided by `rayon`. This meant that even though the code was calling a `.par_iter_mut()` method, it was actually invoking the built-in `.iter_mut()` method.

Most features that don't work on WASI will trigger compile-time errors, making it simple to make the necessary changes to get things compiling. However, there's unfortunately some issues that are only exposed at runtime. One such issue came from a fairly innocuous looking piece of code:

```rust
pub fn is_path_in_directory(parent: &Path, path: &Path) -> Result<bool> {
    let canonical_path = path
        .canonicalize()
        .with_context(|| format!("Failed to canonicalize {}", path.display()))?;
    let canonical_parent = parent
        .canonicalize()
        .with_context(|| format!("Failed to canonicalize {}", parent.display()))?;

    Ok(canonical_path.starts_with(canonical_parent))
}
```

This piece of code checks to see if the provided `path` is contained by the provided `parent`. This is achieved by canonicalizing each path and comparing the prefixes. While the `.canonicalize()` method is provided when compiling to WASI, it will always error out since WASI [doesn't really have the concept of paths](https://github.com/rust-lang/rust/issues/82339) (at least not in the same way as most other operating systems think of them). Thankfully, the solution was to simply leave the path as is when running on WASI.

So far, most of the issues I ran into were relatively easy to fix; it simply took a moment to figure out what was causing the issue, and then tweaking the code to act a bit differently when it was running on WASI.

Unfortunately, there was a big roadblock ahead.

Zola used [`libsass`](https://github.com/sass/libsass).

For those of you who are unaware, I envy you. LibSass, like [Nokogiri](https://nokogiri.org/), is one of those dependencies that elicits long sighs from developers, primarily due to the fact that it's a C/C++ library that honestly has no business being integrated into non-C/C++ projects. It's even caused [headaches for the Zola maintainers](https://github.com/getzola/zola/issues/1535), outside the scope of my WASM port. I did make a solid effort to get it working; I played around with virtually every aspect of [WASI SDK](https://github.com/WebAssembly/wasi-sdk) in an attempt to get it to compile. The main issue I was running into was that the Rust crate [sass-rs](https://github.com/compass-rs/sass-rs) needed to link to the C++ standard library (sound familiar?). On Linux, this is usually provided by `libstdc++`. However, in WASI SDK, this is provided by `libc++`. I had to manually patch the [`build.rs`](https://github.com/compass-rs/sass-rs/blob/master/sass-sys/build.rs) file to always return `cargo:rustc-link-lib=dylib=c++` in an attempt to ensure it was linked correctly. Even though I was able to get things linking correctly on the Rust side, it would fail when compiling to WASM. As I've mentioned on this blog before I have limited patience when it comes to C code, so I eventually gave up and switched Zola's SASS implementation to [`grass`](https://github.com/connorskees/grass), a Sass compiler written purely in Rust. It worked wonderfully, and only required the [smallest of changes](https://github.com/getzola/zola/compare/master...dstaley:zola:wasm#diff-488d6d4ecac2c5b0fe08ab8b601a946dce8a2cc4283229ef195bd24582a9ebfa).

Once I had a WASM version of Zola, I then needed to wrap the module in a bit of setup code so that the node runtime could execute the module. This was (thankfully!) trivially easy. Here's the complete implementation:

```js
"use strict";
const { readFile } = require("node:fs/promises");
const { WASI } = require("wasi");
const { env } = require("node:process");
const { join } = require("node:path");

/**
 *
 * @param {string} siteDir Path to Zola site, relative to the current working directory
 * @param {string} [baseUrl]
 */
module.exports = async function build(siteDir = ".", baseUrl) {
  let args = ["zola", "--root", "/", "build"];
  if (baseUrl) {
    args = [...args, "--base-url", baseUrl];
  }
  const wasi = new WASI({
    args,
    env,
    preopens: {
      "/": join(process.cwd(), siteDir),
    },
  });
  const importObject = { wasi_snapshot_preview1: wasi.wasiImport };
  const wasm = await WebAssembly.compile(
    await readFile(join(__dirname, "zola.wasm"))
  );
  const instance = await WebAssembly.instantiate(wasm, importObject);

  wasi.start(instance);
};
```

Once this was published to npm, all I needed to do to run this on Vercel was to point a `build` script in my `package.json` to the following file:

```js
import build from "@dstaley/zola-wasm";

const baseUrl =
  process.env.VERCEL_ENV === "production"
    ? "https://dstaley.com"
    : `https://${process.env.VERCEL_URL}`;

await build(".", baseUrl);
```

I dropped that into the repo for this site, created a pull request, and was greeted with the following output in the build log on Vercel:

```
Cloning github.com/dstaley/dstaley.com (Branch: master, Commit: 78e53bf)
Cloning completed: 569.844ms
Restored build cache
Running "vercel build"
Vercel CLI 28.10.0
Installing dependencies...

up to date in 172ms

> dstaley.com@0.0.0 build
> node --experimental-wasi-unstable-preview1 build.mjs

(node:328) ExperimentalWarning: WASI is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Building site...
Checking all internal links with anchors.
> Successfully checked 0 internal link(s) with anchors.
-> Creating 6 pages (0 orphan) and 1 sections
Done in 6.2s.

Build Completed in /vercel/output [14s]
Generated build outputs:
 - Static files: 40
 - Serverless Functions: 0
 - Edge Functions: 0
Deployed outputs in 1s
Build completed. Populating build cache...
Uploading build cache [4.35 MB]...
Build cache uploaded: 887.541ms
Done with "."
```

And with that I was able to build my site using the latest version of Zola on Vercel, despite the fact that Vercel didn't have the latest version of glibc. The code for this is, of course, [available on GitHub](https://github.com/dstaley/zola/tree/wasm) and [on npm](https://www.npmjs.com/package/@dstaley/zola-wasm). Was this a good idea? No, probably not.

But it was a hell of a lot of fun.
