#!/bin/sh

# Start the Rasa server in the background
rasa run --enable-api --cors "*" --model /app/models/20250407-160456-local-subscriber.tar.gz --credentials /app/credentials.yml --debug &

# Start the action server
rasa run actions
