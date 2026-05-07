#!/bin/bash
# Auto-restart script for the dev server
cd /home/z/my-project

while true; do
  # Kill any existing server
  pkill -f "next dev -p 3000" 2>/dev/null
  sleep 2
  
  # Start the server
  npx next dev -p 3000 > dev.log 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 30); do
    if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
      echo "[$(date)] Server started (PID: $SERVER_PID)"
      break
    fi
    sleep 1
  done
  
  # Monitor the server
  while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 5
  done
  
  echo "[$(date)] Server crashed, restarting in 3s..."
  sleep 3
done
