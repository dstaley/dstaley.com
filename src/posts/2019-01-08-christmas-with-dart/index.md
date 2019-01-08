---
layout: post
hasOpengraph: true
hasCode: true
title: Christmas with Dart
slug: christmas-with-dart
subtitle: The exciting tale of how I started to build a Flutter app but ended up with three Dart libraries instead
date: "2019-01-08T00:00:00Z"
---

Over the Christmas holiday, I sat down to work on a project I've been attempting to get going for several months now. I'm a light [Pinboard](https://pinboard.in) user, and I'd love a minimal Pinboard client for Android that makes it easy to bookmark sites I find for safe keeping. Recently, Google's [Flutter](https://flutter.io/) released their first 1.0 release, so I decided to take a look in lieu of reaching for my typical choice of React Native.

First off, I didn't really understand what made Flutter impressive until I learned more about what Flutter actually is. Essentially, Flutter is a natively-compiled version of [Skia](https://skia.org/), a 2D graphics library used in Chrome, Firefox, Android, and more. Paired with Skia is an ahead-of-time compiled version of a Dart application that communicates with Skia to draw your applications UI. Flutter also handles integrating things like native platform widgets that would be cumbersome to recreate in Skia (like Google Maps embeds or a WebView). When you stop and think about it, Flutter is almost like a web browser in that it executes arbitrary UI code and renders it, while also connecting to the underlying platform.

It's basically a native version of Electron. Basically. If you squint enough.

What makes me most excited about Flutter is the [Flutter Desktop Embedding Engine](https://github.com/google/flutter-desktop-embedding), which provides a way to run Skia and Flutter on virtually any platform. I don't think it's quite ready for people to start building with it yet, but pretty soon you'll be able to run Flutter apps on Android, iOS, Windows, macOS, and Linux using 100% native code. While I don't think this will completely displace Electron, I can easily see it becoming a better choice for smaller, desktop-focused applications.

## But what about Dart?

Flutter uses [Dart](https://www.dartlang.org/), a programming language with a, well, complicated past. In its most recent incarnation, however, there's quite a bit to like about Dart! Coming from a web development background, Dart is probably the most JavaScript-like typed language outside of TypeScript. I felt productive right away, and didn't feel the need to read a bunch of tutorials or watch a bunch of videos before building things I was proud of.

### Things I liked

#### It's like JavaScript, but with types!

First and foremost, Dart is a typed language. But like many newer typed languages, it _feels_ much more like a dynamic language. For example, the following is totally valid Dart code:

```dart
var users = [
    {'id': 1, 'name': 'Dylan'},
    {'id': 2, 'name': 'Josh'},
];
```

`users` is inferred to be `List<Map<String, Object>>`, without having to declare that beforehand.

One interesting aspect of this is Dart's `dynamic` type, which is essentially TypeScript's `any`. It allows you to pass any type you want around, and is basically an escape hatch from the type system. However, it's important to minimize the use of `dynamic` in your code since you really want to benefit from Dart's type system.

#### An incredible out-of-the-box experience

Another aspect of Dart that really blew me away was the development experience that the community has rallied around. Dart has a neat package called [`stagehand`](https://pub.dartlang.org/packages/stagehand) that handles project scaffolding, which provides nice things like package management with `pub`, testing with Dart's `test` package, and a package structure that makes it easy to create quality package pages for [Pub](https://pub.dartlang.org/), Dart's package repository. Compared to JavaScript, creating and publishing a well-tested Dart package was a breeze.

#### Code Generation

Dart also has some excellent packages for code generation, including the really nifty [`code_builder`](https://pub.dartlang.org/packages/code_builder), which provides a typed API for building Dart code.

````dart
/// Outputs:
///
/// ```dart
/// class Animal extends Organism {
///   void eat() => print('Yum!');
/// }
/// ```
String animalClass() {
  final animal = Class((b) => b
    ..name = 'Animal'
    ..extend = refer('Organism')
    ..methods.add(Method.returnsVoid((b) => b
      ..name = 'eat'
      ..body = refer('print').call([literalString('Yum!')]).code)));
  return _dartfmt.format('${animal.accept(DartEmitter())}');
}
````

#### Dart compiles to JavaScript

I will admit that Dart's ability to compile to JavaScript is really cool, but in the current environment, I don't really think it's that compelling of a feature. TypeScript provides all the same type guarantees, and manages to have a much more robust and expressive type system as well. However, this will definitely come in handy when [Hummingbird](https://medium.com/flutter-io/hummingbird-building-flutter-for-the-web-e687c2a023a8), a port of Flutter to the web, launches.

### Things I wish were better

#### JSON support

One of the first snags I ran into with Dart was its JSON support. On Dart's [Language Tour](https://www.dartlang.org/guides/libraries/library-tour#decoding-and-encoding-json), the following sample is provided:

```dart
var jsonString = '''
  [
    {"score": 40},
    {"score": 80}
  ]
''';

var scores = jsonDecode(jsonString);
```

Looks easy enough, right? Well, the type of `scores` is actually `dynamic` as opposed to the expected `List<Map<String, int>>`, and needs to be casted to `List`. Even after casting, however, the type is still `List<dynamic>`, which means that calling `int` methods requires an additional cast:

```dart
var jsonString = '''
  [
    {"score": 40},
    {"score": 80}
  ]
''';

var scores = jsonDecode(jsonString) as List;
scores.forEach((s) {
    print((s['score'] as int).abs());
});
```

Well, what if instead of casting to List, I cast to `List<Map<String, int>>`?

```dart
var jsonString = '''
  [
    {"score": 40},
    {"score": 80}
  ]
''';

var scores = jsonDecode(jsonString) as List<Map<String, int>>;
scores.forEach((s) {
    print(s['score'].abs());
});
```

The above code compiles, but throws a runtime error:

```
type 'List<dynamic>' is not a subtype of type 'List<Map<String, int>>' in type cast
```

For comparison, here's how Go handles a similar situation:

```go
var jsonString = []byte(`[
    {"score": 40},
    {"score": 80}
]`)
var scores []map[string]int
_ = json.Unmarshal(jsonString, &scores)
for _, s := range scores {
    fmt.Println(s["score"])
}
```

Go's excellent JSON library allows decoding JSON into arbitrarily complex objects. Its superiority is even more obvious when you consider how much ceremony is required from Dart in order to decode more complex objects. Here's how Go handles decoding a suggested tag response from Pinboard:

```go
var jsonString = []byte(`
  [
    {"popular": ["tech", "programming"]},
    {"recommended": ["compsci"]}
  ]
`)
var response []map[string][]string
_ = json.Unmarshal(jsonString, &response)
for _, s := range response {
    fmt.Println(s)
}
```

And here's the Dart version:

```dart
var jsonString = '''
  [
    {"popular": ["tech", "programming"]},
    {"recommended": ["compsci"]}
  ]
''';
var response = jsonDecode(jsonString) as List;
var result = response
    .map((i) => (i as Map).map((dynamic key, dynamic value) =>
        MapEntry<String, List<String>>(key, List<String>.from(value))))
    .toList();
print(result);
```

And finally, here's a complete Go program to decode a Pinboard Post:

```go
package main

import (
  "encoding/json"
  "fmt"
  "log"
)

type Post struct {
  Href, Description, Extended, Meta, Hash, Time, Shared, Toread, Tags string
}

func main() {
  var jsonString = []byte(`
    {
        "href": "https://date-fns.org/",
        "description": "date-fns - modern JavaScript date utility library",
        "extended": "",
        "meta": "0c4f66fb2dd90d6feeab250a9640d8f4",
        "hash": "680e1c195c9be62896b1bc5875f89453",
        "time": "2018-10-19T03:36:58Z",
        "shared": "yes",
        "toread": "no",
        "tags": "javascript"
      }
  `)
  var post Post
  err := json.Unmarshal(jsonString, &post)
  if err != nil {
    log.Fatal(err)
  }
  fmt.Printf("%+v\n", post)
}
```

And here's the Dart version:

```dart
import 'dart:convert';

class Post {
  String href, description, extended, meta, hash, time, shared, toread, tags;

  Post({
    this.href,
    this.description,
    this.extended,
    this.meta,
    this.hash,
    this.time,
    this.shared,
    this.toread,
    this.tags,
  });

  factory Post.fromJson(Map<String, Object> json) {
    return Post(
      href: json['href'],
      description: json['description'],
      extended: json['extended'],
      meta: json['meta'],
      hash: json['hash'],
      time: json['time'],
      shared: json['shared'],
      toread: json['toread'],
      tags: json['tags'],
    );
  }
}

void main() {
  var jsonString = '''
  {
    "href": "https://date-fns.org/",
    "description": "date-fns - modern JavaScript date utility library",
    "extended": "",
    "meta": "0c4f66fb2dd90d6feeab250a9640d8f4",
    "hash": "680e1c195c9be62896b1bc5875f89453",
    "time": "2018-10-19T03:36:58Z",
    "shared": "yes",
    "toread": "no",
    "tags": "javascript"
  }
''';

  var decodedJson = jsonDecode(jsonString);
  var post = Post.fromJson(decodedJson);
  print(post);
}
```

While the Dart version seems not too bad aside from the verbosity, it really gets out of hand once you're decoding complex, deeply nested structures. It'd be great if converting JSON to a class in Dart was as simple as it is in Go.

#### Non-nullable types

Believe it or not, the following Dart program compiles just fine:

```dart
String mockingCase(String message) {
  return message
      .split('')
      .asMap()
      .map((i, letter) {
        return MapEntry<int, String>(
          i,
          i % 2 == 0 ? letter : letter.toUpperCase(),
        );
      })
      .values
      .join('');
}

void main() {
  print(mockingCase(null));
}
```

This is because the `String` type is nullable, meaning it can be `String` or `null`. With Dart, the compiler doesn't warn you when you pass `null` into a function that requires a valid type, nor does it require you to check that your input isn't null. Thankfully there's [a proposal](https://github.com/dart-lang/language/blob/master/working/0110-incremental-sound-nnbd/roadmap.md) in the works to add non-nullable types to Dart.

## Building with Dart

Remember a few minutes ago when I mentioned building a Pinboard app with Flutter? Well, it started with building a Pinboard API client in Dart. When I got done building the client and writing the tests, I wanted to check if my tests appropriately covered all the code I had written. Unfortunately, there isn't a great library like [`nyc`](https://www.npmjs.com/package/nyc) in JavaScript to generate coverage reports.

So, I wrote one myself.

[`duvet`](https://pub.dartlang.org/packages/duvet) is a test coverage report library that uses the `test` package to run your tests, collect coverage with `coverage`, and generate a nice-looking coverage report.

![Screenshot of a duvet coverage report](/img/duvet.png)

However, while building `duvet`, I realized I needed something to help me generate HTML documents. There didn't seem to be anything out there that I really liked, so I again took inspiration from the JavaScript ecosystem and built [`hyper`](https://pub.dartlang.org/packages/hyper), a simple way to build HTML documents with Dart. Here's what it looks like:

```dart
var fullHtmlDoc = hyper(
    'html', children: [
      hyper('head', children: [
        hyper('title', children: [
          t('Hello, world!'),
        ])
      ]),
      hyper('body', children: [
        hyper(
          'h1',
          attrs: {'class': "greeting"},
          children: [
            t('Hello from Hyper!'),
          ],
        )
      ]),
    ],
);
```

Using the previously mentioned [`code_builder`](https://pub.dartlang.org/packages/code_builder) package, I was also able to generate an API that matches the HTML specification to give a little more safety to building HTML:

```dart
var a = h.a(
    href: 'https://google.com',
    children: [
        t('Click me!'),
    ],
);
// <a href="https://google.com">Click me!</a>
```

[`hyper`](https://pub.dartlang.org/packages/hyper) was heavily inspired by the excellent [`HyperScript`](https://github.com/hyperhype/hyperscript) library for JavaScript.

With `duvet` and `hyper`, I was then able to calculate coverage for my [Pinboard API client](https://pub.dartlang.org/packages/pinboard) (the third and final library in this grand adventure into Dart). It was nice to see so many green bars!

## So, what's next?

After my experience with Dart, I came away impressed and excited for what it means for the future: an expressive, accessible, ahead-of-time compiled, type-safe language that runs on virtually every platform. Combined with Flutter's web-like approach to cross-platform support, I honestly think that both Dart and Flutter have an exciting amount of potential going forward.

Now maybe I can finally get around to writing that Pinboard client.
