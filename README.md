# Paradrop Hybrid Application Example

This sample application demonstrates how to integrate a web application with paradrop.org through the OAuth2 support. With the ParaDrop integration, an application can "paradrop" services (chutes) into the extreme network edge --- the Wi-Fi routers.

The application is written with Node.js and express. It uses passport-oauth to implement the OAuth2 consumer. Please make sure your node version is v6.x because we use some ES6 features.

## Setup

Head over to [paradrop.org.](https://paradrop.org/) and register a new application.

Once you've created an application, drop on your client id and client secrete into `config.js` in this repo.

Install dependencies with:

```
yarn
```

Start the application:

```
export CLIENT_ID=<client_id>
export CLIENT_SECRET=<client_secret>
npm start
```

Go to: http://localhost:3004/.

## Whats Going On

There are three pages to this demo.

The first, the landing page, represents the view that an application (third-party application) presents to a paradrop user. The only link on the page, the "Request access to ParaDrop" link,
sends the user to the authorization page where they can accept or deny the application's request.

If accepted the user is redirected to the second page of this demo. The only link on this page requests a list of all the user's routers from the paradrop service.

On success, the user is sent to the third page. Here the user is presented with a list of these routers. When a router is clicked, the application hits the API at paradrop.org once more, triggering an install of the "Hello, World!" chute on the selected router. On success the user is redirected to the appropriate status page for this operation.

## How It Works

This demo was created so that you, aspiring ParaDrop developer, could drop in the implementation into your own Node.js server and use ParaDrop's API as an OAuth2 client. The best way to understand how it's written is to check out the comments in `server.js`.

You'll also need to view and understand how paradrop.org secures its endpoints through *Permissions*. You can find documentation on this information [here](http://paradrop.readthedocs.io/en/latest/).
