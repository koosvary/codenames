# Codenames Server

The express.js server. Controls all games and serves the updates accordingly.

I recommend running the server using PM2 and setting up the client with nginx to allow for connections. Instructions for the hookup to the server can be found in the client readme.

If you wish to change the port of the server, you can via the change of the `PORT` variable found in index.js

Remember to change the port in the hookup file of nginx.


## Things to know
There is a scheduled task that will remove any games unused for the last 12 hours, and runs once an hour every hour. If you don't want this for any reason, you can remove the scheduler, or alternatively change the rules as you like.