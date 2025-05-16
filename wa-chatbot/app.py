from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
import logging
import mimetypes
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Logger setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Flask App Initialization
app = Flask(__name__)
CORS(app)  # Enable CORS for API requests

# # Function to retrieve environment variables
# def get_env_variable(var_name):
#     """Retrieve an environment variable, log a warning if missing."""
#     value = os.getenv(var_name)
#     if value is None:
#         logger.warning(f"⚠️ WARNING: Environment variable '{var_name}' is NOT defined! Please check your .env file.")
#     return value

# # Configuration using environment variables
# RASA_URL = get_env_variable("RASA_URL")
# VERIFY_TOKEN = get_env_variable("VERIFY_TOKEN")
# ACCESS_TOKEN = get_env_variable("ACCESS_TOKEN")
# WHATSAPP_API_URL = get_env_variable("WHATSAPP_API_URL")
# WHATSAPP_MEDIA_URL = get_env_variable("WHATSAPP_MEDIA_URL")


###Matellio Credentials 
# Rasa Webhook URL
RASA_URL="http://localhost:5005/webhooks/rest/webhook"
# WhatsApp Webhook Verification Token
# VERIFY_TOKEN="matellio@1233#"
# # WhatsApp API Access Token
# ACCESS_TOKEN="EAAzOS32msx4BOZCKLonloayPCVXtqLbqRzbJ8piLkrcGmbGAdpOYW1zA8YfGTMpQQoZApQqyjXgNopSITPzsdJk8WAyCxfyl4INw5q5nOjQW0doAZBD6gyG0faVY2v73tQCpKCGvIODveawNXjVmQDoYCiv9DBjbc0USRauFrvBZCpRHbuVxfjsZCkZCrBmAjLywLD5lXEtRBKp7PG"
# # WhatsApp API Endpoints
# WHATSAPP_API_URL="https://graph.facebook.com/v21.0/161210717067552/messages"
# WHATSAPP_MEDIA_URL="https://graph.facebook.com/v21.0/{media_id}"

##SEPES Credentialsa 
VERIFY_TOKEN="$$INF0seps1234uioeec"
ACCESS_TOKEN="EAAP2RtndSoMBO3NmhYwvindaFSNFywUNISnHEv5QzfB0Jui4iHawbyNJLnuYWu9KT1XN6W5JLn8s5CV181kNP8UrtUpvX9t0ADO9MminiLFz28FOgZBYyuEEkgLnW6lNlIDK6P9talVIN7FYziZCqP5sBZAsH7cRoSWXipHfBWJGKTqTXcU2loSXfCZB1BUyFvG9YPWB"
WHATSAPP_API_URL="https://graph.facebook.com/v21.0/583421604848602/messages"
WHATSAPP_MEDIA_URL="https://graph.facebook.com/v21.0/{media_id}"

# Local directory for storing media files
MEDIA_STORAGE_PATH = "whatsapp_media/"
if not os.path.exists(MEDIA_STORAGE_PATH):
    os.makedirs(MEDIA_STORAGE_PATH)

# Define supported MIME types and extensions
MIME_TYPE_MAP = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/rtf": ".rtf"
}

def download_whatsapp_media(media_id, mime_type):
    """Downloads media from WhatsApp API and saves it with the correct file extension"""
    media_url = WHATSAPP_MEDIA_URL.format(media_id=media_id)
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

    logger.info(f"📥 Fetching media metadata from: {media_url}")

    try:
        # ✅ Fetch media URL from WhatsApp API
        response = requests.get(media_url, headers=headers)
        if response.status_code != 200:
            logger.error(f"❌ Failed to retrieve media metadata. Status: {response.status_code}, Response: {response.text}")
            return None

        media_data = response.json()
        direct_url = media_data.get("url")
        if not direct_url:
            logger.error("❌ Media URL not found in API response.")
            return None

        # ✅ Detect the correct file extension
        ext = MIME_TYPE_MAP.get(mime_type)
        if not ext:
            ext = mimetypes.guess_extension(mime_type) or ".bin"  # Fallback extension detection

        # ✅ Download the actual media file
        logger.info(f"📥 Downloading media from: {direct_url}")
        file_response = requests.get(direct_url, headers=headers)

        if file_response.status_code == 200:
            file_path = os.path.join(MEDIA_STORAGE_PATH, f"{media_id}{ext}")
            with open(file_path, "wb") as file:
                file.write(file_response.content)

            logger.info(f"✅ Media downloaded successfully: {file_path}")
            return file_path  # ✅ Return the correct file path with proper extension
        else:
            logger.error(f"❌ Error downloading media. Status: {file_response.status_code}, Response: {file_response.text}")
            return None

    except Exception as e:
        logger.exception(f"❌ Unexpected error while downloading media: {str(e)}")
        return None

