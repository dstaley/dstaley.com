---
title: "Pushing Buttons with Rust; or, How I Spent Four Hours Automating a One Second Task"
description: "Have you tried turning it off and on again?"
date: 2023-01-23T12:00:00-08:00

extra:
  has_opengraph: true
  opengraph_image: img/pushing-buttons-with-rust.jpg
---

I've worked hard to set up my desk with the devices I enjoy using. This includes a nice monitor, a clicky mechanical keyboard with nice-looking keycaps, a webcam made out of a mirrorless camera, and a high-quality microphone. These are mostly used for my job but given how much money and effort I've spent on them, it'd be a waste not to use them for my personal use as well. My home office isn't spacious enough to support a work and personal desk, so I went with the next best thing: [a KVM switch from Level 1 Techs](https://store.level1techs.com/products/14-kvm-switch-dual-monitor-2computer) which allows me to easily switch all my peripherals from my personal computer to my work computer. I simply press a button (or a keyboard shortcut) and the KVM disconnects the peripherals from one computer and connects them to the other.

There's just one problem. The KVM does this in a way that prevents the reset of most of the peripherals. While that's sufficient most of the time, it causes issues with devices that need a full power-cycle to reinitialize. In my case, it's my [Elgato CamLink](https://www.elgato.com/en/cam-link-4k), which I use to connect my Sony a5000 as a webcam. Without a power-cycle, the CamLink fails to present itself to the host computer.

Once I figured out what the issue was, I came up with a hacky solution: put the powered USB hub on a smart outlet, and then use a button on my Elgato Stream Deck to power-cycle the hub, which in turn would power-cycle the CamLink. This has worked wonderfully for the past year, but there's still a problem.

I keep forgetting to press the dang button.

But what if I didn't need to remember? Why can't my computer just reset the hub for me when I switch from one computer to another?

At first, I had some cursed ideas, like connecting an ESP32 to the Human Interface Device port on my KVM and using that to trigger both the device switching and the hub reset. But then I realized that if my computer knew what devices were connected to it at a given moment, surely there's a way to also know when a device gets removed!

And sure enough, there is: enter the [DeviceWatcher](https://learn.microsoft.com/en-us/uwp/api/windows.devices.enumeration.devicewatcher?view=winrt-22621) API, which allows just that: receive notifications when a device is added or removed.

To use the API, I turned to the [`windows`](https://github.com/microsoft/windows-rs) Rust crate, which is a projection of the Windows API for Rust. This allows me to access all of the Windows APIs using idiomatic Rust code, and felt like a perfect small project to do on a Sunday morning.

So, without further ado, I'd like to introduce you to [`monitor-monitor`](https://github.com/dstaley/monitor-monitor), a small Windows utility to send an off/on command to a TP-Link Kasa smart plug when a monitor is added and removed! I decided that the most important device to _monitor_ was my monitor, since it's the cleanest indicator that the KVM has switched to my other computer. Using the keyboard wouldn't have worked since I regularly unplug it for cleaning, and my microphone requires that it be unplugged during software updates. I probably could have used the mouse or the CamLink, but the monitor seemed the best choice.

Now, when I press the button to switch computers, `monitor-monitor` receives an event when the monitor is removed and sends the off/on command to the smart plug. By the time the monitor has reacquired the display signal, all my peripherals are already reset and ready to go.

Now I'm free to replace that muscle memory with this gif of two very good dogs:

<video autoplay loop muted playsinline title="Clip from the Pokemon anime where the legendary dog Suicune inquisitively looks at a Yamper.">
    <source src="/img/good-dogs.mp4" type="video/mp4">
</video>
