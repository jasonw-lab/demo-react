#!/bin/bash

# Exit on error
set -e

#source ~/.bashrc
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
echo "node version: $(node -v)"
echo "npm version: $(npm -v)"

# Check if the first argument is "stop"
if [ "$1" = "stop" ]; then
  # If the argument is "stop", run the down command
  docker-compose -f docker-compose.yml down --rmi all
else
  # Otherwise, proceed with the normal build process
  git pull
  #cd  ./backend/docker
  docker compose -f docker-compose.yml up -d --build
fi
