# Jumperlab

A UI for @Architeuthis-Flux's awesome [Jumperless breadboard](https://github.com/Architeuthis-Flux/Jumperless/).

Written using React and TypeScript.

Also see [jlctl](https://github.com/nilclass/jlctl), which is used as a backend.

Follow the discussion [here](https://forum.jumperless.org/t/ui-idea-control-the-jumperless-from-a-webcam-feed/71/1).

## Features

TODO

## Getting started

*Prerequisites:*
- [nodejs](https://nodejs.org/): needed to run the dev server and build process for the UI
- [jlctl](https://github.com/nilclass/jlctl): used as a backend for the UI to communicate with the jumperless

1. Run `npm install` to install node dependencies
2. Run `npm start` to start the development server

The UI should then be accessible on http://localhost:3000

Now, in a second terminal, start the `jlctl` server
```
jlctl server
```

By default the server listens on `localhost:8080`. To use a different port or address, pass the `--listen` option when invoking `jlctl`, and adjust the `baseUrl` in `./src/App.tsx`, within this jumperlab repo.