def format_whatsapp_buttons(buttons, next_payload=None):
    """ Converts Rasa buttons to WhatsApp interactive buttons (Max 3) """
    whatsapp_buttons = []

    # Include up to 3 buttons (WhatsApp's limit)
    for button in buttons[:3]:  # Change from 2 to 3
        if len(button["title"]) > 20:
            print(f"⚠️ Warning: Button title '{button['title']}' exceeds 20 characters! Truncating.")
            button["title"] = button["title"][:20]

        whatsapp_buttons.append({
            "type": "reply",
            "reply": {
                "id": button["payload"],
                "title": button["title"]
            }
        })

    # If pagination is needed, add "More Options"
    if next_payload and len(buttons) > 3:
        whatsapp_buttons.append({
            "type": "reply",
            "reply": {
                "id": next_payload,
                "title": "➡️ Más Opciones"
            }
        })

    return whatsapp_buttons

def send_whatsapp_message(to, text, buttons=None, next_payload=None, custom=None):
    """ Sends a WhatsApp message, supporting text, buttons, and list messages """

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    # Handle WhatsApp List Messages
    if custom and "list" in custom:
        list_data = custom["list"]
        options = list_data["options"]

        sections = [{
            "title": "Seleccione una opción",
            "rows": [
                {
                    "id": option["payload"],
                    "title": option["title"]
                } for option in options
            ]
        }]

        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "list",
                "header": {"type": "text", "text": list_data["header"]},
                "body": {"text": list_data["body"]},
                "footer": {"text": "Seleccione una opción"},
                "action": {"button": "Seleccionar", "sections": sections}
            }
        }

    # Handle WhatsApp Buttons
    elif buttons:
        formatted_buttons = format_whatsapp_buttons(buttons, next_payload)
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": text},
                "action": {"buttons": formatted_buttons}
            }
        }

    # Handle Regular Text Messages
    else:
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": text}
        }

    try:
        response = requests.post(WHATSAPP_API_URL, json=payload, headers=headers)
        response_json = response.json()
        logger.info(f"📩 WhatsApp API response: {response_json}")
    except Exception as e:
        logger.exception(f"❌ Error sending WhatsApp message: {str(e)}")

def send_to_rasa(sender, message=None, media_metadata=None):
    """ Send a message (text or media) to Rasa and process the response """

    payload = {"sender": sender}

    if media_metadata:
        # ✅ Send media metadata properly to Rasa
        payload["message"] = "/upload_attachment"
        payload["metadata"] = media_metadata  # ✅ Ensure metadata includes multiple attachments

        logger.info(f"📤 Sending media metadata to Rasa: {json.dumps(media_metadata)}")

    elif message:
        # ✅ Send text message normally
        payload["message"] = message
        logger.info(f"📤 Sending text message to Rasa: {message}")

    else:
        logger.warning("❌ No valid message to send to Rasa.")
        return  # Prevent sending empty messages

    # ✅ Send request to Rasa
    try:
        response = requests.post(RASA_URL, json=payload)
        rasa_data = response.json()
    except Exception as e:
        logger.exception(f"❌ Rasa response JSON error: {e}")
        rasa_data = []

    logger.info(f"🤖 RAW Rasa Response: {rasa_data}")  # Debugging

    bot_replies = []
    buttons = []
    custom = None

    for item in rasa_data:
        if "text" in item:
            bot_replies.append(item["text"])
        if "buttons" in item:
            buttons = item["buttons"]
        if "custom" in item and "list" in item["custom"]:
            custom = item["custom"]

    final_reply = "\n".join(bot_replies) if bot_replies else "Lo siento, no entendí eso."

    send_whatsapp_message(sender, final_reply, buttons, custom=custom)


