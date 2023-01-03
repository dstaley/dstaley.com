---
title: "Hello iPod, Welcome to 2023"
description: "Or, how spending four years refusing to use software written in C can actually pay off."
date: 2023-01-03T12:00:00-08:00

extra:
  has_opengraph: true
  opengraph_image: img/hello-ipod.jpg
---

My first iPod was a silver iPod mini, given to me by my mom when I was around twelve years old. It wasn't my first portable audio player (that title going to a cheap flash-based MP3 player that, to this day, I've been unable to find out the model number), but it was undoubtedly the device that sparked an infatuation that remains to this day, over seventeen years later. I've owned a few different iPods since then, ending in a PRODUCT(RED) third generation iPod nano I purchased in my freshman year of high school, which would be the last iPod I owned before the smartphone became a thing.

That is, until the summer of 2017.

At the time, I was driving a car that, despite being made in 2014, still came with a USB port that you could plug an iPod into. I had grown tired of the instability of Bluetooth, and desperately missed having album art show up on my car's display. Armed with an annoyance and a modicum of programming knowledge (a terrible combination I'm afraid), I bought a fifth generation iPod and set out to see if I could figure out how to synchronize my meticulously curated Plex music library.

When you consider the fact that the iPod has sold over 450 million devices since its introduction in 2001, you would think that there would be an abundance of ways to programmatically add music to an iPod. Unfortunately, that's not the case. Given that each subsequent generation of iPods modified the internal database structure, few projects managed to keep up with the changes enough to support later models of iPods. Even if you managed to keep up, [Apple apparently sued developers](https://arstechnica.com/gadgets/2008/11/apple-lawyers-hand-ipod-hash-cracking-site-a-dmca-notice/) for figuring out how to correctly sign the iPod's database file. That being said, there are a few options when it comes to open-source software to interface with an iPod.

**libgpod**

