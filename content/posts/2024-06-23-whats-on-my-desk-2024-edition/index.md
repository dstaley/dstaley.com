---
title: "What's On My Desk: 2024 Edition"
description: "The (frankly) absurd lengths I'll go through not to push more than one button to switch between my work and personal computers."
date: 2024-06-23T12:00:00-07:00

extra:
  has_opengraph: true
  opengraph_image: img/kvm.jpg
---

Next month is my seven-year anniversary of working from home. Since then, I've learned a lot about having a workspace that is functional, minimizes annoyance, and allows me to do my best work. The biggest thing I've learned is that while I really enjoy having a separate work and personal computer, I don't like the idea of having separate _anything else_. The idea of having to switch between a work keyboard and personal keyboard is something that I find deeply unacceptable. I'm sure it works for some people, but it's not something I could manage myself. I want one set of peripherals, shared between two computers. I want to buy high quality hardware just once and get that benefit both personally and professionally with the push of a single button. While it's taken a while to get the implementation details down, I think I've finally found something that gets me incredibly close to that ideal. I've been using most of this setup for the past two-and-a-half years and have recently made a few adjustments to eliminate some of the pain points I've run into in the past. This is my best attempt yet at a completely ludicrous work-from-home setup that is easily shared between a personal and a work computer at the push of a button.

