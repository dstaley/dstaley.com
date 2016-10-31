---
layout: post
hasOpengraph: true
hasCode: true
title: Migrating to Stencil
subtitle: About a year ago, I helped build a new website for Marucci Sports. Almost exactly a year later, we rebuilt the site from the ground up using Stencil, a new theme framework from Bigcommerce.
---
On June 4, 2015, I managed to convince my current employer [Marucci Sports](https://maruccisports.com) to take on the audacious task of redesigning our website. Exactly four weeks later, I interviewed the amazing designer who would eventually become our Lead Web Designer, Diana Perkins. Over the next 20 weeks Diana and our marketing team created a design that would go on to win our ecommerce platform's [first ever Design Awards](https://www.bigcommerce.com/press/releases/bigcommerce-announces-2016-design-award-winners/). We launched late November of that year, just five days before Black Friday.

And this year, we raised the stakes. We rebuilt and redesigned our site in just six weeks.

Right when we began work on our site in 2015, [Bigcommerce](https://bigcommerce.com) (the ecommerce platform maruccisports.com is powered by) launched their new theme development framework [Stencil](https://stencil.bigcommerce.com/). However, at launch Stencil was missing some of the functionality we had used to create our existing site, namely custom templates for products, categories, and pages. Essentially, if we wanted to use Stencil from the beginning, we would have had to redesign everything to use the same template. This wasn't something we were okay with, so we held out on transitioning to Stencil until custom template support was added.

Thankfully, on August 31 of this year, custom template support was added to Stencil. What follows is how we took our Blueprint site and rebuilt it using Stencil.

## Getting Started

Before we could even begin with Stencil, we realized that there was one restriction we'd quickly run into. Our theme relies heavily on high-resolution imagery, stored in our codebase as massive files that are then downscaled by our image CDN [imgix](http://imgix.com/). Unfortunately, Stencil limits your theme to 50MB total, and requires you to host any files that put you above that threshold somewhere else. It would have been an absolute nightmare to keep our image files outside of our Stencil theme; it would have essentially negated all benefits we would have received from being able to run our site locally. This is where one of my favorite aspects of Stencil comes into play: it's completely open source. The code powering the local development environment and the server-side template rendering [is available on GitHub](https://github.com/bigcommerce/stencil-cli), and they even left pull requests enabled.

So, with just a few short lines of code [I sent in a pull request](https://github.com/bigcommerce/paper/pull/97) that enables theme developers to keep large files locally in their project, but reference them in a way that when in production, a remote resource is served. For instance

```handlebars
{% raw %}{{ cdn 'imgix:really-large-image.png' }}{% endraw %}
```

would become

```
/assets/cdn/imgix/really-large-image.png
```

when developing locally, and

```
https://source-name.imgix.net/really-large-image.png
```

when the theme is deployed to a store. This does mean we need to remember to deploy the `cdn/imgix` folder when we deploy our site, but it's still better than needing to deploy images just to test locally!

The other small problem we had to overcome was that when we bundled our theme with `stencil bundle`, our CDN folder would get included. We [submitted a PR to fix that as well](https://github.com/bigcommerce/stencil-cli/pull/240), but as of writing it hasn't been merged. Thankfully there's no harm in running a fork of `stencil-cli`, so that's how we're working around that for the time being.

## Getting Started (For Real This Time)

Once we figured out our image hosting strategy, we started working on migrating our theme from Blueprint to Stencil. We began by forking [Cornerstore](https://github.com/bigcommerce/stencil), Bigcommerce's showcase Stencil theme. From there, we slowly moved over each custom layout we'd designed, focusing first on pages that didn't have dynamic content. Moving the pages over was relatively simple, complicated only by the fact we were also moving from a Bootstrap-based theme to a Foundation-based one. Our previous theme used Bootstrap's grid classes, so rewriting templates and stylesheets to be more semantic was probably the most complex change we had to make.

After our static content pages were added, we focused on sprucing up dynamically generated pages like our category and product pages. However, there's one page in particular that I'm incredibly proud of, and that's the layout for our custom wood bats. Our designer, Diana, really knocked it out of the park with this layout.

<picture>
  <source media="(min-width: 1024px)" srcset="/img/custom-bat-template-desktop.png" />
  <img alt="Custom Pro customization experience" src="/img/custom-bat-template.png" />
</picture>

In the process of rewriting the custom bat layout, we also took the opportunity to upgrade our bat preview to take advantage of Stencil's new event system. In our Blueprint theme, we were listening for clicks on the individual swatches that represented the colors available.

```js
$('.productAttributeList').on('click', 'li.swatch', function(e) {
  if (e.target.tagName === 'SPAN') {
    var children =  e.currentTarget.children[0].childNodes
    var piece = children[3].dataset.option;
    var color = children[5].textContent.replace(/\s+/g, '_').toLowerCase();
    var state = {};
    state[piece] = color;
    el.setState(state);
  }
});
```

This…worked. However if you look closely you can see we're relying on a very specific order of `childNodes`. Thankfully I don't think we ever touched them, but it was still less than ideal.

In Stencil, this is a bit more elegant:

```js
utils.hooks.on('product-option-change', (event, changedOption) => {
  // this.options is a mapping of unfriendly Bigcommerce IDs to friendly values.
  if (this.options.hasOwnProperty(changedOption.name)) {
    const option = this.options[changedOption.name];
    const piece = option.name;
    const color = option.values[changedOption.value];
    canvas.set(piece, color);
  }
});
```

While the event system is a great addition, the most powerful addition to Stencil is definitely the ability to inject context data (such as the current product, category, customer, etc.) into JavaScript. That's what `this.options` is in the previous example; it's a collection of the current product's options. By giving developers access to the raw product data, you can build great experiences like our bat preview entirely on the Bigcommerce platform, no add-on needed.

One caveat to this, though, is that you don't get a lot of flexibility in what data you receive. For instance, we wanted to add previews of available colors for our products to our category pages. On a product page, you have access to the product's options, but you don't have access to this information from a category page. Because of this limitation (most likely made to reduce backend processing time), we had to build a simple off-platform API integration to get color values for a given product, and render them on a category page. This is actually the only feature on our entire site that requires something other than what you get out of the box with Bigcommerce!

<picture>
  <source media="(min-width: 1024px)" srcset="/img/category-template-desktop.png" />
  <img alt="Category page product listing with color swatches" src="/img/category-template.png" />
</picture>

Speaking of things you get out of the box, one of the big things we tried to focus on with our transition to Stencil was using native functionality instead of trying to go at it on our own. This enables us to rely more heavily on the control panel, and enable more people in the company to make minor changes like editing the order of products on our category pages. One of the largest downsides of using static category layouts was that it forced us to make and deploy even small changes like updating a price. Looking back, we should have sucked it up and figured out how to properly use Blueprint to render a list of products. If any theme developer is reading this and thinking of doing what we did and treating their category pages like a static site: don't. In Blueprint we felt we would have been restricted in how we presented our products, but we're incredibly thankful not to feel that way with Stencil. By working with the theme framework instead of against it, we were able to add things like product filters and sorting to our category pages, which in turn provides a much more engaging shopping experience to our users.

## Things I like about Stencil

There's a ton to love about Stencil, from both the store owner perspective and that of a theme developer. I think I'm a bit lucky in that I can speak from both points of view.

As a developer, the single biggest benefit that Stencil brings is a local development environment. As far as I know, Bigcommerce is *the only SaaS eCommerce platform* that is able to provide an environment like this to their developers, and it's a Really Big Deal. (Although all rendering happens locally, Stencil still requires an internet connection to retrieve live-store information. Thankfully it wouldn't be too terribly difficult to create a mock server that returns static data.)

One of the other big things that I really love about Stencil is that it feels like a tool designed for how the web is built in 2016. Stylesheets are written in SCSS; JavaScript is transpiled with Babel (and you can even add your own plugins and transforms!) and bundled with webpack (although you're free to use whatever you'd like), and templates are written in Handlebars. With our Blueprint theme, we basically designed our own build system based on Gulp, SCSS, Babel, and Nunjucks, so we felt right at home with Stencil.

The last feature of Stencil I want to mention is it's new optimized single-page checkout. On our previous site, our checkout process was part of our theme, meaning we were the only ones able to make changes to it. On Stencil, the entire checkout experience is controlled by Bigcommerce. While we lose out on the ability to control the overall design, we basically gain an entire team of product designers and developers who are dedicated to making our checkout experience the best it can be. The optimized single page checkout experience is still in beta, but once it rolls out to all our customers we're anticipating a nice decrease in our abandonment rate. One other neat thing about letting Bigcommerce control our checkout is that we were able to being accepting Apple Pay with a few button clicks!

## Things I'd like to see improved

As of writing, Stencil has only been tested on Node 4 and npm 2. I'd love to see official support for the latest LTS version of Node (v6.9.1) and npm 3 (and yarn). I tried running Stencil on Node 6 way back when it was first released, so I'm not sure if support has been improved since then.

For a locally running site, Stencil's performance doesn't seem all that great. I have a MacBook Pro with a 3 GHz Core i7 and 16GB of RAM, and my page load times are still pretty bad. The biggest bottleneck is that Stencil has to make multiple API requests to get the information it needs to render the page. There's a caching mechanism in place, but it doesn't seem to help all that much. Towards the end of our Stencil migration, we setup a Heroku app running Stencil in a Docker container. Sadly the free dyno wasn't powerful enough to run the app without timing out, so we had to move to a `standard-2x` dyno to keep response times reasonable. Even then, I had to give our team warning that the live site wouldn't be as slow.

Another aspect I think Stencil could greatly benefit from is a more robust JavaScript API client. For instance, the included `stencil-utils` library has a function `api.product.getById`. At first glance, you might think this allows you to retrieve a product as a JSON object, but by default it will return the rendered HTML of the product page. You actually need to [manually add a Handlebars component to your theme](http://stackoverflow.com/a/37976026/1492393) that emits the JSON representation of the page's context, and then pass that template to the function as a parameter. I'm glad there's at least a workaround, but it feels silly that it was necessary in the first place. Other quibbles with the JavaScript API include the inability to request product categories by ID (you have to use their URLs like `/apparel/adult`) and the opaqueness of available configuration options (like including related products in a product response).

One of the things we spent a lot of time building for our previous theme was an automated build-and-deploy system. We could run `gulp deploy --environment production` and have our latest changes live on the website in about two minutes. With Stencil, however, there's no developer-friendly deployment method. Deploying a Stencil site consists of running `stencil bundle` to create a ZIP archive containing your build artifacts, logging into your site, navigating to your store's design settings, uploading the ZIP file, waiting for it to process, selecting it, clicking apply, and then confirming your change. It's tedious to say the least, but at least there's now a way to atomically deploy a theme. Previously, we were syncing a WebDAV directory with our local repo, which resulted in about two minutes where anyone who visited the site could potentially receive a non-functional page. We mitigated this as much as possible with asset fingerprinting, but it couldn't be entirely prevented. That being said, I did spend some time reverse-engineering the Stencil theme upload process, and so far I'm able to bundle a theme and submit it for processing all from the command line. Pretty soon I think I'll be able to run `stencil bundle && gulp deploy` to deploy the site, which is an important first step to building a continuous delivery pipeline for the site.

My final suggestion is more of a "here's something that would be awesome" as opposed to "here's something that needs to be improved". I'd love to see a Stencil theme that relies heavily on client-side rendering. The beginnings are definitely there, since the `stencil-utils` package can return rendered HTML, but being able to run your entire store as an Ember or React app would be a really awesome feature.

## Closing Thoughts

Over the last several weeks, there have been a ton of moments where I really felt the benefits Stencil has brought to Marucci. I will admit, however, that a lot of our previous pain was self-inflicted because of our insistence on using static category pages. Recently I was in a meeting where we wanted to make an older product available for sale again. With a few clicks we were able to edit the product's name and description, change the category it was in, and make it available for sale. For anyone who runs a store, I'm sure that sounds like the most basic thing, but previously that change would have required opening our local repo, copy/pasting the product's nunjucks object from one category file to another, changing the information, and then deploying the site (which took a solid two minutes by the way. Two minutes every time I wanted to preview a change or debug some JavaScript.). Then, we'd still have to go into the admin panel and change the product's name so that it was the same as in the template file. To be honest, writing that all out really drives home how poor of a decision it was on my part, but it does make me that much more excited to be using Stencil!

For theme developers who are thinking about moving from Blueprint to Stencil, I say definitely get started. I wouldn't try to rush and get it done before the holiday shopping season, but it should definitely be a priority for you. The improvements it brings on just a style level alone are worth it, but the developer ergonomics really seal the deal.

If you're a merchant on Bigcommerce, especially one who is using a stock theme, I'd highly recommend taking a look at the gorgeous Stencil themes available on the [Bigcommerce Theme Store](https://www.bigcommerce.com/theme-store/). I spoke about a lot of the development benefits to Stencil, but I strongly feel that a good development experience leads to better themes with more features for merchants!

If you have any questions about our experiences with Bigcommerce or with Stencil, please feel free to [tweet me](https://twitter.com/dstaley)!
