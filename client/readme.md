# Codenames Client

The React/Redux portion of the system. Serves all endpoints to the server.

To produce a production build, you can run the method `npm run build`, which will create a build/ folder. Use the contents within to host it on a server.

I highly recommend the use of nginx to host the web app, due to it's extreme ease of use when setting up proxies. A sample of the code I used for the sites-allowed/default file can be found below (change the domain to your listing):

```
server {
    listen 80;
    server_name optional-subdomain.your-domain.com;

    root /var/www/codenames;
    index index.html;

    location / {
            try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_pass http://localhost:5000/socket.io/;
    }
}
```

If you choose to change the express server port, please remember to change the `PORT` variable found in ../server/index.js accordingly.

Additionally, change the URLs found in config/serverUrl to your server location.