# Brain Face Scanner

A full-stack React app that finds faces in photos. Users sign up or sign in, paste an image URL, and the app draws a box around the face using the Clarifai face-detection model. Each user's entry count is saved in the database and shown when they sign in.

This repo is the **front end**. The back end (Node.js, Express and PostgreSQL) is in [brain-face-scanner-api](https://github.com/the-codingphoenix/brain-face-scanner-api).

<!-- Add a live demo link here once it is deployed, for example: **Live demo:** https://... -->

<!-- Add a screenshot: save one as public/screenshot.png and uncomment the next line -->
<!-- ![Brain Face Scanner screenshot](public/screenshot.png) -->

## Features

- Sign up and sign in (passwords are hashed with bcrypt on the server)
- Paste any image URL and see a box drawn around the detected face
- Entry counter for each signed-in user, saved in PostgreSQL
- Animated particle background and a tilting logo

## Built with

**Front end:** React 18, Vite, Tachyons CSS, react-tsparticles, react-parallax-tilt

**Back end:** Node.js, Express, PostgreSQL, Knex, bcrypt, Clarifai API

## How it works

1. The React app sends the image URL to the API's `/imageurl` route.
2. The API calls Clarifai's face-detection model and sends back the face's bounding box.
3. The app turns the box's percentages into pixel positions and draws it over the image.
4. The app calls `/image` to add one to the user's entry count in PostgreSQL.

## What I learned

- Connecting a React front end to my own REST API
- Handling sign-in state and simple routing between screens in React
- Keeping API keys on the server instead of in front-end code
- Working with a SQL database through Knex

## Run it locally

You need Node.js 20 and the API running (see the API repo).

```bash
git clone https://github.com/the-codingphoenix/brain-face-scanner.git
cd brain-face-scanner
npm install
npm run dev
```
