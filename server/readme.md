# Codenames Server

The express.js server. Controls all games and serves the updates accordingly.

I recommend running the server using PM2 and setting up the client with nginx to allow for connections. Instructions for the hookup to the server can be found in the client readme.

If you wish to change the port of the server, you can via the change of the `PORT` variable found in index.js

Remember to change the port in the hookup file of nginx.