The centerpiece of the whole setup is a Level1Techs KVM, specifically the [DisplayPort 1.4 Single Monitor – Two Computer](https://www.store.level1techs.com/products/p/14-kvm-switch-single-monitor-2computer-64pfg-7l6da) 10Gbps model. This wonderful little piece of hardware allows me to share my 4K 144Hz monitor and USB peripherals between both my work MacBook Pro and my personal desktop. Many other KVMs, especially the more affordable options, omit full DisplayPort 1.4 compatibility, which would limit me to a paltry 60Hz refresh rate. As anyone who has used a high-refresh rate display can attest, it's a difficult comfort to give up.

{{
    lazy_image(
        path='img/kvm.jpg',
        alt='To the left is the Drop BMR1 speaker, which is slender with a white mesh grille. To the right of the speaker is the KVM, sitting on top of a Thunderbolt 3 dock. On top of the KVM is a white marble pen holder, with various pens, one of which displays the Clerk logo.',
        caption='My Level1Techs KVM sitting on top of the Dell WD19TBS Thunderbolt 3 dock. On the left is the Drop BMR1 speaker. Also pictured here is an Ecobee room sensor, which helps keep my office at a tolerable temperature.'
    )
}}

Switching between computers is as easy as pressing a single button, which moves my monitor, keyboard, mouse, microphone, teleprompter, and Stream Deck between computers. If you read [my post from a year ago](/posts/pushing-buttons-with-rust/), you'll notice an interesting omission: my webcam. While resetting the USB hub every time I switched computers worked, it wasn't exactly an elegant solution. That's where the recently released Elgato Game Capture Neo comes in.

The [Game Capture Neo](https://www.elgato.com/us/en/p/game-capture-neo) works similarly to the [Elgato CamLink](https://www.elgato.com/us/en/p/cam-link-4k): it takes in an HDMI signal and presents that to the host computer as a UVC device (which most software understands as a webcam). The neat extra feature it has that the CamLink doesn't is HDMI passthrough; since this is designed to capture gaming footage, having the ability to pass the HDMI signal along to a display is useful. For me though, this allows me to connect my HDMI webcam to two computers simultaneously, without having the awkward dance of resetting the USB hub to get the CamLink working when I switch computers. I've used this setup for a week at my new job and it seems to be working reliably. There is one small issue though: the Game Capture Neo advertises a variety of compatible resolutions, both in 4:3 and 16:9 aspect ratios even when the source aspect ratio is 16:9. This means that when software requests a 640x480 resolution, the Game Capture Neo happily squishes my 16:9 video into a 4:3 container. Thankfully I've only run into one application where this is the case, but I work around this using [Camo](https://reincubate.com/camo/). Think of it as a more user-friendly OBS. Camo allows me to request only the 720p output of the Game Capture Neo and is smart enough to correctly scale that when another piece of software requests a 640x480 video stream. I use Camo in applications that expect a 640x480 output from the webcam, and the Game Capture Neo in everything else.

Speaking of video calls, I've also added an [Elgato Prompter](https://www.elgato.com/us/en/p/prompter) to the mix. I really like the idea of being able to make eye contact while on a video call (something that companies like Microsoft are going so far as to [use AI to fake](https://blogs.windows.com/devices/2020/08/20/make-a-more-personal-connection-with-eye-contact-now-generally-available/)), and the Elgato Prompter allows that by putting a specially designed reflective mirror in front of your webcam. It has a small screen that acts as an external display that you can put your video call on, which allows you to look directly into the camera lens. It's not without its faults though; I had to add a [circular polarizer](https://www.amazon.com/dp/B00XNMXNV0) to my camera to eliminate a glow that came from the screen, which darkens the image a bit. This is easily rectified with the use of two [Elgato Key Lights](https://www.elgato.com/us/en/p/key-light), which also help combat the darkness of my home office. It uses a technology called [DisplayLink](https://www.synaptics.com/products/displaylink-graphics), which allows you to connect displays over non-display protocols like USB and TCP/IP; this helps when you have a device that doesn't have any available display out ports. I've found that this isn't the most reliable thing in the world, but it's a small price to pay for the benefit I feel that it brings.

{{
    lazy_image(
        path='img/light-comparison.jpg',
        alt='Side by side comparison photo of me. The left is darker, with half of my face in shadow. The right is brighter and more colorful, especially in the background. I am wearing a black t-shirt with the Clerk wordmark.',
        caption='Before and after turning on my Elgato Key Lights. Notice how the colors are significantly warmer and brighter.'
    )
}}

For a webcam, I use a [Sony a6000](https://electronics.sony.com/imaging/interchangeable-lens-cameras/aps-c/p/ilce6000l-b) with a [Sigma 30mm f/1.4 DC DN Contemporary lens](https://www.sigmaphoto.com/30mm-f1-4-dc-dn-c). This was the camera I originally upgraded to when I became unsatisfied with the quality of typical webcams, but I switched to the Sony a5100 for its pop-up display; since the Elgato Prompter blocks the camera I decided to switch back. The a6000 also gives me the ability to control the camera via an [IR remote](https://electronics.sony.com/imaging/imaging-accessories/all-accessories/p/rmtdslr2), which is useful for adjusting settings without having to unmount the camera from the prompter to be able to see the display. I also have the camera plugged into a [Philips Hue Smart Plug](https://www.philips-hue.com/en-us/p/hue-smart-plug/046677552343), which allows it to be turned on and off without physically moving the power dial on the camera.

I've also upgraded my audio setup, switching from the Mackie CR3 monitors to the [Drop BMR1 Nearfield monitors](https://drop.com/buy/drop-bmr1-nearfield-monitors). These diminutive speakers don't have incredible reviews, but I mainly got them for their size, not their performance characteristics. This is mostly because I've recently outfitted my office with a stereo pair of the [Sonos Era 100s](https://www.sonos.com/en-us/shop/era-100), which I use to listen to music (which is the main reason I'd want good speakers anyway). The BMR1s have been sufficient for the occasional YouTube video and work wonderfully for video calls. Plus, they take up significantly less space on my desk compared to the CR3s.

Previously, I was able to connect both my work and personal computers directly to the CR3s due to them having multiple inputs. The BMR1s only have one line-in, but this is trivially solved with the [Rolls MX42 Stereo Mini Mixer](https://rolls.com/product/MX42), which is a passive device that can take in up to four stereo signals and output them over one output. This allows me to have both computers outputting simultaneously to the same set of speakers. This is convenient since it allows me to get notifications from both computers at the same time.

{{
    lazy_image(
        path='img/rolls-mx42-mixer.jpg',
        alt='The ROLLS MX42 Stereo Mini Mixer sitting on top of a black mesh grille. To the left is a burgandy backpack with the Clerk wordmark on it.',
        caption='The ROLLS MX42 Stereo Mini Mixer. Shortly after taking this photo, I realized that I had forgotten to switch the left and right channels since the Drop BMR1s expect the active unit to be on the right, but I have it placed on my left.'
    )
}}

For keyboard and mouse, I use the [Logitech MX Mechanical Mini](https://www.logitech.com/en-us/products/keyboards/mx-mechanical-mini.html) and the [MX Master 3S](https://www.logitech.com/en-us/products/mice/mx-master-3s.910-006557.html). Both connect to Logitech's wireless Bolt receiver, which allows them to switch between computers with the rest of the USB peripherals. This setup wouldn't work with Bluetooth devices, since those are bound to a specific host. I also love that the MX keyboards are designed for both Windows and macOS, with appropriate labels on the keys. Lots of other keyboards offer a Mac/PC switch, but this is usually a physical toggle on the device itself; the Logitech keyboards change their behavior based on what OS the receiver is connected to. This means that the keyboard switches between Mac and PC layouts automatically when the KVM switches between computers. No manual intervention required. This is important because the position of the Super key (Start on PC keyboards and Command on Mac keyboards) is immediately to the left and right of the spacebar on a Mac layout, whereas that key position is used for the Alt key on a PC layout. Once I get used to the layout switching, I'll probably explore building my own keyboard that has similar behavior; while I think the MX Mechanical Mini is a great keyboard, I do miss the loud "thock" of my previous keyboard, the Drop ALT.

{{
    lazy_image(
        path='img/mx-mechanical-keyboard.jpg',
        alt='Close up photo of the bottom row of keys on the Logitech MX Mechanical Mini keyboard. To the left of the keyboard is a pair of Clerk cookie socks.',
        caption='The Logitech MX Mechanical Mini keyboard, which has labels for both the Mac and PC key layout.'
    )
}}

Another new piece of desk gadgetry that I've acquired recently is the [Elgato Stream Deck +](https://www.elgato.com/us/en/p/stream-deck-plus-black). I've owned the Stream Deck Mini for several years, but I never really loved using it because it felt so chintzy; pressing the keys required more force than pushing it across my desk, meaning I had to hold it in place and press buttons. The Stream Deck + is heavier, which results in button presses requiring less force than moving it, which makes it feel more stable. The larger model also has some lovely tactile knobs that I use to control the brightness and temperature of my Key Lights, along with my system volume. I have actions setup to put my office into video call mode, which turns the webcam on, turns the Key Lights on, dims my overhead lights, and turns on a light in my hallway for some additional contrast. I'm still finding ways to integrate it into my setup; I'm pretty sure I can figure out a way to have it trigger the KVM, which would allow me to mount the KVM underneath my desk. The touchscreen to switch pages is also a nice feature, although I'd love the ability to switch pages with a knob instead.

{{ 
    lazy_image(
        path='img/stream-deck.jpg',
        alt='Close up photo of the Elgato Stream Deck +. To the right is a black hat with a black Clerk logo.',
        caption="The Elgato Stream Deck +. I'm still finding good uses for the buttons, hence why some are empty."
    )
}}

At my previous job I used the [Dell WD19TBS Thunderbolt 3 dock](https://www.bhphotovideo.com/c/product/1632006-REG/dell_wd19tbs_modular_thunderbolt_dock_with.html) with the Dell laptop they supplied. I was surprised to see that it works wonderfully with a MacBook Pro, including full 4K 144Hz DisplayPort output over the Thunderbolt 3 port. The dock doesn't have audio out, but that's fine since I usually try to use the [Apple USB-C to 3.5mm Headphone Jack adapter](https://www.apple.com/us-edu/shop/product/MW2Q3AM/A/usb-c-to-35-mm-headphone-jack-adapter) anyway. Its digital-to-analog converter is excellent, but it seems to have issues being plugged into a USB-A to USB-C adapter, which results in the DAC going completely haywire and outputting full-volume static every few hours. I switched to the [Creative Sound BlasterX G1](https://us.creative.com/p/sound-blaster/sound-blasterx-g1), which uses USB-A, and haven't had any issues.

Overall, I'm happy with the setup I've managed to assemble given the quality it results in. I get to use a great 4K 144Hz monitor, a mirrorless DSLR webcam, teleprompter, wireless keyboard and mouse, and more between both my work and personal computers, all with the push of a single button.

<details>
    <summary><h2 class="inline" id="hardware-used">Hardware Used</h2></summary>
    <ul>
        <li><a href="https://www.store.level1techs.com/products/p/14-kvm-switch-single-monitor-2computer-64pfg-7l6da">Level1Techs DisplayPort 1.4 KVM</a></li>
        <li><a href="https://www.anker.com/products/a7505">Anker 7-Port USB 3.0 Hub</a></li>
        <li><a href="https://electronics.sony.com/tv-video/gaming-monitors/all-inzone-monitors/p/sdmu27m90">Sony INZONE M9 4K HDR 144Hz Gaming Monitor</a></li>
        <li><a href="https://www.ergotron.com/en-us/products/product-details/45-669">Ergotron NX Monitor Arm</a></li>
        <li>
            Camera
            <ul>
                <li><a href="https://electronics.sony.com/imaging/interchangeable-lens-cameras/aps-c/p/ilce6000l-b">Sony a6000</a></li>
                <li><a href="https://www.sigmaphoto.com/30mm-f1-4-dc-dn-c">Sigma 30mm f/1.4 DC DN Contemporary Lens</a></li>
                <li><a href="https://www.amazon.com/dp/B00XNMXNV0">Amazon Basics Circular Polarizer Lens Filter</a></li>
                <li><a href="https://www.elgato.com/us/en/p/cam-link-4k">Elgato CamLink 4K</a></li>
                <li><a href="https://www.elgato.com/us/en/p/game-capture-neo">Elgato Game Capture Neo</a></li>
                <li><a href="https://www.elgato.com/us/en/p/prompter">Elgato Prompter</a></li>
                <li><a href="https://www.elgato.com/us/en/p/key-light">Elgato Key Light</a></li>
                <li><a href="https://www.philips-hue.com/en-us/p/hue-smart-plug/046677552343">Philips Hue Smart Plug</a></li>
                <li><a href="https://electronics.sony.com/imaging/imaging-accessories/all-accessories/p/rmtdslr2">Sony Wireless Remote</a></li>
            </ul>
        </li>
        <li>
            Audio
            <ul>
                <li><a href="https://rolls.com/product/MX42">Rolls MX42 Stereo Mini Mixer</a></li>
                <li><a href="https://drop.com/buy/drop-bmr1-nearfield-monitors">Drop BMR1 Nearfield Monitors</a></li>
                <li><a href="https://www.sonos.com/en-us/shop/era-100">Sonos Era 100</a></li>
                <li><a href="https://www.apple.com/us-edu/shop/product/MW2Q3AM/A/usb-c-to-35-mm-headphone-jack-adapter">Apple USB-C to 3.5 mm Headphone Jack Adapter</a></li>
                <li><a href="https://us.creative.com/p/sound-blaster/sound-blasterx-g1">Creative Sound BlasterX G1 USB DAC</a></li>
                <li>Elgato Wave:1 (discontinued, replaced by the <a href="https://www.elgato.com/us/en/p/wave-3-black">Wave:3</a>)</li>
                <li><a href="https://rode.com/en-us/accessories/stands-bars/psa1">RODE PSA1 Studio Arm</a></li>
            </ul>
        </li>
        <li><a href="https://www.logitech.com/en-us/products/keyboards/mx-mechanical-mini.html">Logitech MX Keys Mechanical</a></li>
        <li><a href="https://www.logitech.com/en-us/products/mice/mx-master-3s.910-006557.html">Logitech MX Master 3S</a></li>
        <li><a href="https://www.elgato.com/us/en/p/stream-deck-plus-black">Elgato Stream Deck +</a></li>
        <li><a href="https://www.bhphotovideo.com/c/product/1632006-REG/dell_wd19tbs_modular_thunderbolt_dock_with.html">Dell WD19TBS Thunderbolt Dock</a></li>
    </ul>
</details>