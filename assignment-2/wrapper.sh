#!/bin/bash
  
# turn on bash's job control
set -m

# Start the redis server
redis-server &
  
# Start the primary process and put it in the background
sanic clarity.main.app &
  
# Start the helper process
npm start --trace-warnings --prefix ./server

  
# now we bring the primary process back into the foreground
# and leave it there
fg %1