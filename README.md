# tinyapp

## Nodemon

Nodemon is a utility that will monitor for any changes in our source code and automatically restart our server. Perfect for development.

`npm install nodemon --save-dev`

Run the app with `./node_modules/.bin/nodemon -L express_server.js`

To avoid using the previous code to start the app, we can add ascript to our JSON file.

```js
"scripts": {
  "start": "./node_modules/.bin/nodemon -L express_server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

We can now start our app using `npm start`.

[Nodemon documentation](https://github.com/remy/nodemon#application-isnt-restarting)