libgpod is a C library used in software such as [gtkpod](https://en.wikipedia.org/wiki/Gtkpod), [Rhythmbox](https://wiki.gnome.org/Apps/Rhythmbox), and [Amarok](https://amarok.kde.org/). Like most software written in C, this was an absolute nightmare to get working (for some definition of working that is). At the time I was using a macOS device, which wasn't _technically_ supported by libgod, so I guess I was setting myself up for failure there. I tried various Python bindings, and even wrote some C code at one point. Desperate, I even tried getting it to run in Docker on my MacBook, but ultimately was unsuccessful in getting everything working; if I recall correctly, the main issue I was facing was a lack of album art, which was one of the primary motivators for even undertaking this adventure in the first place.

**ipod-sharp**

[ipod-sharp](https://github.com/mono/ipod-sharp) is a C# library originally used for [Banshee](http://www.banshee-project.org/) (before it switched to libgpod). Being written in C# and targeting Mono, the original cross-platform implementation of .NET, it was my hope that it'd be relatively easy to get running on macOS. Alas, the odds were not in my favor, and I was never able to get it running in a project, largely due to its use of Linux's [HAL](<https://en.wikipedia.org/wiki/HAL_(software)>), which has been deprecated.

**AppleScript**

Desperately grasping at straws, I eventually turned to AppleScript, the built-in scripting language that's a part of macOS. AppleScript allows for automating a wide variety of applications, including iTunes. While I was ultimately successful at copying a song to my iPod, I was never able to get album art to transfer. Plus, AppleScript was a macOS-only solution, and I really wanted something that would work on Windows, which I was planning to switch to at the time.

**gnupod**

Finally, I came across [gnupod](https://www.gnu.org/software/gnupod/), a tool written in Perl. Getting this running on macOS was a chore, so I eventually decided to take the easy route and use Docker to run the scripts provided by gnupod. With a smidge of Python, I was finally able to download my music from my Plex server, convert it to an iPod-compatible format using ffmpeg, and transfer it to the iPod via gnupod. Album art, one of the main reasons I wanted to use an iPod in the first place, was finally something I could handle!

`gnupod` worked wonderfully for over a year. I ended up using it right until I got a new car, which sadly didn't support iPod connections anymore.

During my desperate search of the internet, I came across a mention on StackOverflow of an application called [SharePod](https://stackoverflow.com/questions/901319/apple-ipod-and-c-sharp). This Windows application allowed users to manage their iPods without using iTunes, and the developer had kindly provided the core management functions in an open-source library called `sharepod-lib`.

The only problem was that, contrary to the popular saying, it seemed the internet _did_ forget about sharepod-lib.

Originally uploaded to [Google Code in 2010](https://web.archive.org/web/20111028035037/code.google.com/p/sharepod-lib), `sharepod-lib` never found its way into any of the archives created of Google Code when it shut down in 2016. I combed through every possible location that might have retained a copy, even going so far as to run a paid [Twitter campaign](https://twitter.com/dstaley/status/1095488284178796545) in the hopes of tracking down someone who happened to have the repo.

Every couple of months, I'd get interested in trying to recover a copy of sharepod-lib but would never make any progress. That would change on March 22, 2022.

I can't remember what specifically made me change my search tactics, but I somehow came across the website for [SuperSync](https://supersync.com/), an application that allowed you to synchronize multiple iTunes libraries. At one point in time, SuperSync relied on `sharepod-lib` to power its iPod functionality, and given that this was a third-party application, there was a small chance that the application used the source code of `sharepod-lib` rather than the compiled DLL. So, with my fingers crossed, I emailed the creator, Brad:

> Hi there!
>
> I noticed on your license page that you mention the usage of SharePodLib, a library that required a paid license for use in commercial products. I'm curious if when you acquired a license to use SharePodLib in a commercial product, you also got access to the source code for SharePodLib? While it was open sourced at one point, I'm afraid it's been lost to time, so I've been reaching out to people known to have used it in the past in the hopes that someone has a copy of the source.

The next day, I received the following response from Brad:

> Hi Dylan,
>
> Here is a link to the two copies of the source code I have. One marked "newer" whatever that means. I think for a while I might have had a windows command line tool to connect to ipods. But gave up when Apple locked things down.
>
> https://drive.google.com/file/d/...
>
> I hope that helps!
>
> \- Brad

I can still remember my heart racing reading this email. I quickly downloaded the linked file and was greeted with the full directory structure for `sharepod-lib`, a directory structure I must have looked at hundreds of times using Wayback Machine's capture of Google Code.

I immediately made several backups, just in case.

I spent the following few weeks updating `sharepod-lib` to run on the modern, cross-platform version of .NET. Honestly, I was surprised at just how little I had to change to get things up and running. The primary changes were replacing old platform-specific libraries like SQLite and System.Drawing with modern, cross-platform versions. To ensure things worked across a variety of iPods, I amassed a [small collection of nearly every model](https://mastodon.social/@dstaley/108251051303316277). Knowing that there was finally going to be a modern, easily accessible way to manage iPods was something that really drove me over those few weeks. As a test run for the library, I built a [prototype battery benchmark](https://twitter.com/dstaley/status/1527770384723898369) that would copy a specific copyleft album to your connected iPod, create a playlist, and allow you to repeat the playlist until the battery died. The benchmark would then calculate the runtime based on the number of plays for each song, giving you an estimate of the battery life for your iPod. Once I finished updating the library, I had planned on recreating my original Plex sync application, allowing anyone to easily sync their iPod with their Plex music library, as I had done back in 2017.

Sometimes, however, motivation is a fickle thing. As life got in the way, I found myself less and less enthused about spending hours writing unit tests and modernizing parts of the library. There was also the issue of accessing the iPod's extended SysInfo, a collection of data attributes necessary for album artwork support and creating valid database hashes (without which the iPod wouldn't parse the database). On Windows, it was relatively easy to issue the appropriate SCSI INQUIRY commands using an Administrator account (the same being true for Linux), but on modern versions of macOS that capability was reserved for kernel drivers. I spent many nights fighting with libusb, a userspace USB API in an attempt to recreate enough of the USB Mass Storage protocol to obtain the information necessary but was never able to get anything working reliably despite trying to write the application in C, Go, and Rust. This roadblock considerably dampened my motivations, and eventually I stopped working on the project completely. Looking at the files on my computer, I haven't updated anything in nearly six months.

So, as they say, if you love something, set it free.

That's why I'm super excited to announce that I've made [`sharepod-lib`](https://github.com/dstaley/sharepod-lib) and its modern successor [`Clickwheel`](https://github.com/dstaley/clickwheel) available on GitHub under the Lesser GNU Public License. It's my hope that someone finds one (or both!) of them useful and as inspiring to them as it has been to me over the last several years.

I do have to give a note of warning though: it's in fairly rough shape. While there are some unit tests, most of my tests were written using disk images of my iPods, complete with copyrighted music. Because I have no desire whatsoever to have the repo removed because of a Digital Millenium Copyright Act violation, I've removed the tests that relied on copyrighted music. There are still some tests left, but I know they're not exhaustive. Clickwheel is in no way a production library, and it might never be, but I figured it'll do more good out there in the public than it would do sitting on my hard drive.

It's my hope that by releasing this to the public, there might one day be an easy-to-use library to programmatically manage your iPod.

And it won't have anything to do with C.
