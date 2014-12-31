---
layout: page
title: JARVIS
---
As part of the capstone course of my ungraduate cirriculum, a group of students and I developed an inventory tracking and management system for [Studio 151](http://sites01.lsu.edu/wp/cxc/studio151/), a educational space at LSU that rents high-end video equipment to students. The system, named JARVIS, handles basic check-in and check-out functionality, but does so at an incredibly detailed level of granularity. If a student were to checkout a video camera, each piece that the camera comes with is tracked individually, allowing the Studio to keep better records of what pieces are loaned out and returned.

[![JARVIS](/img/jarvis_safari.png)](/img/jarvis_safari.png)

JARVIS is powered by a RESTful JSON API built with [Flask](http://flask.pocoo.org/), which is then consumed by an [Ember.js](http://emberjs.com/) frontend. Email reminders (such as checkout receipts and late notices) are handled by [Mandrill](https://mandrill.com/).