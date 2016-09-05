# RHS CS Practice Problem Point Tracker (PPS)
This is the point-tracker for the Reedy High School Computer Science team.
Team members use this tool to solve questions and get points for solving them.

Feel free to use this in your setting too.

## Dependancies
* NodeJS
* npm
* Electron

## Installation
* clone the repo
* run `npm install` to install the dependancies
* edit your settings.js file to have incorporate your Firebase keys
* run `npm start` to start

## `settings.js`

This has all of your Firebase credentials. Maybe in the future, more customizable settings or plugins will come.

It should look like this:
```javascript
window.settings = {
  FirebaseCredentials:{
    apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "XXXXXXXXXXXXXX.firebaseapp.com",
    databaseURL: "https://XXXXXXXXXXXXXXXXX.firebaseio.com",
    storageBucket: "XXXXXXXXXXXXXXXXXX.appspot.com",
  },

}

```

**Remember to save it as settings.js**


## PR's much appreciated


