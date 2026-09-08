# Tempus Fugit

> ***It escapes, irretrievable time***. 
> <br>*"Sed fugit interea, fugit irreparabile tempus, singula dum capti circumvectamur amore."*

**Tempus Fugit ("It escapes, irretrievable time")**.
<br>A new-tab extension that encourages productivity by showing an estimate of your remaining time in this world, based on WHO life-expectancy data. A quiet reminder of life’s finitude, designed to help you focus on what matters and make each day count.

![Tempus Fugit](src/tempusfugit.jpg "Tempus Fugit")


## Development

Watch files and start development server

```sh
npm start
# parcel src/index.html -d .localserver
```

Build and create distributable folder

```sh
npm run build
# rm -rf dist && parcel build src/index.html --no-cache --no-source-maps --public-url ./
```

## Browser extensions

Build fresh Chrome and Firefox extension archives. This command rebuilds the web assets first, then writes `build/tempus-fugit-chrome.zip` and `build/tempus-fugit-firefox.zip`.

```sh
npm run build:extension
```

## Deployment

Deploy a fresh build to the Surge staging site:

```sh
npm run deploy:stage
```

Preview the DreamHost production changes without uploading them:

```sh
npm run deploy:test
```

Build and deploy the site to DreamHost:

```sh
npm run deploy:prod
```

---

&mdash; _Jorge Moreno &copy; 2026 ([@alterebro](https://alterebro.com))_
