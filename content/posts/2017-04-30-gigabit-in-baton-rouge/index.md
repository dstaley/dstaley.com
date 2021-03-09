---
title: "Gigabit in Baton Rouge"
path: "2017/04/30/gigabit-in-baton-rouge"
description: "My ISP wouldn't give me a list of where they were providing gigabit internet. So I made my own."
date: 2017-04-30T12:00:00-08:00

extra:
  has_opengraph: true
---

A few days ago, I asked my ISP what I thought was a simple question:

<blockquote class="twitter-tweet" data-lang="en">
  <p lang="en" dir="ltr"><a href="https://twitter.com/CoxHelp">@CoxHelp</a> I’m trying to find out where in my city Cox is offering Gigablast internet. Who can I reach out to that would be able to help me?</p>
  &mdash; Dylan Staley (@dstaley) <a href="https://twitter.com/dstaley/status/856967438621081600">April 25, 2017</a>
</blockquote>

The response I received pointed me towards a page on Cox's website that allows you to enter an address to see if it had access to Gigablast, Cox's gigabit internet service. Since I was more curious about the areas in which gigabit was offered (as opposed to a single address), I tried several more times to get in touch with someone at Cox who might be able to provide a list of neighborhoods.

![Cox's entirely unhelpful response when asked for a list of addresses that have gigabit internet.](/img/ugh-seriously-cox.png)

According to the five separate Cox representatives I spoke with, the only way to figure out where Cox is offering gigabit internet is to put addresses into their website, one by one.

So, I did. I checked whether Cox was offering gigabit internet for all 168,000 addresses listed in the city's [Open Data portal](https://data.brla.gov/Housing-and-Development/Street-Address-Listing/6fyg-p3r9).

After checking every address in the parish, I was incredibly surprised by how difficult it apparently was for Cox to give me a list of neighborhoods considering that such a list would have only been _two neighborhoods long_. In the almost two years since Cox [announced the availability of their gigabit service](http://www.prnewswire.com/news-releases/cox-communications-launches-gigabit-internet-service-in-louisiana-300118022.html) at a ceremony in a neighborhood where the cheapest home [starts at $288,000](http://www.americanazachary.com/available-homes-home-sites/floor-plans/), they've managed to roll the service out to a single additional neighborhood. The cheapest home in that neighborhood starts at $390,000.

In November of last year, [AT&T announced](http://www.prnewswire.com/news-releases/100-fiber-network-powered-by-att-fiber-now-available-in-baton-rouge-area-300364490.html) that their fiber network was available in Baton Rouge, so I used the same method to check where they were offering service. Whereas only 200 addresses have access to Cox's gigabit service, _almost 10,000_ have access to AT&T's. That means that while Cox's gigabit network is available to only 0.12% of addresses in the parish, AT&T's gigabit service is available to 6%, fifty times more. What's even more surprising is that AT&T's network isn't limited to recently built homes. I was pleasantly surprised to find several homes built in the 70s that have access to gigabit from AT&T.

However, what I didn't find were addresses in North Baton Rouge, despite the fact that the area was explicitly called out as having fiber in AT&T's November press release. In fact, if you map out the areas where AT&T is offering gigabit and compare it to median household income, a (sadly unsurprising) trend emerges.

<figure class="gigabit-map">
  <iframe src="https://baton-rouge-gigabit-map.glitch.me/"></iframe>
  <figcaption>Income data from the U.S. Census Bureau’s 2015 American Community Survey. <a target="_blank" href="https://baton-rouge-gigabit-map.glitch.me/">View map in new tab</a></figcaption>
</figure>

A few weeks ago, Ars Technica published an article with the headline ["AT&T allegedly "discriminated" against poor people in broadband upgrades"](https://arstechnica.com/information-technology/2017/03/att-allegedly-discriminated-against-poor-people-in-broadband-upgrades/), which highlighted a report that demonstrated there was virtually no overlap in areas that had fiber-to-the-home and areas that had a poverty rate of 35% or more. It's unsurprising that lower-income areas in Baton Rouge are being left out as well.