@app.route("/webhook", methods=["POST", "GET"])
def whatsapp_webhook():
    """Handles incoming WhatsApp messages, including text, buttons, lists, and multiple attachments."""

    if request.method == "GET":
        # WhatsApp/Facebook Webhook Verification
        verify_token = "matellio@1233#"  # Ensure this matches the one set in Facebook Developers
        mode = request.args.get("hub.mode")
        challenge = request.args.get("hub.challenge")
        token = request.args.get("hub.verify_token")

        if mode == "subscribe" and token == verify_token:
            logger.info("✅ Webhook verified successfully!")
            return challenge, 200  # Send back the challenge code for verification
        else:
            logger.error("❌ Webhook verification failed!")
            return jsonify({"error": "Verification failed"}), 403

    data = request.get_json()
    logger.info(f"📥 Received WhatsApp Message: {data}")

    if "entry" in data:
        for entry in data["entry"]:
            for change in entry["changes"]:
                value = change["value"]

                if "messages" in value:
                    for message in value["messages"]:
                        sender_id = message["from"]
                        media_attachments = []  # ✅ Store multiple attachments

                        # Handle Button Clicks
                        if "interactive" in message and "button_reply" in message["interactive"]:
                            button_payload = message["interactive"]["button_reply"]["id"]
                            logger.info(f"✅ Button Clicked: {button_payload}")
                            send_to_rasa(sender_id, button_payload)

                        # Handle List Selections
                        elif "interactive" in message and "list_reply" in message["interactive"]:
                            list_selection = message["interactive"]["list_reply"]["id"]
                            logger.info(f"✅ List Option Selected: {list_selection}")
                            send_to_rasa(sender_id, list_selection)

                        # Handle Text Messages
                        elif "text" in message:
                            user_text = message["text"]["body"]
                            logger.info(f"📩 User ({sender_id}) sent: {user_text}")
                            send_to_rasa(sender_id, user_text)

                        # Handle Multiple Media Attachments (Images, PDFs, Documents)
                        media_types = ["image", "document"]
                        for media_type in media_types:
                            if media_type in message:
                                media_id = message[media_type]["id"]
                                mime_type = message[media_type].get("mime_type", "unknown")
                                caption = message[media_type].get("caption", "")

                                logger.info(f"📸 Received {media_type} (ID: {media_id}, Type: {mime_type}) from {sender_id}")

                                # ✅ Download and store the media with correct extension
                                file_path = download_whatsapp_media(media_id, mime_type)

                                if file_path:
                                    # ✅ Check file size (10MB limit for backend)
                                    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
                                    if file_size_mb > 10:
                                        logger.warning(f"❌ File {file_path} exceeds 10MB. Skipping.")
                                        send_whatsapp_message(sender_id, "❌ El archivo supera el límite de 10MB y no se procesará.")
                                        continue  # Skip files larger than 10MB

                                    # ✅ Properly format metadata for Rasa
                                    media_payload = {
                                        "file_path": file_path,
                                        "mime_type": mime_type,
                                        "caption": caption
                                    }
                                    media_attachments.append(media_payload)

                        # ✅ Send multiple attachments to Rasa
                        if media_attachments:
                            logger.info(f"📤 Sending multiple media attachments to Rasa: {json.dumps(media_attachments)}")
                            send_to_rasa(sender_id, media_metadata={"attachments": media_attachments})
                        elif "image" in message or "document" in message:
                            logger.error("❌ Failed to process media.")
                            send_whatsapp_message(sender_id, "❌ No se pudo descargar el archivo.")

    return jsonify({"status": "received"}), 200


# @app.route("/webhook/reset_session", methods=["POST"])
# def reset_session():
#     """Manually trigger session reset from WhatsApp."""
#     data = request.get_json()
#     sender_id = data.get("sender_id")

#     if sender_id:
#         logger.info(f"🔄 Resetting session for user: {sender_id}")
#         send_to_rasa(sender_id, "/restart_session")
#         return jsonify({"status": "Session reset triggered for user", "user": sender_id}), 200
#     else:
#         logger.warning("❌ Missing sender_id in session reset request.")
#         return jsonify({"error": "Missing sender_id"}), 400

if __name__ == "__main__":
    logger.info("🚀 Starting Flask app on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
