## Introduction
* The name of the website is "LitRPG Academy".
* It will be hosted on netlify and deployed to litrpgacademy.com
* The website will be for helping people find litRPG/progression/xanxia/cultivation books (aka LitRPG) to read.
* The website may eventually also provide resources for people wanting to write LitRPG as well.

## Problem Statements
* It is sometimes hard to find our next LitRPG book to read.
* The number of people writing LitRPG is growing quickly and there is a lot of complexity to getting started in writing.

## Solution
Things that would help find a LitRPG book to read
* Knowing what friends and family have read and what they thought about those books
* Knowing where different books can be found.
* Knowing how they are ranked on different websites.

## Feature Overview
* Using the color scheme #04070e, #afaaaa, #4f4b4b, #3c4464, #aa8c65
* For the first step, we want to display a list of books along with their tags and ratings from Royal Road using src/services/royalroad.server.ts file.
  * The server is going to need to scrape all of the books on royal road to get all the ones with the tags `litrpg`, `gamelit`, `progression`, `xianxia`, or `portal fantasy/isekai`.

## Notes
* Currently, we are using neon to host the db https://console.neon.tech/app/projects
* We are using netlify to host the website
* Need to add "As an Amazon Associate I earn from qualifying purchases." if we are approved to be an Amazon Associate (associate ID: litrpgacademy-20)
