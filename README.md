server.adobe.github.com
=======================

Manage API calls on github to pull Adobe informations

# Start

After installing dependencies with `npm install`, you can lunch the server with:

```
node server.js
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

The default port is 8000. To be able to bind the input port 80 to 8000:

```
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables-save
```