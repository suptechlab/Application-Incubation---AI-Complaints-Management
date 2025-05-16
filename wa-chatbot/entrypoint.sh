#!/bin/sh

# Start the Rasa server in the background
#rasa run --enable-api --cors "*" --model /app/models/20241212-075213-regular-pace.tar.gz --credentials /app/credentials.yml --debug &

#rasa run --enable-api --cors "*" --connector channels.custom_attachment_channel.CustomAttachmentRestInput --credentials credentials.yml

#rasa run  --enable-api --cors "*" --credentials credentials.yml

rasa run --enable-api --cors "*" --model /app/models/20250508-193055-dense-surface.tar.gz --credentials /app/credentials.yml --debug &

# Start the action server
rasa run actions &

#Stat the Flask Server
python app.py

