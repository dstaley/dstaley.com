---
title: "Stencil and Webpack 2"
path: "2017/02/12/stencil-and-webpack-2"
description: "With the recent release of Webpack 2, I wanted to see how easy it would be to migrate Stencil to it, and if I could take advantage of automatic code splitting."
date: 2017-02-12T12:00:00-08:00

extra:
  has_opengraph: true
---

Over the past few weeks I've read a lot about code splitting, or the idea of delivering just the JavaScript needed to run the current page/route. Code splitting is an attempt to balance the benefits and drawbacks to large client-side applications. Instead of downloading and parsing all of the JavaScript for your entire application, you can deliver just a portion. As users navigate to new routes within your application, the code necessary for them is downloaded on the fly. Initial page load times are quicker thanks to less JavaScript being downloaded, but subsequent page loads of new routes have to download a small amount of JavaScript. It's all about finding a balance that's right for your application and users.

Since code splitting works by mapping modules to routes, I wanted to see if I could apply the strategy to Stencil, which already has a good one-module-per-route setup. The first step though was to upgrade to Webpack 2, which I knew had quite a few breaking changes.

## Upgrading to Webpack 2

[Annotated Commit](https://github.com/dstaley/stencil-webpack-2/commit/470b55e6557bf4f852e43cf7d7032e2249f10270)

Since some of the default Stencil dependencies rely on Webpack 1, I had to upgrade them along with Webpack.

`npm install babel-loader babel-core babel-preset-es2015 webpack karma-webpack --save-dev`

After updating dependencies, I modified the Webpack config to accommodate for breaking changes. Thankfully, the only configuration change needed was a tweak to the configuration for `babel-loader`. In Webpack 1, you could simply define the loader as `babel`, and Webpack would automatically add the `-loader` prefix. In Webpack 2, that's no longer the case, so you need to specify it manually. With that change made, I ran `stencil start` and was greeted with a fairly cryptic stack trace:

```
/Users/dstaley/.nvm/versions/node/v4.3.2/lib/node_modules/@bigcommerce/stencil-cli/node_modules/jspm/node_modules/systemjs/node_modules/es6-module-loader/dist/es6-module-loader.src.js:2712
            throw new TypeError('Illegal module name "' + name + '"');
            ^

TypeError: Illegal module name "/Users/dstaley/Desktop/stencil-error/node_modules/babel-loader/lib/index.js"
    at Loader.$__Object$defineProperty.value (/Users/dstaley/.nvm/versions/node/v4.3.2/lib/node_modules/@bigcommerce/stencil-cli/node_modules/jspm/node_modules/systemjs/node_modules/es6-module-loader/dist/es6-module-loader.src.js:2712:19)
    at Loader.loader.normalize (/Users/dstaley/.nvm/versions/node/v4.3.2/lib/node_modules/@bigcommerce/stencil-cli/node_modules/jspm/node_modules/systemjs/dist/system.src.js:1672:44)
    at Loader.loader.normalize (/Users/dstaley/.nvm/versions/node/v4.3.2/lib/node_modules/@bigcommerce/stencil-cli/node_modules/jspm/node_modules/systemjs/dist/system.src.js:1713:44)
    at Loader.loader.normalize (/Users/dstaley/.nvm/versions/node/v4.3.2/lib/node_modules/@bigcommerce/stencil-cli/node_modules/jspm/node_modules/systemjs/dist/system.src.js:2182:44)
    at Loader.import (/Users/dstaley/.nvm/versions/node/v4.3.2/lib/node_modules/@bigcommerce/stencil-cli/node_modules/jspm/node_modules/systemjs/node_modules/es6-module-loader/dist/es6-module-loader.src.js:2280:40)
    at Loader.loader.import (/Users/dstaley/.nvm/versions/node/v4.3.2/lib/node_modules/@bigcommerce/stencil-cli/node_modules/jspm/node_modules/systemjs/dist/system.src.js:103:25)
    at loadLoader (/Users/dstaley/Desktop/stencil-error/node_modules/webpack/node_modules/loader-runner/lib/loadLoader.js:3:16)
    at iteratePitchingLoaders (/Users/dstaley/Desktop/stencil-error/node_modules/webpack/node_modules/loader-runner/lib/LoaderRunner.js:169:2)
    at runLoaders (/Users/dstaley/Desktop/stencil-error/node_modules/webpack/node_modules/loader-runner/lib/LoaderRunner.js:362:2)
    at NormalModule.doBuild (/Users/dstaley/Desktop/stencil-error/node_modules/webpack/lib/NormalModule.js:129:2)
```

The thing that made this error really strange is that manually running `webpack` wouldn't trigger it; only when running `stencil start` would I encounter the error. Knowing this, I set out to figure out what Stencil was doing that would interfere with Webpack's ability to load `babel-loader`. Long story short, Stencil is using JSPM, which polyfills `System.import`. Webpack's `loader-runner` defaults to using `System.import` if it's defined, otherwise it will load things itself. The issue arose from the fact that JSPM's polyfill wasn't compatible with Webpack. Since transitioning Stencil away from JSPM wasn't what I wanted to spend my Sunday on, I decided to use a workaround that I'm honestly not very proud of: I straight up removed the `System` object from the global scope. The good news though is that it worked, and it didn't seem to break anything obvious!

After disabling the polyfill, `stencil start` was able to properly call Webpack and build the bundle! So now it was time to move on to the difficult part.

## Code Splitting

[Annotated Commit](https://github.com/dstaley/stencil-webpack-2/commit/4776bf964a35c9b2b87b54db066ad8558b9727e2)

Since Stencil already ships with a very nicely modularized structure, adding code splitting was surprisingly easy. Every page on a Stencil-based site has page type, and each page type has a module containing the functionality for that page type. The first step was to remove all the imports, and redefine them as calls to `System.import`. So this:

```js
'pages/account/orders/all': account,
```

became

```js
'pages/account/orders/all': () => System.import('./theme/account'),
```

Since `System.import` uses a network request to load the module, it returns a Promise. I had to make some slight adjustments to how Stencil invokes the module to accommodate for this:

```js
// Comment
const pageTypePromise = pages.get(templateFile);
if (pageTypePromise !== false) {
  pageTypePromise().then((PageTypeFn) => {
    const pageType = new PageTypeFn.default(context);
    pageType.context = context;
    return loader(pageType, pages);
  });
}
```

After setting up all the routes and attempting to run Stencil, I was incredibly excited to see my `main.js` bundle loaded, and then a network call for the homepage's module. Unfortunately, it was requesting the module from the root of the web server, instead of relative to the location of the entry point. After some quick Googling, I discovered that [you can manually specify the directory that contains your bundles](https://github.com/webpack/webpack/issues/3265), and Webpack will use that when requesting them. However, since Stencil uses dynamic paths for each build of your theme, I knew that manually choosing the directory wouldn't work. Thankfully, there's [a little known browser API](https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript) that will report the script element that the current script is invoking from. Like most good things in this world, [it's not available on Internet Explorer](http://caniuse.com/#feat=document-currentscript), but is available in all evergreen browsers.

```js
const scriptURL = document.currentScript.src;
__webpack_public_path__ = scriptURL.slice(0, scriptURL.lastIndexOf("/") + 1);
```

After figuring that out, I was able to successfully load modules dynamically! To confirm that code splitting was working, I used the excellent [Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) by [Chris Bateman](https://twitter.com/batemanchris). When I loaded my `main` bundle, I was a bit taken aback by the fact that Lodash represented a whopping 32% of the bundle size!

![Lodash represented 32% of the main bundle's size](/img/lodash-bundle-size.jpg)

One of the really neat things about Lodash is that it's incredibly modular, and also happens to have a very nice implementation of ES modules through [`lodash-es`](https://www.npmjs.com/package/lodash-es), where each function is exported as an ES module. There's currently [an issue with tree shaking for lodash-es](https://github.com/webpack/webpack/issues/1750), but I worked around it by importing modifying my imports to point directly to the specific file, instead of using module resolution. You can see the changes I made to several of Stencil's JavaScript files in this [annotated commit](https://github.com/dstaley/stencil-webpack-2/commit/856a5d8da20c335fcee9d5a9bde4a147d7119879).

## Results

Going into this, I wasn't really expecting massive performance improvements from code splitting. I'm mainly drawn to the idea of not loading code I'm not going to use, so I didn't perform any benchmarks. (Also the Stencil development server is quite slow because of all the extra things it does behind the scene, so I wouldn't have gotten accurate numbers anyhow.) What I did examine, however, was JavaScript bundle size. I was quite impressed with the difference! Without code splitting, my bundle was 1,941KB (397KB gzip). With code splitting, the two files necessary for the homepage totaled 851KB (202KB gzip). That's an over 49% reduction in bytes transferred, and a 56% reduction in parsed size!

The best part of code splitting is that as pages grow in functionality, you need not burden every route with the added cost of downloading and parsing a large amount of JavaScript that will never be executed. Combined with BigCommerce's aggressive fingerprinting and caching, the additional network request on page load isn't that big of a deal.

If you're curious about how to implement any of this, you can checkout the [code on GitHub](https://github.com/dstaley/stencil-webpack-2), where I've also annotated my commits. It's really important to note that this is highly experimental, and I'm not currently using it in production. In fact, I haven't even attempted to upload a theme built with code splitting, so I'm not entirely sure it'd even work. It's more of a thought experiment in how Stencil can be optimized, rather than a specific recommendation.

If you have any questions or comments about Webpack, code splitting, or Stencil, please feel free to [tweet me](https://twitter.com/dstaley)!
