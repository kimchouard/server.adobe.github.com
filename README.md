server.adobe.github.com
=======================

Manage API calls on github to pull Adobe informations

# Start

After installing dependencies with `npm install` and grunt with `npm install grunt --save-dev`, you can lunch the server with:

```
grunt serve
```

# Use

Here is the routes you can call:

- `/` : every Adobe organisations, repositories, languages used on github.
- `/update` : update all json, pulling them from adobe.github.com repo.

# Config

In order for the app to make Github API calls without reaching the limit, you need to authentificate.

The ID and pass are pulled from the local environement variables. Add those lines in your .bashrc:

```
export GHUSER=[userName]
export GHPASS=[userPassword]
```