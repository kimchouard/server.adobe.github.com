server.adobe.github.com
=======================

Manage API calls on github to pull Adobe informations

# Start

After installing dependencies with `npm install`, you can launch the server with:

```
node server.js
```

# Use

Here are the routes you can call:

- `/` : every Adobe organisations, repositories, languages used on github.
- `/update` : update all json, pulling them from adobe.github.com repo.

# Config

## Start server

If you want to launch the process in background, simply use:
```
nohup node server.js &
```


## GitHub account

In order for the app to make Github API calls without reaching the limit, you need to authenticate.

The ID and pass are pulled from the local environment variables. Add those lines in your `~/.bashrc`:

```
export GHUSER=[userName]
export GHPASS=[userPassword]
```

## Production

It is better to use PM2 to launch your instance in production. More info [here](https://www.digitalocean.com/community/articles/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps).

```
pm2 start server.js
```

Once you push your server in production, you need to update your environment variable NODE_ENV. It will mainly activate your NewRelic manager.

```
export NODE_ENV=production
```

## Port managing

The default port is 5000. To be able to call on 80, 2 options:

- bind the input port 80 to 8000:

```
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables-save
```

- change env variable

```
export PORT=80
```
