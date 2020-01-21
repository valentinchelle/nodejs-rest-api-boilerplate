# NodeJs Api Boilerplate

A boilerplate for **NodeJs** Rest Api. with a ReactJS client example. Implements Classic Auth, 0Auth (Google Login, Facebook Login).

You probably know how hard it is to start a node js API, with a well structured and clean code. Especially if you are on a rush for an hackhaton or a school project.
I give you here a clean code, that implements what essential for a new API project : a clean nodejs structure implementing a User System following the best practices.

You can directly plug this API with the front end of your choice by calling the different endpoints. I also give details on how to extend this code to adapt it for your project.

# Prerequisites

Please make sure that you have:

- node.js installed (https://nodejs.org/)
- have mongodb installed and running locally (https://www.mongodb.com/)
  - Using Windows, just open the terminal at where you installed mongo and run `mongod.exe`
- run `npm install` in your root project folder
- if you want to use the react, run `cd client` and `npm install`

# Features

(STILL IN DEVELOMENT)
The entity example in this repo is users, but it can be easily applied to articles, messages, ...

- [x] Clean Structure Component Oriented
- [ ] Templates to create your own entities
- [x] Secure Authentification System with email/password using **JWT**.
- [ ] Emails
- [x] Get Entity
- [x] List Entity
- [x] Patch Entity ( like edit user)
- [x] Delete Entity
- [x] OAuth 2.0 Authentication via Facebook, Google
- [x] Easy-to-use endpoints
- [x] Middlewares to ensure authentification and permission to access resources.

# Usage

## Server

To run the server, please use a command line the following:

- npm start

  - It will run the server at port 3600.

- mongodb configuration in common/services/mongoose.service

- Add a file `.env` at the root of the folder (same level as `index.js`), copy paste the following template and fill it with the right information like :

```
GOOGLE_CLIENT_ID=googleclientid.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=googleclientsecret
FACEBOOK_CLIENT_ID=fbclientid
FACEBOOK_CLIENT_SECRET=fbclientsecret
MONGO_URI=mongodb+srv://{user}:{password}@cluster0-ukuem.mongodb.net/test?retryWrites=true&w=majority
JWT_SECRET=randomString123
```

## Setup : OAuth for Facebook Login

- Go on https://developers.facebook.com/apps and create a new app
- Add Facebook Login to its products
- In the settings of the Facebook Login Product
- If your servers runs locally, make sure the facebook app is in development mode
- If not, add `url-of-server:port/api/auth/facebook/callback` in the field _Valid OAuth Redirect URIs_
- Grab your **Client ID** and **Client Secret** in _Settings>Basic_
- Fill the .env at the root of the server with these credentials

## Setup : OAuth for Google Login

- Go on https://console.cloud.google.com/ and create a new app
- Add Credentials > OAuth client ID
- In _Authorized JavaScript origins_, enter `http://server:port` ( for me `http://127.0.0.1:5000`)
- In _Authorized redirect URIs_, enter `http://server:5000/api/auth/google/callback` ( for me `http://localhost:5000/api/auth/google/callback`)
- Grab your **Client ID** and **Client Secret** on the same page
- Fill the .env at the root of the server with these credentials

## Setup : MongoDB

- Create a new account on https://cloud.mongodb.com/ and choose the free plan
- On the homepage, click on _Connect > Connect your application > _
- Copy the **Connection String**, replace <password> by your actual password, and paste in the .env as _MONGO_URI_

## Client

To run the client with nodemon ( allow hot reloading ):
`npm run client`

# Structure

The structure of this boilerplate follows the guideines of the component oriented structure :
Each component corresponds to a folder, and follows an Model Controller Middlewares sub structure :

- **models** for the database entities ( like `users` ). It is where the schema, and the communication with the table are defined (like `UserModelfindById`).
- **controllers/** for the actions on the models, that call the models actions ( like the management of the list of the users).
- **middlewares/** intermediaries between the request and the response. Usually uses and modifies the request body parameters.
- **routes.js** for the definition of the endpoints for each actions of the controllers. Defines also what are the middleware used for the routes.

The global logic for an app calling this rest API :

1. The client will call an API route ( like `url/api/users/modifyuser` )
2. The router makes the request pass through middlewares ( like `isConnected()`) to validate the request
3. The router feeds the controller by calling one of its action ( like `modifyUser()`).
4. The controller action access the model ( the database ) to modify/access a record in the table.
5. The controller ends up by returning a response

## Api Endpoints

#### Endpoints for the authentification

| Endpoint                  | Body Request Fields                               | Description                        |
| ------------------------- | ------------------------------------------------- | ---------------------------------- |
| `POST /api/auth/login`    | {email : "", password:""}                         | Login the user                     |
| `POST /api/auth/refresh`  | {refresh_token: ""}                               | Generate a new Json Web Token      |
| `POST /api/auth/register` | {email : "", name:"", password :"", password2:""} | Creates a new user.                |
| `GET /api/auth/google`    |                                                   | Entry point for the Google Oauth   |
| `GET /api/auth/facebook`  |                                                   | Entry point for the Facebook Oauth |

#### Endpoints for Entities ( Users )

This is the usual API endpoints for a given entity ( here the users ):

| Endpoint                | Token Needed | Body Request    | Description                            |
| ----------------------- | ------------ | --------------- | -------------------------------------- |
| `GET /api/users/`       | yes          |                 | Returns the list of the users          |
| `GET /api/users/:id`    | yes          |                 | Returns info about the user            |
| `PATCH /api/users/:id`  | yes          | {name : "John"} | Updates the user with the body request |
| `DELETE /api/users/:id` | yes          |                 | Deletes the user. ADMIN ONLY           |

## Routes Middlewares

The middlewares are used to validate a requets. It is mainly used here to make sure the user has the permission to access the route. Here is the list of the different middleware and where they are implemented.

It is then very easy to use, as shown in this example :

```javascript
router.delete("/:userId", [
  AuthMiddleware.validJWTNeeded,
  PermissionsMiddleware.minimumPermissionLevelRequired(ADMIN),
  UsersController.removeById
]);
```

### Useful

| Name                               | Path                            | Description                          |
| ---------------------------------- | ------------------------------- | ------------------------------------ |
| onlySameUserOrAdminCanDoThisAction | `users/middlewares/permissions` | For actions like editing profile     |
| minimumPermissionLevelRequired     | `users/middlewares/permissions` | Ensures the user has the permission  |
| sameUserCantDoThisAction           | `users/middlewares/permissions` | Ensures the user can't do the action |
| validJWTNeeded                     | `auth/middlewares/auth`         | Ensures the contains a _valid_ JWT   |

### Specific

| Name                               | Path                            | Description                                  |
| ---------------------------------- | ------------------------------- | -------------------------------------------- |
| onlySameUserOrAdminCanDoThisAction | `users/middlewares/permissions` | For actions like editing profile             |
| verifyRefreshBodyField             | `auth/middlewares/auth`         | Ensures the request contains a refresh token |
| validRefreshNeeded                 | `auth/middlewares/auth`         | Ensures the refresh token is valid           |
| JwtNeeded                          | `auth/middlewares/auth`         | Ensures the contains a JWT token (not valid) |

# Understanding the login logic

## Step 1 : Login with credentials

The first step in the login process, is for a registered user to send its email/passsword.
Endpoint : `endpoint:3600/auth`
Body :

```json
{
  "email": "user@azerty.com",
  "password": "secret"
}
```

If the login credentials are right, the response should be like:

```json
{
  "accessToken": "eyJhbGcidOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTIzNjRlZDQ4NDE2YzY2ZjYwMGIwYjgiLCJlbWFpbCI6InZhbGVudGluLmNoZWxsZTNAZ21haWwuY29tIiwicGVybWlzc2lvbkxldmVsIjoxLCJwcm92aWRlciI6ImVtYWlsIiwibmFtZSI6InVuZGVmaW5lZCB1bmRlZmluZWQiLCJyZWZyZXNoS2V5IjoiRUlVUk12NENQKytOZitzSHRnZThFZz09IiwiaWF0IjoxNTc5Mzc5NTY1fQ.jBIa5DNI0ObjVW7i3qF68XguKxuw_4lLmr-5S15rOp4",
  "refreshToken": "RFZJZE5YRWldTS3B2bWtUUlByaVZUeVJNTVFyYko5Sm80OUsycWtYUU9PYlFuQURCYkh4K202YWxnd2IybmFiRkQ0TWl2TElQemJKeGUrQ3FpdXVmR3c9PQ=="
}
```

The access token is the famous `json web token`. It is a stateless string that will allow someone to stay logged everytime they provide this token to the server.

## Step 2 : Stay logged with the JWT

In order to make your users stay logged on your app, you have to provide the jwt for each request. To do that,
Grab the `accessToken` from the previous request, prefix it with `Bearer` and add it to the request headers under Authorization.
This will be required for every route with the middleware `ValidationMiddleware.validJWTNeeded` like :

```
  app.patch("/users/:userId", [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(FREE),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.patchById
  ]);
```

# Security Concerns

At the end of the OAuth, the jwt is sent via a get request to the front end, so it could possibly appear in the history/logs of the server...

# References

Encrypting the passwords :
https://github.com/goldbergyoni/nodebestpractices/tree/security-best-practices-section#-68-avoid-using-the-nodejs-crypto-library-for-passwords-use-bcrypt

# Credits

This project has been largely inspired by the following work :

https://github.com/makinhs/rest-api-tutorial

- https://www.toptal.com/nodejs/secure-rest-api-in-nodejs

Visit www.toptal.com/blog and subscribe to our newsletter to read great posts
