---
draft: true
title: "The New Unitrack"
path: "2021/03/05/the-new-unitrack"
description: "The exciting tale of how I started to build a Flutter app but ended up with three Dart libraries instead"
date: 2021-03-05

extra:
  has_opengraph: true
---

In December of 2017, I came to the same conclusion that [Wirecutter](https://www.nytimes.com/wirecutter/reviews/best-package-tracking-app-for-ios-and-macos/) came to in October of 2020:

<blockquote>
[T]here simply aren’t any well-designed, fully functional, good-looking package tracking apps in the Google Play store.
<cite>Guy, Nick. “The Best Package Tracking App for iOS and macOS.” Wirecutter. New York Times, October 22, 2020.</cite>
</blockquote>

So, I did what

I built [Unitrack](https://getunitrack.com), a simple progressive web app that helps you keep track of your shipments. It has no ads, no fancy email injestion, and tries to focus on doing just one thing really well: telling you what's up with your packages.

At first, Unitrack only stored shipments on your device. In the initial commit, I was persisting tracking data locally on your device using `localStorage`. This solution worked pretty well, especially given that many people are only tracking a handful of shipments at any given time, but it was really annoying that I had to add shipments on both my computer and my phone. Unitrack had no way to share shipment information between devices, so about a month after I launched Unitrack, I switched from `localStorage` to [PouchDB](https://pouchdb.com/).

PouchDb, for those of you unaware, is essentially a client-side implementation of CouchDB. You could use PouchDB offline, but you could also replicate it to a CouchDB instance. Once I had CouchDB setup, syncing with PouchDB worked wonderfully! Well, unless you were using iOS that is. I was uing PouchDB's `IndexedDB` adapter, which [was broken](https://github.com/pouchdb/pouchdb/issues/7057) on iOS until PouchDB v7, released in late June of 2018. While iOS's PWA support was essentially non-existant, I wanted to make sure that Unitrack worked on the OS that represented almost half of the smartphone market in the United States.

While researching alternatives to PouchDB, I came across [Kinto](https://www.kinto-storage.org/), a project from Mozilla that was being used to back [Firefox Sync](https://www.mozilla.org/en-US/firefox/sync/). With an endorsement like that, I knew it was worth checking out. I was particularly excited about the fact that it wasn't a product from a company that was going to disappear in a few months when venture capital ran out, and that it wasn't some incredibly bespoke data storage solution tied to a specific provider like [Firebase](https://firebase.google.com/) or [Amplify](https://aws.amazon.com/amplify/). The biggest feature that peaked my interest, though, was the fact that Kinto was designed for offline-first interaction; that is, Kinto would work on your device without being connected to a server. I really liked the idea of providing an app that worked without sending your shipments to a server by default, and allowed you to opt-in to sync. Kinto looked to be a great fit, and I implemented it in July of 2018.

Adding Kinto's JavaScript library [`kinto.js`](https://github.com/Kinto/kinto.js) was pretty easy since the API was quite close to what I already had with PouchDB. The biggest complication, however, was that the JavaScript library was published as a polyfilled, ES5 CommonJS module, meaning I was importing and parsing a ton of extra code that I didn't need since I was targeting modern browsers. The version I used, v11.1.2, was [61 kB](https://bundlephobia.com/result?p=kinto@11.1.2) minified and gzipped. By using Rollup and removing all the unnecessary polyfills, I was able to make a version of `kinto` that was only 18 kB minified and gzipped. That's a huge amount of unnecessary code!

I figured that since I had already proven there were dramatic bundle size savings to be had, I should try to upstream those changes. I [opened an issue](https://github.com/Kinto/kinto.js/issues/987) to get the conversation going.

It was also around this time that I started falling in love with [TypeScript](https://www.typescriptlang.org/). So, I proposed switching from the complex Babel and Browserify setup to something a bit leaner: a combination of TypeScript and Rollup. [That RFC](https://github.com/Kinto/kinto.js/issues/999) was published on June 24, 2019, and would kick off a string of pull requests over the following 10 months.
