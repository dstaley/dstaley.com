---
title: "Tailscale on Kobo Sage"
description: "It's basically a rite of passage for Tailscale users to put Tailscale on the weirdest device they own."
date: 2021-11-22T12:00:00-08:00

extra:
  has_opengraph: true
---

Last month, Rakuten finally released a reasonably-sized Kobo with USB C, the Kobo Sage. One of the most fascinating things about the Kobo eReaders (compared to the Kindle eReaders) is that they run a user-modifiable version of Linux, meaning you're free to do all sorts of weird and wild things with them.

So I decided to put [Tailscale](https://tailscale.com) on my Kobo Sage.

Tailscale is an easy-to-use VPN(ish) service that allows you to connect multiple devices over the internet to a secure, shared network. Since it's is distributed as statically-compiled binaries (thanks Go!), getting Tailscale downloaded and running on Kobo Sage was as easy as downloading the binaries, copying them to the onboard storage (since the root filesystem is only about 300 MB), symlinking them into a `$PATH` friendly folder, and running `tailscaled`.

```sh
wget https://pkgs.tailscale.com/stable/tailscale_1.18.0_arm.tgz
tar -xzf tailscale_1.18.0_arm.tgz
mv tailscale_1.18.0_arm/tailscaled /mnt/onboard
mv tailscale_1.18.0_arm/tailscale /mnt/onboard
ln -s /mnt/onboard/tailscale /usr/bin/tailscale
ln -s /mnt/onboard/tailscaled /usr/bin/tailscaled
rm -rf tailscale_1.18.0_arm
rm tailscale_1.18.0_arm.tgz
tailscaled
```

However, if you were to do this, you'll be greeted with this:

```
wgengine.NewUserspaceEngine(tun "tailscale0") error: exec: "iptables": executable file not found in $PATH
wgengine.New: exec: "iptables": executable file not found in $PATH
```

While the Linux 4.9 kernel used by Kobo Sage supports `iptables`, the actual binary is nowhere to be found on the device. Thankfully, acquiring a suitable binary isn't too terribly difficult.

## Getting `iptables`

Unfortunately, there's no officially distributed pre-compiled binaries of `iptables`. So, we can either compile from source (either [on a 32-bit ARM device](https://gist.github.com/dstaley/49477b0f12ff79156bb02318ecdce028) or via cross-compilation), or we can yank the binary out of an image of a 32-bit ARM Linux distro. We need a distro that's old enough to be using `glibc` version less than 2.19, so the best choice I came up with was the July 5, 2017 release of Raspbian, the last to be based on Debian 8 (codename `jessie`).

Using 7zip for Windows, I extracted the following files from the disk image:

- `/sbin/xtables-multi`
- `/lib/libip4tc.so.0.1.0`
- `/lib/libip6tc.so.0.1.0`
- `/lib/libxtables.so.10.0.0`

_Note: You can also extract these files on Linux, but it's [a bit more complicated](https://stackoverflow.com/questions/40356259/mount-linux-image-in-docker-container)._

Now that we had a binary, it was time to put it on the device.

## Installing `iptables`

Out of the box, Kobo Sage doesn't support `ssh`, but it does support `telnet` after [enabliing dev mode](https://goodereader.com/blog/kobo-ereader-news/how-to-access-the-secret-kobo-developer-options). Since I couldn't use `scp` to copy files to the device, I ran a web server on my computer, and downloaded the files with `wget`:

```sh
wget http://callisto.localdomain:8000/xtables-multi
wget http://callisto.localdomain:8000/libip4tc.so.0.1.0
wget http://callisto.localdomain:8000/libip6tc.so.0.1.0
wget http://callisto.localdomain:8000/libxtables.so.10.0.0
```

Once I had the files, I was able to move them into the appropriate locations:

```sh
mv xtables-multi /sbin
mv libip4tc.so.0.1.0 /lib
mv libip6tc.so.0.1.0 /lib
mv libxtables.so.10.0.0 /lib
```

Since we need `iptables` in `$PATH`, I created a symlink in `/sbin`:

```sh
cd /sbin
ln -s xtables-multi iptables
```

We also need symlinks for the libraries, so I ran the following in `/lib`:

```sh
ln -s libxtables.so.10.0.0 libxtables.so.10
ln -s libip4tc.so.0.1.0 libip4tc.so.0
ln -s libip6tc.so.0.1.0 libip6tc.so.0
chmod 755 libxtables.so.10.0.0
chmod 755 libip4tc.so.0
chmod 755 libip6tc.so.0
```

Once I had the binary and libraries in the right spots, I was able to confirm that `iptables` worked:

```sh
iptables --version
```

## Testing Tailscale

With the `iptables` binary working, confirming Tailscale works was the next step. By default `tailscaled` stores some state in `/var/lib`, which the Kobo doesn't like. So, for the purposes of testing, I just manually told `tailscaled` to store its state in a file at the root directory.

```sh
tailscaled --state=tailscaled.state
```

In another telnet session, I was able to bring Tailscale up with

```sh
tailscale up
```

After authenticating, the final step was to open a Tailscale-only URL in the Kobo's experimental web browser to confirm that I was, indeed, connected to my Tailscale network!

<a href="/img/tailscale-on-kobo.jpg">
    <img
        alt="Kobo Sage displaying a webpage with the heading You're connected over Tailscale"
        loading="lazy"
        srcset="
            {{ resize_image(path='img/tailscale-on-kobo.jpg', width=800, op='fit_width') }},
            {{ resize_image(path='img/tailscale-on-kobo.jpg', width=1600, op='fit_width') }} 2x
        "
        src="{{ resize_image(path='img/tailscale-on-kobo.jpg', width=800, op='fit_width') }}"
        width="800"
        height="1066"
    />
</a>

## Staying Connected to Tailscale

Getting Tailscale up and running wasn't as smooth as on a typical Linux device, but _staying connected_ to Tailscale is an even trickier thing to do. Kobo Sage doesn't have `systemd`, so we can't use the included service definition provided by Tailscale. To further complicate matters, if we try to hook into the lower levels of the OS and make a mistake, we can end up with a bricked device that's unable to be recovered. Thankfully, there's been a ton of exploration in this area by other developers (shoutout to the [Kobo Developer's Corner on the MobileRead Forums](https://www.mobileread.com/forums/forumdisplay.php?f=247)), and the generally agreed upon way of running things at boot is by [using the udev system](https://www.mobileread.com/forums/showpost.php?p=4166247&postcount=2). This allows us not only to hook into a startup event, but also into events that are triggered when Kobo Sage connects to and disconnects from WiFi. This allows us to run `tailscale up` when we have an internet connection, and `tailscale down` when we lose the connection.

To start, I defined the udev rules in a file named `98-tailscale.rules` in `/etc/udev/rules.d`

```
KERNEL=="loop0", RUN+="/usr/local/dstaley/boot.sh"
KERNEL=="wlan*", ACTION=="add", RUN+="/usr/local/dstaley/on-wlan-up.sh"
KERNEL=="wlan*", ACTION=="remove", RUN+="/usr/local/dstaley/on-wlan-down.sh"
```

The `KERNEL=="loop0"` rule runs roughly at boot, so that's where I start `tailscaled`. The next two rules are for when the WiFi is brought up and torn down respectively.

The script for starting `tailscaled` is straightforward. The catch, though (and with Kobo there's _always_ a catch), is that the OS will normally kill long-running tasks spawned by udev. To circumvent that, I used a combination of `renice` and `setsid` to ensure that `tailscaled` isn't killed off.

The `boot.sh` script contains the following:

```sh
#!/bin/sh

# Start by renicing ourselves to a neutral value, to avoid any mishap...
renice 0 -p $$

# Launch in the background, with a clean env, after a setsid call to make very very sure udev won't kill us ;).
env -i -- setsid /usr/local/dstaley/on-boot.sh &

# Done :)
exit 0
```

This script runs `on-boot.sh` in the background. That script contains:

```sh
#!/bin/sh

# make absolutely sure that iptables is in the PATH
export PATH=/usr/sbin:/usr/bin:$PATH

# make sure /mnt/onboard is mounted
timeout 5 sh -c "while ! grep /mnt/onboard /proc/mounts; do sleep 0.1; done"
if [[ $? -eq 143 ]]; then
    exit 1
fi

case "$(pidof tailscaled | wc -w)" in
0) tailscaled --state=/tailscaled.state &> /tailscaled.log &
   ;;
esac

exit 0
```

Since we're not starting a long running process on connecting and disconnecting to WiFi, the scripts `on-wlan-up.sh` and `on-wlan-down.sh` only contain a single command: `tailscale up` and `tailscale down` respectively.

After placing these files in their new homes and rebooting, I can now access my Kobo Sage via my Tailscale network! This also means that I can access other devices on my network, which will come in handy in the future when I want to do things like backup my notebooks to my NAS at home.

## Other Kobo Devices

Since Rakuten reuses a lot of the same software for all of their Kobo devices, there's a decent chance that these steps will work on any Kobo. If you do decide to go that route, you'll need to verify that your Kobo's kernel was compiled with `iptables` support, and that the included glibc version is at least equal to the glibc version used to compile the `iptables` binary.
