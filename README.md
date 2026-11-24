# Brain Face Scanner

A full-stack React app that finds faces in photos. Users sign up or sign in, upload a photo, and the app draws a box around every face it finds. Face detection runs right in the browser with Google's MediaPipe, so it needs no API key. Each user's entry count is saved in the database and shown when they sign in.

This repo is the **front end**. The back end (Node.js, Express and PostgreSQL) is in [brain-face-scanner-api](https://github.com/the-codingphoenix/brain-face-scanner-api).

<!-- Add a live demo link here once it is deployed, for example: **Live demo:** https://... -->

<!-- Add a screenshot: save one as public/screenshot.png and uncomment the next line -->
<!-- ![Brain Face Scanner screenshot](public/screenshot.png) -->

## Features

- Sign up and sign in (passwords are hashed with bcrypt on the server)
- Upload any photo and see a box drawn around each face it finds
- Entry counter for each signed-in user, saved in PostgreSQL
- Animated particle background and a tilting logo

## Built with

**Front end:** React 18, Vite, MediaPipe Tasks Vision (face detection), Tachyons CSS, react-tsparticles, react-parallax-tilt

**Back end:** Node.js, Express, PostgreSQL, Knex, bcrypt

## How it works

1. The user picks a photo. The app shows it with a temporary local URL, so the photo never leaves the browser.
2. MediaPipe's BlazeFace model finds each face and returns its box in image pixels.
3. The app scales each box to the size the photo is shown at and draws it over the image.
4. The app calls the API's `/image` route to add one to the user's entry count in PostgreSQL.

## What I learned

- Connecting a React front end to my own REST API
- Handling sign-in state and simple routing between screens in React
- Running a machine learning model in the browser with MediaPipe
- Working with a SQL database through Knex

## Run it locally

You need Node.js 20 and the API running (see the API repo).

```bash
git clone https://github.com/the-codingphoenix/brain-face-scanner.git
cd brain-face-scanner
npm install
npm run dev
```
