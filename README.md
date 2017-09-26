# Paradrop Application Example

This sample application demonstrates OAuth integration with paradrop.org.

## Setup

Head over to [paradrop.org.](https://paradorp.org/) and register a new application.

Once you've created an application, drop on your client secret and client id into `config.js` in this repo.

Install dependencies with:

```
npm install
```

Start the application:

```
node server.js
```

Go to: http://localhost:3004/.

## Whats Going On

There are three pages to this demo.

The first, the landing page, represents the view that an application (third party application) presents to a paradrop user. This view is on the application's app-- a web page in this case. The only link on the page, the "redirect to Paradrop" link, sends the user to the authorization page where they can accept or deny the application's request.

If accepted the user is redirected to the second page of this demo. The only link on this page requests a list of all the user's routers from the paradrop service.

On success, the user is sent to the third page. Here the user is presented with a list of these routers. When a router is clicked, the application hits the API at paradrop.org once more, triggering an install of the "Hello, World!" chute on the selected router. On success the user is redirected to the appropriate status page for this operation.

## How It Works

This demo was created so that you, aspiring Paradrop developer, could drop in the implementation into your own NodeJS server and use Paradrop's API as an OAuth client. The best way to understand how its written is to check out the comments in `server.js`.

You'll also need to view and understand how Paradrop.org secures its endpoints through *Permissions*. You can find documentation on this information [here](paradrop.org/docs).
