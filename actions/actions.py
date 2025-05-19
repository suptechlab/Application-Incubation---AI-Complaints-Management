import os
from typing import Any, Text, Dict, List, Optional
import requests
from rasa_sdk import Action
from rasa_sdk.events import SlotSet, FollowupAction, UserUtteranceReverted
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.interfaces import Tracker
import logging
import time
import re
import json
import urllib3
# import aiohttp######
# import asyncio######
# import httpx#####
from dotenv import load_dotenv
from rasa_sdk.events import ActiveLoop
from rasa_sdk.forms import FormValidationAction
from datetime import datetime, timedelta
from rasa_sdk.types import DomainDict
from rasa_sdk.events import SlotSet, EventType, Restarted  # Add EventType here
from rasa_sdk.events import AllSlotsReset
from rasa_sdk.events import SlotSet, ConversationPaused
from rasa_sdk.events import ConversationResumed
import warnings
# from aiohttp.web_exceptions import HTTPServiceUnavailable#####

warnings.filterwarnings("ignore", category=DeprecationWarning)

load_dotenv()
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from . import rag_app  # Import your rag_app.py script (make sure it's in the same folder)
from .logger_fun import setup_logger  # Import the logger setup function

# Environment variables for URLs
# def get_env_variable(var_name, default=None):
#     """Retrieve an environment variable, log a warning if missing, and return a default value if provided."""
    
#     value = os.getenv(var_name, default)
    
#     if value is None:
#         logger.warning(f"⚠️ WARNING: Environment variable '{var_name}' is NOT defined! Please check your .env file.")
    
#     return value

# # Load all environment variables
# OPENAI_API_KEY = get_env_variable("OPENAI_API_KEY")
# AUTH_BASE_URL = get_env_variable("AUTH_BASE_URL")
# USER_BASE_URL = get_env_variable("USER_BASE_URL")
# ADMIN_BASE_URL = get_env_variable("ADMIN_BASE_URL")
# TICKET_BASE_URL = get_env_variable("TICKET_BASE_URL")
# COLLECTION_CENTER_URL = get_env_variable("COLLECTION_CENTER_URL")
# FRONT_END_URL = get_env_variable("FRONT_END_URL")
# INQUIRY_TOKEN = get_env_variable("INQUIRY_TOKEN")
# FAISS_INDEX_FILE = get_env_variable("FAISS_INDEX_FILE")  # Example of default path
# HUMAN_AGENT_URL = get_env_variable("HUMAN_AGENT_URL")

AUTH_BASE_URL="https://api-stg-suptech.seps.gob.ec/auth"
USER_BASE_URL="https://api-stg-suptech.seps.gob.ec/user"
ADMIN_BASE_URL="https://api-stg-suptech.seps.gob.ec/admin"
TICKET_BASE_URL="https://api-stg-suptech.seps.gob.ec/ticket"
HUMAN_AGENT_URL ="https://servicios.seps.gob.ec/mibew/index.php/chat?locale=es&utm_source=seps"
COLLECTION_CENTER_URL ="https://centroserviciosacopio.seps.gob.ec"
FRONT_END_URL= "https://webportal-stg-suptech.seps.gob.ec"
INQUIRY_TOKEN= "3n9Xz+1J6hQG3D2NqZldnA0PbJlVa3YZb2JkTkgYjP0="
# Define the path to the 'faiss_index' directory
FAISS_INDEX_FILE = "/app/actions/faiss_index"


# Initialize logger
logger = setup_logger()

class ActionSetDataProtectionAccepted(Action):
    def name(self) -> Text:
        return "action_set_data_protection_accepted"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        intent = tracker.latest_message['intent'].get('name')

        # Determine status based on intent
        if intent == "accept_data_protection":
            status = "true"
        elif intent == "decline_data_protection":
            status = "false"
        else:
            dispatcher.utter_message(response="utter_processing_error")
            return []

        # API endpoint with query parameter
        api_url = f"{USER_BASE_URL}/api/v1/dpa/accept?status={status}"

        try:
            response = requests.post(api_url)
            logging.info(f"API Response: {response.status_code}, {response.text}")

            if response.status_code == 200:
                api_response = response.json()
                if api_response.get("status") == 200:
                    if status == "true":
                        dispatcher.utter_message(text="Protección de datos aceptada")
                    else:
                        dispatcher.utter_message(text="Protección de datos rechazada")
                else:
                    dispatcher.utter_message(text="ó un problema al procesar su solicitud.")
            else:
                logging.error(f"Unexpected API response: {response.status_code} - {response.text}")
                dispatcher.utter_message(text="Error al procesar la solicitud.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Connection error occurred: {e}")
            dispatcher.utter_message(text="Error de conexión al servidor.")

        # If user accepted data protection, activate the form
        if status == "true":
            return [SlotSet("data_protection_accepted", True)]
        else:
            return [SlotSet("data_protection_accepted", False)]

class ActionExtractAndCheckToken(Action):
    def name(self) -> Text:
        return "action_extract_and_check_token"

    def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:

        try:
            # Safely extract metadata
            metadata = tracker.latest_message.get("metadata", {}) or {}

            # Extract and validate token
            token = metadata.get("token")
            if token and isinstance(token, str) and token.strip():
                existing_token = tracker.get_slot("id_token")

                # Avoid resetting if the token hasn't changed
                if existing_token == token:
                    logger.info("✅ Token is already set. No update needed.")
                else:
                    logger.info(f"✅ Token successfully extracted: {token[:5]}... (truncated for security)")
                
                return [SlotSet("id_token", token), SlotSet("is_authenticated", True)]
            
            # If no valid token found
            logger.warning("⚠️ No authentication token found. User is unauthenticated.")
            # dispatcher.utter_message(text="❌ You need to log in before proceeding.")

            return [SlotSet("id_token", None), SlotSet("is_authenticated", False)]

        except Exception as e:
            logger.error(f"❌ Error extracting token: {str(e)}")
            dispatcher.utter_message(text="❌ Authentication failed due to an error. Please try again.")

            return [SlotSet("id_token", None), SlotSet("is_authenticated", False)]

class ValidateProvideUserDetailsForm(FormValidationAction):
    def name(self) -> str:
        return "validate_provide_user_details_form"

    async def validate_name(
        self, slot_value: str, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict
    ) -> Dict[str, str]:
        """Ensure the bot correctly handles full names."""
        if not slot_value or not slot_value.strip():
            dispatcher.utter_message(text="Por favor, proporcione su nombre y apellido.")
            return {"name": None}
        slot_value = slot_value.strip()
        logger.info(f"Captured name slot value: '{slot_value}'")
        # Ensure full name is used properly
        dispatcher.utter_message(text=f"Hola {slot_value}, por favor, ingresa tu consulta.")
        return {"name": slot_value}

    async def validate_inquiry_channel(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict
    ) -> Dict[str, str]:
        """Capture the inquiry channel from metadata."""
        inquiry_channel = tracker.get_latest_input_channel()
        logger.info(f"Captured inquiry channel: '{inquiry_channel}'")
        return {"inquiry_channel": inquiry_channel}

    async def validate_sender_id(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict
    ) -> Dict[str, str]:
        """Capture sender_id from the tracker."""
        sender_id = tracker.sender_id
        logger.info(f"Captured sender ID: '{sender_id}'")
        return {"sender_id": sender_id}

class ActionAnswerWithRAG(Action):
    def name(self) -> Text:
        return "action_answer_with_rag"

    def run(
        self,
        dispatcher,
        tracker,
        domain
    ) -> List[Dict[Text, Any]]:

        user_query = tracker.latest_message.get('text', '').strip()

        if not user_query:
            dispatcher.utter_message(text="Parece que no ingresaste una consulta válida. ¿Puedes intentarlo de nuevo?")
            return [UserUtteranceReverted()]

        logger.info(f"User query for RAG: {user_query}")

        try:
            # Call RAG pipeline (no 'k' argument now)
            response = rag_app.rag_query_pipeline(user_query)

            if not response:
                response = "Lo siento, no pude encontrar información relevante."

            dispatcher.utter_message(text=response)

        except Exception as e:
            logger.error(f"Unexpected error during RAG query: {str(e)}", exc_info=True)
            dispatcher.utter_message(
                text="Ocurrió un problema al procesar tu solicitud. Nuestro equipo está trabajando en ello."
            )
            return []

        # Follow-up button prompt
        buttons = [
            {"title": "No", "payload": "/end_query"}
        ]
        dispatcher.utter_message(
            text='Por favor, haz tu próxima pregunta o selecciona "No" si no tienes más preguntas.',
            buttons=buttons
        )

        return []

class ActionCheckSatisfaction(Action):
    def name(self) -> Text:
        return "action_check_satisfaction"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        logging.info("Prompting the user for satisfaction feedback.")
        dispatcher.utter_message(
            text="¿Está satisfecho con el servicio proporcionado?",
            buttons=[
                {"title": "Satisfecho", "payload": '/satisfaction{"satisfied": "true"}'},
                {"title": "No satisfecho", "payload": '/satisfaction{"satisfied": "false"}'}
            ]
        )
        return []

class ActionHandleSatisfaction(Action):
    def name(self) -> Text:
        return "action_handle_satisfaction"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        satisfaction = tracker.get_slot("satisfied")
        logging.info(f"User satisfaction received: {satisfaction}")
        
        if satisfaction == "true":
            # dispatcher.utter_message(text="Gracias por sus comentarios. Procedamos a la encuesta de satisfacción.")
            return [SlotSet("inquiry_resolved", True), ActiveLoop("feedback_survey_form")]
        elif satisfaction == "false":
            # dispatcher.utter_message(text="Lamentamos escuchar eso. Por favor, indíquenos cómo podemos mejorar.")
            return [SlotSet("inquiry_resolved", False)]
        else:
            logging.warning("Could not understand the user's satisfaction response.")
            dispatcher.utter_message(text="No pude entender. ¿Está satisfecho?")
            return [UserUtteranceReverted()]

class ValidateFeedbackSurveyForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_feedback_survey_form"

    async def validate_ease_of_finding(self, slot_value: Any, tracker: Tracker) -> Dict[str, Any]:
        user_id = tracker.sender_id
        logger.info(f"Survey - Ease of Finding: User {user_id} rated {slot_value}")
        return {"ease_of_finding": slot_value.split(" ")[0]}  # Store as integer only

    async def validate_formats_provided(self, slot_value: Any, tracker: Tracker) -> Dict[str, Any]:
        user_id = tracker.sender_id
        logger.info(f"Survey - Formats Provided: User {user_id} rated {slot_value}")
        return {"formats_provided": slot_value.split(" ")[0]}

    async def validate_clarity_response(self, slot_value: Any, tracker: Tracker) -> Dict[str, Any]:
        user_id = tracker.sender_id
        logger.info(f"Survey - Clarity of Response: User {user_id} rated {slot_value}")
        return {"clarity_response": slot_value.split(" ")[0]}

    async def validate_attention_time(self, slot_value: Any, tracker: Tracker) -> Dict[str, Any]:
        user_id = tracker.sender_id
        logger.info(f"Survey - Attention Time: User {user_id} rated {slot_value}")
        
        # Retrieve previous survey responses
        ease = tracker.get_slot("ease_of_finding")
        formats = tracker.get_slot("formats_provided")
        clarity = tracker.get_slot("clarity_response")
        attention = slot_value.split(" ")[0]  # Store numeric part only

        logger.info(f"Survey completed for User {user_id}: Ease: {ease}, Formats: {formats}, Clarity: {clarity}, Attention: {attention}")

        return {"attention_time": attention, "survey_completed": True}


class ActionRedirectToCollectionCenter(Action):
    def name(self) -> Text:
        return "action_redirect_to_collection_center"

    async def run(
        self, 
        dispatcher: CollectingDispatcher, 
        tracker: Tracker, 
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        logging.info("Redirecting user to the Collection Service Center.")

        # Send a message to inform the user
        dispatcher.utter_message(text="Para consultas relacionadas con la estructura, está siendo redirigido.")

        # Dynamically redirect the user
        dispatcher.utter_message(json_message={"redirect": COLLECTION_CENTER_URL})

        # Update inquiry_redirect slot to TRUE to reflect redirection
        return [SlotSet("inquiry_redirect", True)]   #, Restarted()

class ActionEndConversation(Action):
    def name(self) -> Text:
        return "action_end_conversation"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="¡Fue un placer asistirle!")
        return []

###########Claims Custom Actions#################################

# Flexible email validation regex
EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
# OTP validation regex (ensures a 6-digit numerical OTP)
OTP_REGEX = r'^\d{6}$'

class ValidateUserLoginForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_user_login_form"

    def validate_user_email(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        """Validate email address and handle errors properly."""

        # Extract user email from slot value
        user_email = slot_value.strip() if slot_value else ""
        logger.info(f"User email input: {user_email}")

        # Validate email format using regex
        if not re.match(EMAIL_REGEX, user_email):
            dispatcher.utter_message(text="Por favor, ingrese una dirección de correo electrónico válida.")
            logger.warning(f"Invalid email format: {user_email}")
            return {"user_email": None}

        # API URL and payload
        api_url = f"{AUTH_BASE_URL}/api/send-chatbot-login-otp"
        payload = json.dumps({"email": user_email})
        headers = {'Content-Type': 'application/json'}

        try:
            response = requests.post(api_url, headers=headers, data=payload)
            response.raise_for_status()  # Raise an error for HTTP status codes 4xx/5xx

            # Extract OTP token from response
            otp_token = response.json().get("otpToken")

            # dispatcher.utter_message(text="Se ha enviado un código OTP a su correo electrónico. Por favor, revíselo e ingréselo aquí.")
            return {"user_email": user_email, "user_otp_token": otp_token}

        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 400:
                error_data = response.json()
                error_code = error_data.get("errorCode")
                error_message = error_data.get("errorDescription", "Hubo un problema con su solicitud. Inténtelo de nuevo.")

                # Handle invalid email format from API (`10012`)
                if error_code == 10012:
                    dispatcher.utter_message(text="El correo electrónico ingresado no es válido. Por favor, ingrese un correo bien formado (ejemplo: usuario@dominio.com).")
                    logger.warning(f"Invalid email format (server validation): {user_email}")
                    return {"user_email": None}

                # Handle already used email (`10023`)
                elif error_code == 10023:
                    dispatcher.utter_message(text="Este correo electrónico ya está asociado con una cuenta existente.")
                    logger.warning(f"Email already in use: {user_email}")
                    return {"user_email": None}

                # Handle restricted email domain (`10024`)
                elif error_code == 10024:
                    dispatcher.utter_message(text="El dominio de este correo electrónico no está permitido. Por favor, use otra dirección de correo.")
                    logger.warning(f"Email uses a restricted domain: {user_email}")
                    return {"user_email": None}

                # Handle email not registered (`10027`)
                elif error_code == 10027:
                    dispatcher.utter_message(text="La dirección de correo electrónico no está registrada. Por favor, regístrese.")
                    logger.warning(f"Email not registered: {user_email}")
                    return {"user_email": None, "user_otp_token": None}

                # Handle any other unknown error codes
                else:
                    dispatcher.utter_message(text=error_message)
                    logger.error(f"Unexpected email validation error: {error_message}")
                    return {"user_email": None}

            else:
                dispatcher.utter_message(text="OTP no es válido. Inténtelo de nuevamente.")

            logger.error(f"Failed to send OTP: {http_err}")
            return {"user_email": None, "user_otp_token": None}

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send OTP: {e}")
            dispatcher.utter_message(text="Ocurrió un error al procesar su solicitud. Por favor, verifique su conexión e inténtelo nuevamente.")
            return {"user_email": None, "user_otp_token": None}


    def validate_user_otp(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        """Validate OTP and handle errors properly."""

        # Extract the user-provided OTP from the slot value
        user_otp = slot_value.strip() if slot_value else ""
        user_otp_token = tracker.get_slot("user_otp_token")  # Retrieve OTP token stored in the tracker

        logger.info(f"User OTP input: {user_otp}")

        # Validate OTP format (should be a 6-digit number)
        if not re.match(OTP_REGEX, user_otp):
            dispatcher.utter_message(text="Formato de OTP inválido. Por favor, ingrese un OTP de 6 dígitos.")
            return {"user_otp": None}

        # Construct the API URL and payload for verifying the OTP
        api_url = f"{AUTH_BASE_URL}/api/verify-login-otp"
        payload = json.dumps({"otpCode": user_otp, "otpToken": user_otp_token})
        headers = {'Content-Type': 'application/json'}

        try:
            # Send the OTP verification request to the server
            response = requests.post(api_url, headers=headers, data=payload)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Extract ID token from the server's response
            id_token = response.json().get("id_token")

            # Inform the user that the OTP was successfully verified
            dispatcher.utter_message(
                text="¡OTP verificado con éxito!",
                json_message={"event": "otp_verified", "id_token": id_token}  # Send id_token as a custom JSON payload
            )
            return {"user_otp": user_otp, "id_token": id_token}

        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 400:
                error_data = response.json()
                error_code = error_data.get("errorCode")
                error_message = error_data.get("errorDescription", "Hubo un problema con la verificación del OTP. Inténtelo de nuevo.")

                # Handle expired OTP scenario (`10014`)
                if error_code == 10014:
                    logger.warning("OTP expired or incorrect. Attempting to resend OTP.")

                    # Construct the API URL for resending OTP
                    resend_api_url = f"{AUTH_BASE_URL}/api/resend-login-otp?otpToken={user_otp_token}"
                    try:
                        resend_response = requests.get(resend_api_url, headers={})
                        resend_response.raise_for_status()
                        logger.info("New OTP sent successfully.")

                        dispatcher.utter_message(text="El OTP ha expirado o es incorrecto. Se ha enviado un nuevo OTP a su correo electrónico. Por favor, verifique y proporcione el nuevo OTP.")
                        return {"user_otp": None}  # Reset the OTP slot for new input

                    except requests.exceptions.RequestException as resend_err:
                        logger.error(f"Failed to resend OTP: {resend_err}")
                        dispatcher.utter_message(text="El OTP ha expirado, pero no pudimos reenviar uno nuevo en este momento. Inténtelo de nuevo más tarde.")
                        return {"user_otp": None, "user_otp_token": None}

                # Handle invalid OTP scenario (`10015`)
                elif error_code == 10015:
                    dispatcher.utter_message(text="El código OTP ingresado es incorrecto. Por favor, ingrese el código correcto o solicite un nuevo OTP.")
                    logger.warning(f"Invalid OTP entered.")
                    return {"user_otp": None}

                # Handle already used OTP (`10016`)
                elif error_code == 10016:
                    dispatcher.utter_message(text="Este OTP ya ha sido utilizado. Solicite un nuevo OTP e inténtelo nuevamente.")
                    logger.warning(f"OTP already used.")
                    return {"user_otp": None}

                # Handle OTP session expired (`10017`)
                elif error_code == 10017:
                    dispatcher.utter_message(text="La sesión del OTP ha expirado. Por favor, solicite un nuevo OTP.")
                    logger.warning(f"OTP session expired.")
                    return {"user_otp": None}

                # Handle OTP verification limit exceeded (`10018`)
                elif error_code == 10018:
                    dispatcher.utter_message(text="Ha superado el número máximo de intentos de OTP. Inténtelo más tarde o solicite un nuevo OTP.")
                    logger.warning(f"OTP verification limit exceeded.")
                    return {"user_otp": None}

                # Handle any other unknown error codes
                else:
                    dispatcher.utter_message(text=error_message)
                    logger.error(f"Unexpected OTP verification error: {error_message}")
                    return {"user_otp": None}

            else:
                dispatcher.utter_message(text="OTP no es válido. Inténtelo de nuevamente.")

            logger.error(f"Invalid OTP verification attempt: {http_err}")
            return {"user_otp": None, "id_token": None}

        except requests.exceptions.RequestException as e:
            logger.error(f"OTP verification request failed: {e}")
            dispatcher.utter_message(text="Ocurrió un error al verificar el OTP. Por favor, verifica tu conexión a internet e inténtalo nuevamente.")
            
            # Deactivate the loop to prevent further OTP prompts
            return {"user_otp": None, "id_token": None, "active_loop": None}


# class ValidateUserForm(FormValidationAction):
#     def name(self) -> Text:
#         return "validate_user_registration_form"

#     # Validate the national ID provided by the user
#     def validate_new_user_national_id(
#         self,
#         slot_value: Any,  # The value entered by the user
#         dispatcher: CollectingDispatcher,  # Used to send messages to the user
#         tracker: Tracker,  # Tracks the state of the conversation
#         domain: Dict[Text, Any],  # Domain configuration for the bot
#     ) -> Dict[Text, Any]:
#         national_id = slot_value
#         url = f"{AUTH_BASE_URL}/api/person-info?identificacion={national_id}"

#         try:
#             logger.info(f"Validating National ID: {national_id}")
#             headers = {"Accept-Language": "es"}  # Use Spanish for the API request
#             response = requests.get(url, headers=headers, timeout=120)  # Make the API call with a timeout of 60 seconds
#             response.raise_for_status()  # Raise an error for HTTP issues
#             response_data = response.json()  # Parse the response JSON

#             # Check if the API validated the national ID
#             if response_data.get("identificacion") == national_id:
#                 logger.info(f"National ID {national_id} validated successfully. Name: {response_data.get('nombreCompleto')}")
#                 logger.debug(f"Setting slot 'new_user_national_id' with value: {national_id}")
#                 return {"new_user_national_id": national_id}
#             else:
#                 # Inform the user that validation failed
#                 dispatcher.utter_message(
#                     text="No pudimos verificar su documento de identificación. Por favor, revise los datos proporcionados y vuelva a intentar."
#                 )
#                 logger.error(f"Validation failed for National ID {national_id}. Response: {response_data}")
#                 logger.debug(f"Slot 'new_user_national_id' not set. Value is None.")
#                 return {"new_user_national_id": None}
#         except requests.exceptions.RequestException as e:
#             # Handle network issues
#             logger.exception(f"Network error during National ID validation: {e}")
#             dispatcher.utter_message(
#                 text="Ocurrió un problema de conexión mientras verificábamos su documento de identificación. Por favor, intente nuevamente."
#             )
#             logger.debug(f"Slot 'new_user_national_id' not set due to network error. Value is None.")
#             return {"new_user_national_id": None}
#         except Exception as e:
#             # Handle unexpected errors
#             logger.exception(f"Unexpected error during National ID validation: {e}")
#             dispatcher.utter_message(
#                 text="Ocurrió un error mientras verificábamos su documento de identificación. Por favor, intente nuevamente."
#             )
#             logger.debug(f"Slot 'new_user_national_id' not set due to unexpected error. Value is None.")
#             return {"new_user_national_id": None}

#     # Validate the fingerprint provided by the user
#     def validate_new_user_fingerprint(
#         self,
#         slot_value: Any,  # The value entered by the user
#         dispatcher: CollectingDispatcher,  # Used to send messages to the user
#         tracker: Tracker,  # Tracks the state of the conversation
#         domain: Dict[Text, Any],  # Domain configuration for the bot
#     ) -> Dict[Text, Any]:
#         national_id = tracker.get_slot("new_user_national_id")  # Retrieve the previously set national ID
#         fingerprint = slot_value
#         url = f"{AUTH_BASE_URL}/api/validate-individual-person"
#         payload = json.dumps({"identificacion": national_id, "individualDactilar": fingerprint})  # Prepare the payload
#         headers = {"Accept-Language": "es", "Content-Type": "application/json"}  # Set headers for the API request

#         try:
#             logger.info(f"Validating fingerprint for National ID: {national_id}")
#             response = requests.post(url, headers=headers, data=payload, timeout=120)  # Make the API call with a timeout of 60 seconds
#             response.raise_for_status()  # Raise an error for HTTP issues
#             response_data = response.json()  # Parse the response JSON

#             # Check if the API validated the fingerprint
#             if isinstance(response_data, bool):
#                 if response_data:
#                     logger.info(f"Fingerprint verification successful for National ID: {national_id}")
#                     logger.debug(f"Setting slots 'new_user_fingerprint' with value: {fingerprint} and 'new_user_fingerprint_valid' with value: True")
#                     return {"new_user_fingerprint": fingerprint, "new_user_fingerprint_valid": True}
#                 else:
#                     # Inform the user that validation failed
#                     dispatcher.utter_message(
#                         text="No pudimos verificar su código dactilar. Por favor, revise los datos proporcionados y vuelva a intentarlo."
#                     )
#                     logger.error(f"Fingerprint validation failed for National ID {national_id}. Response: {response_data}")
#                     logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set. Values are None and False.")
#                     return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}
#             else:
#                 # Handle unexpected response format
#                 logger.error(f"Unexpected response format: {response_data}")
#                 dispatcher.utter_message(
#                     text="Error durante la verificación de su código dactilar. Por favor, inténtelo más tarde."
#                 )
#                 logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set due to unexpected response format. Values are None and False.")
#                 return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}
#         except requests.exceptions.RequestException as e:
#             # Handle network issues
#             logger.exception(f"Network error during fingerprint validation: {e}")
#             dispatcher.utter_message(
#                 text="Ocurrió un problema de conexión mientras verificábamos su código dactilar. Por favor, inténtelo nuevamente."
#             )
#             logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set due to network error. Values are None and False.")
#             return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}
#         except Exception as e:
#             # Handle unexpected errors
#             logger.exception(f"Unexpected error during fingerprint validation: {e}")
#             dispatcher.utter_message(
#                 text="Ocurrió un error mientras verificábamos su código dactilar. Por favor, inténtelo nuevamente."
#             )
#             logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set due to unexpected error. Values are None and False.")
#             return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}

class ValidateUserForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_user_registration_form"

    def make_api_request(self, url: str, method: str = "GET", headers: Dict[str, str] = None, data: Dict = None, retries: int = 3, delay: int = 5) -> Dict:
        """
        Makes an API request with retry logic for handling 503 errors.
        Retries up to `retries` times before giving up.
        """
        for attempt in range(retries):
            try:
                logger.info(f"Attempt {attempt + 1}: Calling API {url}")
                if method == "GET":
                    response = requests.get(url, headers=headers, timeout=15)
                elif method == "POST":
                    response = requests.post(url, headers=headers, json=data, timeout=15)

                if response.status_code == 200:
                    response_data = response.json()
                    
                    # ✅ Ensure that the response is always returned as a dictionary
                    if isinstance(response_data, bool):  
                        return {"success": response_data}  

                    return response_data  # ✅ Success, return data
                
                elif response.status_code == 503:
                    logger.warning(f"Service Unavailable (503). Retrying in {delay} seconds...")
                    time.sleep(delay)  # Wait before retrying
                    continue  # Retry
                
                else:
                    return {"error": f"Unexpected status code {response.status_code}"}
            
            except requests.exceptions.RequestException as e:
                logger.error(f"Network error: {e}")
                return {"error": "Network error"}

        return {"error": "Service unavailable after multiple retries"}  # ❌ Final failure after retries


    # Validate the national ID provided by the user
    def validate_new_user_national_id(
        self,
        slot_value: Any,  
        dispatcher: CollectingDispatcher,  
        tracker: Tracker,  
        domain: Dict[Text, Any],  
    ) -> Dict[Text, Any]:
        national_id = slot_value
        url = f"{AUTH_BASE_URL}/api/person-info?identificacion={national_id}"
        headers = {"Accept-Language": "es"}  

        # ✅ New 503 Handling Addition
        for attempt in range(3):
            response_data = self.make_api_request(url, "GET", headers)
            if "error" not in response_data:
                break
            logger.warning(f"Retry {attempt + 1}: Service unavailable for National ID verification.")
            time.sleep(3)  # Wait before retrying

        if "error" in response_data:
            dispatcher.utter_message(
                text="El servicio de verificación de identificación no está disponible. Inténtelo nuevamente más tarde."
            )
            return {"new_user_national_id": None}

        if response_data.get("identificacion") == national_id:
            logger.info(f"National ID {national_id} validated successfully.")
            return {"new_user_national_id": national_id}

        dispatcher.utter_message(
            text="No pudimos verificar su identificación nacional. Por favor, revise los datos y vuelva a intentarlo."
        )
        return {"new_user_national_id": None}

    def validate_new_user_fingerprint(
        self,
        slot_value: Any,  
        dispatcher: CollectingDispatcher,  
        tracker: Tracker,  
        domain: Dict[Text, Any],  
    ) -> Dict[Text, Any]:
        national_id = tracker.get_slot("new_user_national_id")  
        fingerprint = slot_value
        url = f"{AUTH_BASE_URL}/api/validate-individual-person"
        headers = {"Accept-Language": "es", "Content-Type": "application/json"}  
        payload = {"identificacion": national_id, "individualDactilar": fingerprint}

        # ✅ New 503 Handling Addition
        for attempt in range(3):
            response_data = self.make_api_request(url, "POST", headers, payload)
            if isinstance(response_data, dict) and "error" not in response_data:
                break
            logger.warning(f"Retry {attempt + 1}: Service unavailable for fingerprint verification.")
            time.sleep(3)  # Wait before retrying

        if "error" in response_data:
            dispatcher.utter_message(
                text="El servicio de validación de huellas dactilares no está disponible. Inténtelo nuevamente más tarde."
            )
            return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}

        # ✅ Handle boolean response correctly
        if isinstance(response_data.get("success"), bool):
            if response_data["success"]:
                logger.info(f"Fingerprint verification successful for National ID: {national_id}")
                return {"new_user_fingerprint": fingerprint, "new_user_fingerprint_valid": True}
            else:
                dispatcher.utter_message(
                    text="No pudimos verificar su código dactilar. Por favor, revise los datos y vuelva a intentarlo."
                )
                return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}

        dispatcher.utter_message(
            text="Ocurrió un error inesperado durante la verificación de su código dactilar. Inténtelo más tarde."
        )
        return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}


class ValidatePhoneNumberForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_phone_number_form"

    # Validate the phone number provided by the user
    async def validate_phone_number(
        self,
        value: Text,  # The value entered by the user
        dispatcher: CollectingDispatcher,  # Used to send messages to the user
        tracker: Tracker,  # Tracks the state of the conversation
        domain: Dict[Text, Any],  # Domain configuration for the bot
    ) -> Dict[Text, Any]:
        """
        Validate the phone number entered by the user.
        Accepts up to 15 digits.
        """
        if re.fullmatch(r"\d{1,10}", value):  # Check if the value is up to 15 digits
            logger.debug(f"Setting slot 'phone_number' with value: {value}")
            return {"phone_number": value}
        else:
            # Inform the user with a wrapper message
            dispatcher.utter_message(text="El número de teléfono debe contener hasta 10 dígitos. Por favor, introduce un número válido.")
            logger.error("Phone number validation failed. Value does not match the expected format.")
            return {"phone_number": None}


class ValidateVerifyEmailForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_verify_email_form"

    def validate_new_user_email(
        self,
        value: Text,  # The email address entered by the user
        dispatcher: CollectingDispatcher,  # Used to send messages to the user
        tracker: Tracker,  # Tracks the state of the conversation
        domain: Dict[Text, Any],  # Domain configuration for the bot
    ) -> Optional[Dict[Text, Any]]:
        """Validate the provided email address and send OTP."""

        user_email = value.strip() if value else ""
        
        # Validate email format using regex (prevent invalid formats before API call)
        if not re.match(EMAIL_REGEX, user_email):
            dispatcher.utter_message(text="Por favor, ingrese una dirección de correo electrónico válida.")
            logger.warning(f"Invalid email format: {user_email}")
            return {"new_user_email": None}

        # API request setup
        url = f"{AUTH_BASE_URL}/api/register/request-otp"
        payload = json.dumps({"email": user_email})
        headers = {'Accept-Language': 'en', 'Content-Type': 'application/json'}

        try:
            logger.info(f"Requesting OTP for email: {user_email}")
            response = requests.post(url, headers=headers, data=payload, timeout=120)
            
            if response.status_code == 200:
                response_data = response.json()
                if response_data.get("status") == 200:
                    # dispatcher.utter_message(text="Se ha enviado un código OTP a tu correo electrónico.")
                    logger.debug(f"Setting slot 'new_user_email' with value: {user_email}")
                    return {"new_user_email": user_email}
                else:
                    dispatcher.utter_message(text="No pudimos enviar el código OTP. Verifica que hayas ingresado un correo válido.")
                    logger.error(f"Failed to send OTP for email {user_email}. API response status is not 200.")
                    return {"new_user_email": None}
            
            elif response.status_code == 400:
                response_data = response.json()
                error_code = response_data.get("errorCode")
                error_message = response_data.get("errorDescription", "Solicitud incorrecta. Inténtalo de nuevo.")

                # Handle email validation error from API (`errorCode: 10012`)
                if error_code == 10012:
                    dispatcher.utter_message(text="El correo electrónico ingresado no es válido. Por favor, ingrese un correo bien formado (ejemplo: usuario@dominio.com).")
                    logger.warning(f"Invalid email format (server validation): {user_email}")
                    return {"new_user_email": None}

                elif error_code == 10023:  # Handle "email already used" case
                    dispatcher.utter_message(text="Este correo electrónico ya está asociado con una cuenta existente.")
                    logger.warning(f"Email {user_email} already in use.")
                    return {"new_user_email": None}
                
                elif error_code == 10024:  # Handle "email domain not allowed" (if applicable)
                    dispatcher.utter_message(text="El dominio de este correo electrónico no está permitido. Por favor, use otra dirección de correo.")
                    logger.warning(f"Email {user_email} uses a restricted domain.")
                    return {"new_user_email": None}

                else:
                    dispatcher.utter_message(text=f"Error: {error_message}")
                    logger.error(f"Unexpected error while requesting OTP for {user_email}: {error_message}")
                    return {"new_user_email": None}
            
            else:
                dispatcher.utter_message(text="Hubo un problema con el servidor al enviar el código OTP. Por favor, intenta más tarde.")
                logger.error(f"Failed to send OTP for {user_email}. Server returned status code: {response.status_code}")
                return {"new_user_email": None}

        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(text="No se pudo enviar el código OTP. Por favor, inténtalo de nuevo.")
            logger.exception(f"Network error while requesting OTP for email {user_email}: {e}")
            return {"new_user_email": None}

    def validate_new_user_otp(
        self,
        value: Text,  # The OTP entered by the user
        dispatcher: CollectingDispatcher,  # Used to send messages to the user
        tracker: Tracker,  # Tracks the state of the conversation
        domain: Dict[Text, Any],  # Domain configuration for the bot
    ) -> Optional[Dict[Text, Any]]:
        """Validate the provided OTP and verify it."""

        # Strip any spaces and validate OTP format
        user_otp = value.strip() if value else ""
        if not re.match(OTP_REGEX, user_otp):
            dispatcher.utter_message(text="Formato de OTP inválido. Por favor, ingrese un OTP de 6 dígitos.")
            logger.error(f"OTP validation failed. Invalid OTP entered: {user_otp}")
            return {"new_user_otp": None}

        # Retrieve email from slot
        email = tracker.get_slot("new_user_email")
        if not email:
            dispatcher.utter_message(text="Parece que no tenemos un correo registrado. Inténtalo de nuevo desde el inicio.")
            logger.error("OTP validation failed. No email found in slot.")
            return {"new_user_otp": None}

        # Construct API URL and payload
        url = f"{AUTH_BASE_URL}/api/register/verify-otp"
        payload = json.dumps({"email": email, "otpCode": user_otp})
        headers = {'Accept-Language': 'en', 'Content-Type': 'application/json'}

        try:
            logger.info(f"Verifying OTP for email: {email}")
            response = requests.post(url, headers=headers, data=payload, timeout=120)
            
            # OTP verification successful
            if response.status_code == 204:
                logger.debug(f"Setting slot 'new_user_otp' with value: {user_otp}")
                # dispatcher.utter_message(text="¡OTP verificado con éxito!")
                return {"new_user_otp": user_otp}

            elif response.status_code == 400:
                response_data = response.json()
                error_code = response_data.get("errorCode")
                error_message = response_data.get("errorDescription", "El código OTP es incorrecto o ha expirado.")

                # Handle expired OTP scenario (`errorCode: 10014`)
                if error_code == 10014:
                    logger.warning("OTP expired or incorrect. Attempting to resend OTP.")

                    # Resend OTP API call
                    resend_url = f"{AUTH_BASE_URL}/api/register/resend-otp?email={email}"
                    try:
                        resend_response = requests.get(resend_url, headers=headers, timeout=120)
                        resend_response.raise_for_status()  # Raise exception if request fails
                        logger.info("New OTP sent successfully.")

                        dispatcher.utter_message(text="El OTP ha expirado o es incorrecto. Se ha enviado un nuevo OTP a su correo electrónico. Por favor, verifique y proporcione el nuevo OTP.")
                        return {"new_user_otp": None}  # Reset OTP slot for new input

                    except requests.exceptions.RequestException as resend_err:
                        logger.error(f"Failed to resend OTP: {resend_err}")
                        dispatcher.utter_message(text="El OTP ha expirado, pero no pudimos reenviar uno nuevo en este momento. Inténtelo de nuevo más tarde.")
                        return {"new_user_otp": None}

                # Handle invalid OTP scenario (`errorCode: 10015`)
                elif error_code == 10015:
                    dispatcher.utter_message(text="El código OTP ingresado es incorrecto. Por favor, ingrese el código correcto o solicite un nuevo OTP.")
                    logger.warning(f"Invalid OTP entered for email {email}.")
                    return {"new_user_otp": None}

                # If not an expired or invalid OTP, show the error message
                dispatcher.utter_message(text=error_message)
                logger.error(f"OTP verification failed for email {email}. Error: {error_message}")
                return {"new_user_otp": None}

            else:
                dispatcher.utter_message(text="Hubo un problema al verificar el código OTP. Por favor, intenta nuevamente.")
                logger.error(f"OTP verification failed for email {email}. Server returned status code: {response.status_code}")
                return {"new_user_otp": None}

        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(text="Ocurrió un error al verificar el OTP. Por favor, verifica tu conexión a internet e inténtalo nuevamente.")
            logger.exception(f"Network error while verifying OTP for email {email}: {e}")
            return {"new_user_otp": None}

# class RegisterUser(Action):
#     def name(self) -> str:
#         return "action_register_user"

#     def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: DomainDict):
#         # Gather all required user information from slots
#         national_id = tracker.get_slot("new_user_national_id")  # User's national identification number
#         fingerprint = tracker.get_slot("new_user_fingerprint")  # User's fingerprint data
#         email = tracker.get_slot("new_user_email")  # User's email address
#         otp = tracker.get_slot("new_user_otp")  # OTP code provided by the user
#         mobile_number = tracker.get_slot("phone_number")  # User's mobile phone number
#         country_code = "+593"  # Assuming a static country code for the phone number

#         # Check if all required details are available
#         if not (national_id and fingerprint and email and otp and mobile_number):
#             dispatcher.utter_message(text="El registro no puede proceder. Por favor, proporcione todos los detalles requeridos.")
#             logger.warning("Incomplete user details provided for registration.")
#             return []

#         # Helper function to make API calls
#         def make_api_call(url, headers, payload):
#             try:
#                 # Make the API POST request
#                 response = requests.post(url, headers=headers, data=payload, timeout=120)
#                 response.raise_for_status()  # Raise exception for HTTP errors
#                 return response
#             except requests.exceptions.HTTPError as http_err:
#                 logger.error(f"HTTP error occurred: {http_err}")
#                 return None
#             except Exception as err:
#                 logger.error(f"Other error occurred: {err}")
#                 return None

#         # API endpoint and payload for user registration
#         url = f"{AUTH_BASE_URL}/api/register"
#         payload = json.dumps({
#             "identificacion": national_id,  # National ID
#             "individualDactilar": fingerprint,  # Fingerprint data
#             "email": email,  # Email address
#             "otpCode": otp,  # OTP code
#             "countryCode": country_code,  # Country code for the phone number
#             "phoneNumber": mobile_number  # Phone number
#         })
#         headers = {
#             'Content-Type': 'application/json'  # Specify JSON content type
#         }

#         logger.info(f"Registering user with National ID: {national_id}")  # Log registration attempt
#         response = make_api_call(url, headers, payload)  # Make the API call

#         # Handle API response
#         if response and response.status_code == 200:
#             response_data = response.json()  # Parse the JSON response
#             id_token = response_data.get("id_token")  # Retrieve the ID token if present

#             if id_token:
#                 logger.debug(f"Setting slot 'id_token' with value: {id_token}")  # Debug log for setting slot
#                 # dispatcher.utter_message(text="¡Registro exitoso! Ahora puede continuar con la presentación de una reclamación.")
#                 dispatcher.utter_message(
#                     text="¡Registro exitoso! Ahora puede continuar con la presentación de una reclamación.",
#                     json_message={"event": "otp_verified", "id_token": id_token}  # Send id_token as a custom JSON payload
#                 )

#                 logger.info(f"User with National ID {national_id} registered successfully.")
#                 return [
#                     {"event": "slot", "name": "new_user_registered", "value": True},  # Indicate registration success
#                     {"event": "slot", "name": "id_token", "value": id_token}  # Store ID token in slot
#                 ]
#             else:
#                 # Handle missing ID token in the response
#                 dispatcher.utter_message(text="El registro falló debido a que la identificación nacional y la código dactila ya están registradas.")
#                 logger.error(f"Failed to retrieve ID token for user with National ID {national_id}. Response: {response.text}")
#                 return []
#         elif response and response.status_code == 400:
#             # Handle bad request errors
#             logger.error(f"Registration failed for user with National ID {national_id}. Response: {response.text}")
#             dispatcher.utter_message(text="El registro falló. Inténtelo de nuevo más tarde.")
#             return []
#         else:
#             # Handle other errors or lack of response
#             dispatcher.utter_message(text="El registro falló debido a que la identificación nacional y la código dactilar ya están registradas.")
#             logger.error(f"Failed to register user with National ID {national_id}. Response: {response.text if response else 'No response'}")
#             return []

class RegisterUser(Action):
    def name(self) -> str:
        return "action_register_user"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: DomainDict):
        # Gather all required user information from slots
        national_id = tracker.get_slot("new_user_national_id")  # User's national identification number
        fingerprint = tracker.get_slot("new_user_fingerprint")  # User's fingerprint data
        email = tracker.get_slot("new_user_email")  # User's email address
        otp = tracker.get_slot("new_user_otp")  # OTP code provided by the user
        mobile_number = tracker.get_slot("phone_number")  # User's mobile phone number
        country_code = "+593"  # Assuming a static country code for the phone number

        # Check if all required details are available
        if not (national_id and fingerprint and email and otp and mobile_number):
            dispatcher.utter_message(text="El registro no puede proceder. Por favor,complete toda la información requerida.")
            logger.warning("Incomplete user details provided for registration.")
            return [SlotSet("registration_success", False)]  # Indicate registration failure

        # Helper function to make API calls
        def make_api_call(url, headers, payload):
            try:
                # Make the API POST request
                response = requests.post(url, headers=headers, data=payload, timeout=120)
                response.raise_for_status()  # Raise exception for HTTP errors
                return response
            except requests.exceptions.HTTPError as http_err:
                logger.error(f"HTTP error occurred: {http_err}")
                return None
            except Exception as err:
                logger.error(f"Other error occurred: {err}")
                return None

        # API endpoint and payload for user registration
        url = f"{AUTH_BASE_URL}/api/register"
        payload = json.dumps({
            "identificacion": national_id,  # National ID
            "individualDactilar": fingerprint,  # Fingerprint data
            "email": email,  # Email address
            "otpCode": otp,  # OTP code
            "countryCode": country_code,  # Country code for the phone number
            "phoneNumber": mobile_number  # Phone number
        })
        headers = {
            'Content-Type': 'application/json'  # Specify JSON content type
        }

        logger.info(f"Registering user with National ID: {national_id}")  # Log registration attempt
        response = make_api_call(url, headers, payload)  # Make the API call

        # Handle API response
        if response and response.status_code == 200:
            response_data = response.json()  # Parse the JSON response
            id_token = response_data.get("id_token")  # Retrieve the ID token if present

            if id_token:
                logger.debug(f"Setting slot 'id_token' with value: {id_token}")  # Debug log for setting slot
                dispatcher.utter_message(
                    text="¡OTP verificado con éxito!¡Registro exitoso! Ahora puede continuar con su reclamo.", 
                    json_message={"event": "otp_verified", "id_token": id_token}  # Send id_token as a custom JSON payload
                )

                logger.info(f"User with National ID {national_id} registered successfully.")
                return [
                    SlotSet("new_user_registered", True),  # Indicate registration success
                    SlotSet("id_token", id_token),  # Store ID token in slot
                    SlotSet("registration_success", True)  # ✅ Added: Mark registration as successful
                ]
            else:
                # Handle missing ID token in the response
                dispatcher.utter_message(text="El registro falló debido a que la identificación nacional y la código dactilar ya están registradas.")
                logger.error(f"Failed to retrieve ID token for user with National ID {national_id}. Response: {response.text}")
                return [SlotSet("registration_success", False)]  # ✅ Added: Mark registration as failed
        elif response and response.status_code == 400:
            # Handle bad request errors
            logger.error(f"Registration failed for user with National ID {national_id}. Response: {response.text}")
            dispatcher.utter_message(text="El registro falló. Inténtelo nuevamente.")
            return [SlotSet("registration_success", False)]  # ✅ Added: Mark registration as failed
        else:
            # Handle other errors or lack of response
            dispatcher.utter_message(text="El registro falló debido a que la identificación nacional y la código dactilar ya están registradas.")
            logger.error(f"Failed to register user with National ID {national_id}. Response: {response.text if response else 'No response'}")
            return [SlotSet("registration_success", False)]  # ✅ Added: Mark registration as failed

class ActionFetchBasicUserInfo(Action):
    def name(self) -> Text:
        return "action_fetch_basic_user_info"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Endpoint URL to fetch user account details
        url = f"{USER_BASE_URL}/api/v1/account"
        logger.info("Fetching user basic information from URL: %s", url)

        # Retrieve the authorization token from the tracker slots
        auth_token = tracker.get_slot("id_token")
        if not auth_token:
            logger.error("Authorization token is missing in slot.")
            dispatcher.utter_message(text="Error de autenticación. Inicie sesión nuevamente")
            return []

        # Authorization header for the API request
        headers = {
            'Authorization': f'Bearer {auth_token}'
        }

        try:
            # Make an API request to fetch user details
            #response = requests.get(url, headers=headers, timeout=120)
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise an error if the request fails
            user_data = response.json()  # Parse the JSON response
            logger.info("User data fetched successfully: %s", user_data)

            # Extract required information from the API response
            claim_national_id = user_data.get("identificacion", "N/A")
            claim_full_name = user_data.get("name", "N/A")
            claim_email = user_data.get("email", "N/A")
            claim_country_code = user_data.get("countryCode", "")
            claim_phone_number = user_data.get("phoneNumber", "N/A")
            claim_gender = user_data.get("gender", "N/A")
            formatted_phone_number = f"{claim_country_code} {claim_phone_number}" if claim_country_code else claim_phone_number

            # Debugging to confirm slots are set correctly
            logger.debug(
                "Setting slots: claim_national_id=%s, claim_full_name=%s, claim_email=%s, claim_country_code=%s, claim_phone_number=%s, claim_gender=%s",
                claim_national_id, claim_full_name, claim_email, claim_country_code, formatted_phone_number, claim_gender
            )
            return [
                SlotSet("claim_national_id", claim_national_id),
                SlotSet("claim_full_name", claim_full_name),
                SlotSet("claim_email", claim_email),
                SlotSet("claim_country_code", claim_country_code),
                SlotSet("claim_phone_number", formatted_phone_number),
                SlotSet("claim_gender", claim_gender)
            ]
        except requests.exceptions.RequestException as req_error:
            logger.error("RequestException occurred: %s", str(req_error))
            dispatcher.utter_message(text="An error occurred while fetching your information. Please try again later.")
        except Exception as e:
            logger.error("Unexpected error occurred: %s", str(e))
            dispatcher.utter_message(text="Something went wrong. Please try again later.")

        return []

class ActionHandleProvinceAndCanton(Action):
    def name(self) -> Text:
        return "action_handle_province_and_canton"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Base URLs
        api_url_provinces = f"{ADMIN_BASE_URL}/api/v1/provinces/dropdown-list"
        selected_province = tracker.get_slot("province")
        selected_province_id = tracker.get_slot("province_id")
        selected_canton = tracker.get_slot("canton")
        selected_canton_id = tracker.get_slot("canton_id")

        # Debug tracker slots
        logger.info(f"Tracker slots: {tracker.current_slot_values()}")

        # Step 1: Fetch provinces if not selected
        if not selected_province:
            auth_token = tracker.get_slot("id_token")
            if not auth_token:
                dispatcher.utter_message(text="Lo siento, falta el token de autorización. Por favor, inicie sesión nuevamente.")
                return []

            headers = {'Authorization': f'Bearer {auth_token}'}

            try:
                logger.info("Fetching provinces...")
                response = requests.get(api_url_provinces, headers=headers)
                logger.info(f"Provinces response: {response.status_code}")

                if response.status_code == 200:
                    provinces = response.json()
                    buttons = [
                        {
                            "title": province["name"],
                            "payload": f'/select_province{{"province_id": "{province["id"]}", "province": "{province["name"]}"}}'
                        } for province in provinces
                    ]
                    dispatcher.utter_message(text="Por favor seleccione su Provincia de Residencia:", buttons=buttons)
                else:
                    logger.error(f"Failed to fetch provinces. Status: {response.status_code}")
                    dispatcher.utter_message(text="Ocurrió un problema al obtener la lista de provincias. Por favor intente nuevamente más tarde.")
            except Exception as e:
                logger.error(f"Error while fetching provinces: {str(e)}")
                dispatcher.utter_message(text="Ha ocurrido un error inesperado al obtener las provincias. Por favor intente nuevamente más tarde.")
            return []

        # Step 2: Fetch cantons if province is selected but not canton
        elif selected_province and not selected_canton:
            if not selected_province_id:
                logger.error("Province ID is None. Cannot fetch cantons.")
                dispatcher.utter_message(text="Por favor seleccione una Provincia válida para continuar.")
                return []

            url = f"{USER_BASE_URL}/api/v1/masters/city-list/{selected_province_id}"
            auth_token = tracker.get_slot("id_token")
            if not auth_token:
                dispatcher.utter_message(text="Lo siento, falta el token de autorización. Por favor, inicie sesión nuevamente.")
                return []

            headers = {
                'Authorization': f'Bearer {auth_token}'
            }

            try:
                logger.info(f"Fetching cantons for province ID: {selected_province_id}")
                response = requests.get(url, headers=headers)
                logger.info(f"Cantons response: {response.status_code}")

                if response.status_code == 200:
                    cantons = response.json()
                    buttons = [
                        {
                            "title": canton["name"],
                            "payload": f'/select_canton{{"canton_id": "{canton["id"]}", "canton": "{canton["name"]}"}}'
                        } for canton in cantons
                    ]
                    dispatcher.utter_message(text="Por favor seleccione su Cantón:", buttons=buttons)
                else:
                    logger.error(f"Failed to fetch cantons. Status: {response.status_code}")
                    dispatcher.utter_message(text="Ocurrió un problema al obtener la lista de cantones. Por favor intente nuevamente más tarde.")
            except Exception as e:
                logger.error(f"Error while fetching cantons: {str(e)}")
                dispatcher.utter_message(text="Ha ocurrido un error inesperado al obtener los cantones. Por favor intente nuevamente más tarde.")
            return []

        # Step 3: Final response if both province and canton are selected
        else:
            logger.info(f"Province: {selected_province}, Canton: {selected_canton}, Canton ID: {selected_canton_id}")
            return []


class ActionFetchAndSelectPriorityCareGroupOptions(Action):

    def name(self) -> str:
        return "action_fetch_and_select_priority_care_group_options"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
 
        url = f"{TICKET_BASE_URL}/api/v1/masters"
        logger.info("Fetching priority care group information from URL: %s", url)

        # Retrieve the authorization token from the tracker slots
        auth_token = tracker.get_slot("id_token")
        if not auth_token:
            logger.error("Authorization token is missing in slot.")
            dispatcher.utter_message(text="El código de autenticación falta. Por favor, inicie sesión nuevamente")
            return []

        headers = {
            'Accept-Language': 'es',
            'Authorization': f'Bearer {auth_token}'
        }

        try:
            response = requests.get(url, headers=headers)
            logger.info("Received response with status code: %s", response.status_code)

            if response.status_code == 200:
                data = response.json()
                logger.info("Successfully fetched priority care group data: %s", data)

                # Generate dynamic buttons for priorityCareGroup
                priority_care_group = data.get("priorityCareGroup", {})
                if priority_care_group:
                    buttons = [
                        {
                            "title": label,
                            "payload": f"/set_priority_care_group{{\"priorityCareGroup\": \"{key}\"}}"
                        }
                        for key, label in priority_care_group.items()
                    ]
                    dispatcher.utter_message(text="Seleccione el grupo de atención prioritario:", buttons=buttons)
                    return [SlotSet("priority_care_groups", priority_care_group)]
                else:
                    logger.warning("priorityCareGroup data is missing in response.")
                    dispatcher.utter_message(text="No se encontraron grupos de atención prioritarios.")
            else:
                logger.error("Failed to fetch priority care group data. Status code: %s, Response: %s", response.status_code, response.text)
                dispatcher.utter_message(text="No se pudo obtener la información del grupo de atención prioritario. Por favor, intente más tarde.")

        except requests.exceptions.RequestException as e:
            logger.error("An error occurred while fetching priority care group data: %s", str(e))
            dispatcher.utter_message(text="Hubo un problema al conectar con el servicio. Por favor, intente más tarde.")

        return []

class ActionFetchAndSelectCustomerTypeOptions(Action):

    def name(self) -> str:
        return "action_fetch_and_select_customer_type_options"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
   
        url = f"{TICKET_BASE_URL}/api/v1/masters"
        logger.info("Fetching customer type information from URL: %s", url)

        # Retrieve the authorization token from the tracker slots
        auth_token = tracker.get_slot("id_token")
        if not auth_token:
            logger.error("Authorization token is missing in slot.")
            dispatcher.utter_message(text="El código de autenticación falta. Por favor, inicie sesión nuevamente")
            return []

        headers = {
            'Accept-Language': 'es',
            'Authorization': f'Bearer {auth_token}'
        }

        try:
            response = requests.get(url, headers=headers)
            logger.info("Received response with status code: %s", response.status_code)

            if response.status_code == 200:
                data = response.json()
                logger.info("Successfully fetched customer type data: %s", data)

                # Generate dynamic buttons for customerType
                customer_type = data.get("customerType", {})
                if customer_type:
                    buttons = [
                        {
                            "title": label,
                            "payload": f"/set_customer_type{{\"customerType\": \"{key}\"}}"
                        }
                        for key, label in customer_type.items()
                    ]
                    dispatcher.utter_message(text="Seleccione el tipo de usuario:", buttons=buttons)
                    return [SlotSet("customer_types", customer_type)]
                else:
                    logger.warning("customerType data is missing in response.")
                    dispatcher.utter_message(text="No se encontraron tipos de cliente.")
            else:
                logger.error("Failed to fetch customer type data. Status code: %s, Response: %s", response.status_code, response.text)
                dispatcher.utter_message(text="No se pudo obtener la información del tipo de cliente. Por favor, intente más tarde.")

        except requests.exceptions.RequestException as e:
            logger.error("An error occurred while fetching customer type data: %s", str(e))
            dispatcher.utter_message(text="Hubo un problema al conectar con el servicio. Por favor, intente más tarde.")

        return []



# Action class to fetch organization list
class ActionFetchOrganizationList(Action):
    def name(self) -> Text:
        return "action_fetch_organization_list"

    def run(self, dispatcher, tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Construct the API endpoint URL
        url = f"{USER_BASE_URL}/api/v1/masters/organization-list"
        logger.info("Fetching organization list from URL: %s", url)

        # Retrieve the authorization token from the tracker slots
        auth_token = tracker.get_slot("id_token")
        if not auth_token:
            logger.error("Authorization token is missing in slot.")
            # Inform the user that they need to log in again
            dispatcher.utter_message(text="No se encontró el token de autorización. Por favor, inicie sesión nuevamente.")
            return []

        # Setup headers for the API request, including the authorization token
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {auth_token}'
        }

        try:
            # Send a GET request to fetch the organization list
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            # Parse the response as JSON
            organizations = response.json()
            logger.info("Organization list fetched successfully: %s", organizations)

            # Create a map of organizations for button display and storage
            organization_map = {
                str(index + 1): {
                    "ruc": org["ruc"],
                    "name": org["razonSocial"],
                    "nemonico": org["nemonicoTipoOrganizacion"],
                    "organization_id": org["id"]  # Adding organization ID
                } for index, org in enumerate(organizations)
            }

            # Display organization options as buttons to the user
            dispatcher.utter_message(
                text="Por favor, seleccione una entidad financiera:",
                buttons=[
                    {"title": org["razonSocial"], "payload": f"/select_organization{{\"organization_selection\": \"{index + 1}\"}}"}
                    for index, org in enumerate(organizations)
                ]
            )

            # Store the organization map in a slot for future use
            return [SlotSet("organization_map", organization_map)]

        except requests.exceptions.RequestException as e:
            logger.error("Error while fetching organization list: %s", str(e))
            # Inform the user of a generic error
            dispatcher.utter_message(text="No se pudo recuperar la lista de organizaciones. Intente nuevamente más tarde.")

        except Exception as e:
            logger.error("Unexpected error: %s", str(e))
            # Inform the user of an unexpected error
            dispatcher.utter_message(text="Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.")

        return []

# Action class to display organization details
class ActionSelectOrganization(Action):
    def name(self) -> Text:
        return "action_select_organization"

    def run(self, dispatcher, tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Retrieve the stored organization map and the user's selection index
        organization_map = tracker.get_slot("organization_map")
        selected_entity_index = tracker.get_slot("organization_selection")

        logger.info("Selected organization index: %s", selected_entity_index)

        # Validate if the organization map and selection index exist
        if not organization_map or not selected_entity_index:
            logger.warning("Organization map or selection is missing.")
            # Prompt the user to select a valid organization
            dispatcher.utter_message(text="No se encontró una organización válida. Por favor, seleccione nuevamente.")
            return []

        # Retrieve the details of the selected organization from the map
        selected_entity = organization_map.get(selected_entity_index)
        if not selected_entity:
            logger.error("Invalid organization selection: %s", selected_entity_index)
            # Notify the user about invalid selection
            dispatcher.utter_message(text="Selección inválida. Por favor, elija una organización válida.")
            return []

        # Extract organization details for display
        entity_name = selected_entity.get("nemonico")
        entity_ruc = selected_entity.get("ruc")
        entity_id = selected_entity.get("organization_id")  # Retrieve the organization ID

        # Display the selected organization's RUC to the user
        dispatcher.utter_message(
            text=f"Usted seleccionó {entity_name}. El número de RUC es: {entity_ruc}"

        )

        # Store the RUC and organization ID of the selected organization in slots for future actions
        return [
            SlotSet("organization_ruc", entity_ruc),
            SlotSet("organization_id", entity_id)
        ]
    
# ##claim type  & subtype
# class ActionHandleClaim(Action):
#     def name(self) -> Text:
#         return "action_handle_claim"

#     async def run(self, dispatcher: CollectingDispatcher,
#                   tracker: Tracker,
#                   domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

#         # Fetch the base URL from environment variables with a fallback value
#         USER_BASE_URL = os.getenv("USER_BASE_URL", "${USER_BASE_URL}")
#         auth_token = tracker.get_slot("id_token")

#         # Check for missing authorization token
#         if not auth_token:
#             logger.error("Authorization token is missing in slot.")
#             dispatcher.utter_message(text="Lo sentimos, hubo un problema al procesar su solicitud. Intente nuevamente más tarde.")
#             return []

#         # Set up headers for API requests
#         headers = {
#             'Accept': 'application/json',
#             'Authorization': f'Bearer {auth_token}'
#         }

#         # Retrieve slots from the tracker
#         selected_claim_type = tracker.get_slot("claim_type")
#         selected_claim_type_id = tracker.get_slot("claim_type_id")
#         selected_sub_claim_type = tracker.get_slot("sub_claim_type")
#         selected_sub_claim_type_id = tracker.get_slot("sub_claim_type_id")

#         # Step 1: Fetch claim types if none is selected
#         if not selected_claim_type:
#             api_url_claim_types = f"{USER_BASE_URL}/api/v1/masters/claim-type-list"
#             try:
#                 logger.info("Fetching claim types...")
#                 response = requests.get(api_url_claim_types, headers=headers, verify=False)
#                 logger.info(f"Claim types response: {response.status_code}")

#                 if response.status_code == 200:
#                     # Parse response and create buttons for claim types
#                     claim_types = response.json()
#                     buttons = [
#                         {
#                             "title": claim_type["name"],
#                             "payload": f'/select_claim_type{{"claim_type_id": {claim_type["id"]}, "claim_type": "{claim_type["name"]}"}}'
#                         } for claim_type in claim_types
#                     ]
#                     dispatcher.utter_message(text="Por favor seleccione un tipo de reclamo:", buttons=buttons)
#                 else:
#                     logger.error(f"Failed to fetch claim types. Status: {response.status_code}")
#                     dispatcher.utter_message(text="Lo sentimos, no se pudieron obtener los tipos de reclamos. Intente nuevamente más tarde.")
#             except Exception as e:
#                 logger.error(f"Error while fetching claim types: {str(e)}")
#                 dispatcher.utter_message(text="Ocurrió un error al obtener los tipos de reclamos. Por favor intente nuevamente.")
#             return []

#         # Step 2: Fetch sub-claim types if a claim type is selected but not the sub-claim type
#         elif selected_claim_type and not selected_sub_claim_type:
#             api_url_subtypes = f"{USER_BASE_URL}/api/v1/masters/claim-sub-type-list/{selected_claim_type_id}"
#             try:
#                 logger.info(f"Fetching sub-claim types for type ID: {selected_claim_type_id}")
#                 response = requests.get(api_url_subtypes, headers=headers, verify=False)
#                 logger.info(f"Sub-claim types response: {response.status_code}")

#                 if response.status_code == 200:
#                     # Parse response and create buttons for sub-claim types
#                     subtypes = response.json()
#                     buttons = [
#                         {
#                             "title": subtype["name"],
#                             "payload": f'/select_claim_subtype{{"sub_claim_type": "{subtype["name"]}", "sub_claim_type_id": {subtype["id"]}}}'
#                         } for subtype in subtypes
#                     ]
#                     dispatcher.utter_message(text="Por favor seleccione un subtipo de reclamo:", buttons=buttons)
#                 else:
#                     logger.error(f"Failed to fetch subtypes. Status: {response.status_code}")
#                     dispatcher.utter_message(text="Lo sentimos, no se pudieron obtener los subtipos de reclamos. Intente nuevamente más tarde.")
#             except Exception as e:
#                 logger.error(f"Error while fetching sub-claim types: {str(e)}")
#                 dispatcher.utter_message(text="Ocurrió un error al obtener los subtipos de reclamos. Por favor intente nuevamente.")
#             return []

#         else:
#             logger.info(f"Claim Type: {selected_claim_type}, Sub-Claim Type: {selected_sub_claim_type}")
#             return [
#                 # Update slots with the selected IDs
#                 SlotSet("claim_type_id", selected_claim_type_id),
#                 SlotSet("sub_claim_type_id", selected_sub_claim_type_id)
#             ]

class ActionHandleClaim(Action):
    def name(self) -> Text:
        return "action_handle_claim"

    async def run(self, dispatcher: CollectingDispatcher,
                  tracker: Tracker,
                  domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Fetch the base URL from environment variables with a fallback value
        USER_BASE_URL = os.getenv("USER_BASE_URL", "${USER_BASE_URL}")
        auth_token = tracker.get_slot("id_token")

        # Check for missing authorization token
        if not auth_token:
            logger.error("Authorization token is missing in slot.")
            dispatcher.utter_message(text="Lo sentimos, hubo un problema al procesar su solicitud. Intente nuevamente más tarde.")
            return []

        # Set up headers for API requests
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {auth_token}'
        }

        # Retrieve slots from the tracker
        selected_claim_type = tracker.get_slot("claim_type")
        selected_claim_type_id = tracker.get_slot("claim_type_id")
        selected_sub_claim_type = tracker.get_slot("sub_claim_type")
        selected_sub_claim_type_id = tracker.get_slot("sub_claim_type_id")

        # Step 1: Fetch claim types if none is selected
        if not selected_claim_type:
            return await self.fetch_and_display_claim_types(dispatcher, headers, USER_BASE_URL)

        # Step 2: Fetch sub-claim types if a claim type is selected but not the sub-claim type
        elif selected_claim_type and not selected_sub_claim_type:
            api_url_subtypes = f"{USER_BASE_URL}/api/v1/masters/claim-sub-type-list/{selected_claim_type_id}"
            try:
                logger.info(f"Fetching sub-claim types for type ID: {selected_claim_type_id}")
                response = requests.get(api_url_subtypes, headers=headers, verify=False)
                logger.info(f"Sub-claim types response: {response.status_code}")

                if response.status_code == 200:
                    subtypes = response.json()

                    # ✅ Handle empty sub-claim types list
                    if not subtypes:
                        logger.warning(f"No sub-claim types found for type ID: {selected_claim_type_id}")
                        dispatcher.utter_message(text="No hay subtipos de reclamos disponibles para este tipo. Seleccione otro tipo de reclamo.")

                        # ✅ Reset claim type slots and re-share claim types
                        return await self.fetch_and_display_claim_types(dispatcher, headers, USER_BASE_URL)

                    # ✅ Create buttons for sub-claim types
                    buttons = [
                        {
                            "title": subtype["name"],
                            "payload": f'/select_claim_subtype{{"sub_claim_type": "{subtype["name"]}", "sub_claim_type_id": {subtype["id"]}}}'
                        } for subtype in subtypes
                    ]
                    dispatcher.utter_message(text="Por favor seleccione un subtipo de reclamo:", buttons=buttons)

                else:
                    logger.error(f"Failed to fetch subtypes. Status: {response.status_code}")
                    dispatcher.utter_message(text="No se pudieron obtener los subtipos de reclamos. Intente nuevamente más tarde.")

            except Exception as e:
                logger.error(f"Error while fetching sub-claim types: {str(e)}")
                dispatcher.utter_message(text="⚠️ Ocurrió un error al obtener los subtipos de reclamos. Por favor intente nuevamente.")

            return []

        # ✅ Final Step: Ensure both claim type and sub-claim type are set before proceeding
        else:
            if not selected_sub_claim_type:
                dispatcher.utter_message(text="El subtipo de reclamo es obligatorio. Por favor seleccione un subtipo para continuar.")
                return []
            
            logger.info(f"Claim Type: {selected_claim_type}, Sub-Claim Type: {selected_sub_claim_type}")
            return [
                SlotSet("claim_type_id", selected_claim_type_id),
                SlotSet("sub_claim_type_id", selected_sub_claim_type_id)
            ]

    async def fetch_and_display_claim_types(self, dispatcher, headers, USER_BASE_URL):
        """
        Fetches claim types from the API and presents options to the user.
        This method is used when no claim type is selected or when subtypes are unavailable.
        """
        api_url_claim_types = f"{USER_BASE_URL}/api/v1/masters/claim-type-list"
        try:
            logger.info("Fetching claim types again...")
            response = requests.get(api_url_claim_types, headers=headers, verify=False)
            logger.info(f"Claim types response: {response.status_code}")

            if response.status_code == 200:
                claim_types = response.json()

                # ✅ Check if API returned an empty list
                if not claim_types:
                    logger.warning("No claim types found.")
                    dispatcher.utter_message(text="No hay tipos de reclamos disponibles en este momento. Intente nuevamente más tarde.")
                    return []

                # ✅ Create buttons for claim types
                buttons = [
                    {
                        "title": claim_type["name"],
                        "payload": f'/select_claim_type{{"claim_type_id": {claim_type["id"]}, "claim_type": "{claim_type["name"]}"}}'
                    } for claim_type in claim_types
                ]
                dispatcher.utter_message(text="Por favor seleccione un tipo de reclamo:", buttons=buttons)

                # ✅ Reset claim type slots to ensure the user reselects a valid claim type
                return [
                    SlotSet("claim_type", None),
                    SlotSet("claim_type_id", None)
                ]

            else:
                logger.error(f"Failed to fetch claim types. Status: {response.status_code}")
                dispatcher.utter_message(text="No se pudieron obtener los tipos de reclamos. Intente nuevamente más tarde.")
                return []

        except Exception as e:
            logger.error(f"Error while fetching claim types: {str(e)}")
            dispatcher.utter_message(text="Ocurrió un error al obtener los tipos de reclamos. Por favor intente nuevamente.")
            return []


class ActionSetFileUploadRequired(Action):
    def name(self) -> Text:
        return "action_handle_file_upload"

    def run(
        self, 
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:

        intent = tracker.latest_message['intent'].get('name')
        logger.info(f"Received intent: {intent}")  # Log the intent

        if intent == "affirm_file_upload":
            flag_value = True
            logger.info("Setting file_upload_required to True")
        elif intent == "deny_file_upload":
            flag_value = False
            logger.info("Setting file_upload_required to False")
        else:
            # If the intent is neither affirm nor deny, do not set the flag
            logger.info(f"Ignoring intent: {intent}")
            return []

        # Send a message with the flag to the front end
        dispatcher.utter_message(json_message={"file_upload_required": flag_value})

        # Return the SlotSet event
        return [SlotSet("file_upload_required", flag_value)]

class ValidateTestForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_claim_form"

    def validate_antecedentes(
        self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        # Validate antecedentes
        if len(slot_value) == 0:
            logger.error("Validation error: antecedentes cannot be empty.")
            dispatcher.utter_message(
                text="El campo de antecedentes no puede estar vacío. Por favor, intente nuevamente."
            )
            return {"antecedentes": None}
        elif len(slot_value) > 5000:
            logger.error("Validation error: antecedentes exceeds max length of 5000 characters.")
            dispatcher.utter_message(
                text="El campo de antecedentes no puede exceder los 5000 caracteres. Por favor, reduzca su entrada."
            )
            return {"antecedentes": None}

        logger.info(f"Valid antecedentes received: {slot_value}")
        # dispatcher.utter_message(text="Gracias por proporcionar los antecedentes.")
        return {"antecedentes": slot_value}

    def validate_peticion_especifica(
        self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        # Validate peticion_especifica
        if len(slot_value) == 0:
            logger.error("Validation error: concreta cannot be empty.")
            dispatcher.utter_message(
                text="El campo de petición concreta no puede estar vacío. Por favor, intente nuevamente."
            )
            return {"peticion_especifica": None}
        elif len(slot_value) > 5000:
            logger.error("Validation error: peticion_especifica exceeds max length of 5000 characters.")
            dispatcher.utter_message(
                text="El campo de petición concreta no puede exceder los 5000 caracteres. Por favor, reduzca su entrada."
            )
            return {"peticion_especifica": None}

        logger.info(f"Valid peticion_especifica received: {slot_value}")
        # dispatcher.utter_message(text="Gracias por proporcionar la petición específica.") ###############################################
        return {"peticion_especifica": slot_value}

class ActionSubmitClaimDetails(Action):
    def name(self) -> Text:
        return "action_submit_claim_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            # Retrieve slot values
            antecedentes = tracker.get_slot("antecedentes")
            peticion_especifica = tracker.get_slot("peticion_especifica")

            logger.info("Fetching slots in action_submit_claim_details")
            logger.debug(f"antecedentes: {antecedentes}")
            logger.debug(f"peticion_especifica: {peticion_especifica}")

            # Check if slot values are None or empty
            if not antecedentes:
                logger.warning("Slot 'antecedentes' is missing or empty in action_submit_claim_details.")
            if not peticion_especifica:
                logger.warning("Slot 'peticion_especifica' is missing or empty in action_submit_claim_details.")

            # Debug tracker slots after processing
            tracker_slots = tracker.current_slot_values()
            logger.debug(f"Tracker slots after fetching: {tracker_slots}")

            # Handle submission response
            if antecedentes and peticion_especifica:
                dispatcher.utter_message(
                    text="Información registrada con éxito. ¿Deseas cargar un archivo para continuar?"
                )
                logger.info("Form submission successful.")
            else:
                dispatcher.utter_message(
                    text="Ha ocurrido un problema al enviar el formulario. Por favor, verifique la información proporcionada."
                )
                logger.error("Form submission failed due to missing slot values.")

            return []
        except Exception as e:
            logger.exception(f"Unexpected error in action_submit_claim_details: {str(e)}")
            dispatcher.utter_message(
                text="Ocurrió un error inesperado al procesar su solicitud. Intente nuevamente."
            )
            return []



# Form validation for user agreement form
class ValidateUserAgreeClaimForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_user_agree_claim_form"

    def validate_accept_terms(
        self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        if slot_value is True:
            logger.info("User accepted the terms and conditions.")
            return {"accept_terms": slot_value}
        else:
            logger.warning("User did not accept the terms and conditions.")
            dispatcher.utter_message(text="Debe aceptar los términos y condiciones para continuar.")
            return {"accept_terms": None}

class ActionFileClaim(Action):
    def name(self) -> Text:
        return "action_file_claim"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Log initial slot values for debugging purposes
        logger.info(f"Tracker slots (before processing): {tracker.current_slot_values()}")
        logger.info("Collecting claim details from slots.")

        # Extract claim details from slots prefixed with 'claim_'
        identificacion = tracker.get_slot("claim_national_id")
        email = tracker.get_slot("claim_email")
        name = tracker.get_slot("claim_full_name")
        gender = tracker.get_slot("claim_gender")
        country_code = tracker.get_slot("claim_country_code")
        phone_number = tracker.get_slot("claim_phone_number")
        province_id = tracker.get_slot("province_id")
        city_id = tracker.get_slot("canton_id")
        priority_care_group = tracker.get_slot("priorityCareGroup")
        customer_type = tracker.get_slot("customerType")
        organization_id = tracker.get_slot("organization_id")
        claim_type_id = tracker.get_slot("claim_type_id")
        claim_subtype_id = tracker.get_slot("sub_claim_type_id")
        precedents = tracker.get_slot("antecedentes")
        specific_petition = tracker.get_slot("peticion_especifica")
        check_duplicate = tracker.get_slot("checkDuplicate") or "true"

        # Extract attachments by filtering keys starting with 'attachmentsIds'
        metadata = tracker.latest_message.get("metadata", {})
        attachments = [value for key, value in metadata.items() if key.startswith("attachmentsIds")]

        # Create a dictionary of all slots for debugging and processing
        slots = {
            "claim_national_id": identificacion,
            "claim_email": email,
            "claim_full_name": name,
            "claim_gender": gender,
            "claim_country_code": country_code,
            "claim_phone_number": phone_number,
            "province_id": province_id,
            "canton_id": city_id,
            "priorityCareGroup": priority_care_group,
            "customerType": customer_type,
            "organization_id": organization_id,
            "claim_type_id": claim_type_id,
            "sub_claim_type_id": claim_subtype_id,
            "antecedentes": precedents,
            "peticion_especifica": specific_petition,
            "checkDuplicate": check_duplicate
        }

        # Log slot values for better traceability
        for slot_name, slot_value in slots.items():
            logger.debug(f"Slot '{slot_name}': {slot_value}")

        # Identify missing mandatory fields (excluding attachments)
        missing_fields = [key for key, value in slots.items() if not value]
        if missing_fields:
            logger.warning(f"Mandatory fields are missing: {', '.join(missing_fields)}.")
            dispatcher.utter_message(text=f"Los siguientes campos obligatorios están vacíos: {', '.join(missing_fields)}.")
            return []

        # Log slot values before preparing the payload
        logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")

        # Prepare the form-data payload for the API request
        logger.info("Preparing form-data payload for claim submission.")
        form_data = {
            'identificacion': identificacion,
            'email': email,
            'name': name,
            'gender': gender,
            'countryCode': country_code,
            'phoneNumber': phone_number,
            'provinceId': province_id,
            'cityId': city_id,
            'priorityCareGroup': priority_care_group,
            'customerType': customer_type,
            'organizationId': organization_id,
            'claimTypeId': claim_type_id,
            'claimSubTypeId': claim_subtype_id,
            'precedents': precedents,
            'specificPetition': specific_petition,
            'checkDuplicate': check_duplicate,
            'source': 'CHATBOT',
            'channelOfEntry': 'CHAT'
        }
        # Add attachment IDs dynamically to the payload only if there are attachments
        if attachments:
            try:
                for index, attachment_id in enumerate(attachments):  # Start indexing from 0
                    form_data[f'attachmentsIds[{index}]'] = attachment_id
                logger.info(f"Attachment IDs added to the request: {attachments}")
            except Exception as e:
                logger.error(f"Error processing attachment IDs: {str(e)}")
                dispatcher.utter_message(text="Hubo un error al procesar sus documentos adjuntos. Por favor intente nuevamente.")
                return []
        else:
            logger.info("No attachments provided, skipping attachmentsIds in the request.")

        # Add authorization header with the user's token
        auth_token = tracker.get_slot("id_token")
        headers = {
            'Accept-Language': 'en',
            'Authorization': f'Bearer {auth_token}'
        }

        # API endpoint for filing claims
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/file-claim"
        logger.info(f"Sending claim submission request to: {url}")
        try:
            # Make the POST request to the API with a timeout
            response = requests.post(url, headers=headers, data=form_data, timeout=120)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Claim submission response: {result}")

            # Check for duplicate claims in the response
            if result.get('foundDuplicate', False):
                duplicate_ticket_id = result.get('duplicateTicketId')
                dispatcher.utter_message(
                    text=(
                        "¡Alerta! Parece que estás presentando un reclamo duplicado en contra de la misma entidad y por los mismos hechos.\n"
                        f"Ticket de reclamo duplicado: {duplicate_ticket_id}\n"
                        "¿Está seguro de que desea presentar este reclamo?"
                    ),
                    buttons=[
                        {"title": "Sí, presentar mi reclamación", "payload": "/proceed_with_claim"},
                        {"title": "No, déjame revisar la reclamación existente", "payload": "/check_existing_claim"}
                    ]
                )
                return []

            # If no duplicate is found, confirm successful claim submission
            dispatcher.utter_message(
            text = (
            "¡Felicidades!\n"
            "Se ha registrado con éxito su reclamo\n"
            f"Su número de ticket es:\n{result.get('newTicketId', 'N/A')}\n"
            "Los detalles se han enviado a su correo electrónico." )
            )
            dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu
        except requests.exceptions.RequestException as e:
            logger.error(f"Unexpected error while filing claim: {str(e)}")
            dispatcher.utter_message(text="No se pudo escalar su denuncia debido a un error inesperado. Por favor intente nuevamente")
            dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu

        #return  [SlotSet("end_of_journey", True)]

        return [SlotSet("end_of_journey", True), FollowupAction("action_reset_all_slots_except_token")]


class ActionProceedWithClaim(Action):
    def name(self) -> Text:
        return "action_proceed_with_claim"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Log the intent to proceed
        logger.info("User opted to proceed with filing the claim.")

        # Retrieve all slots
        form_data = {
            'identificacion': tracker.get_slot("claim_national_id"),
            'email': tracker.get_slot("claim_email"),
            'name': tracker.get_slot("claim_full_name"),
            'gender': tracker.get_slot("claim_gender"),
            'countryCode': tracker.get_slot("claim_country_code"),
            'phoneNumber': tracker.get_slot("claim_phone_number"),
            'provinceId': tracker.get_slot("province_id"),
            'cityId': tracker.get_slot("canton_id"),
            'priorityCareGroup': tracker.get_slot("priorityCareGroup"),
            'customerType': tracker.get_slot("customerType"),
            'organizationId': tracker.get_slot("organization_id"),
            'claimTypeId': tracker.get_slot("claim_type_id"),
            'claimSubTypeId': tracker.get_slot("sub_claim_type_id"),
            'precedents': tracker.get_slot("antecedentes"),
            'specificPetition': tracker.get_slot("peticion_especifica"),
            'checkDuplicate': "false",  # Override to skip duplicate check
            'source': 'CHATBOT',
            'channelOfEntry': 'CHAT'
        }

        # Handle file attachments (dynamic keys like attachmentsIds[0], attachmentsIds[1], etc.)
        metadata = tracker.latest_message.get("metadata", {})
        attachments = [value for key, value in metadata.items() if key.startswith("attachmentsIds")]
        if attachments:
            try:
                for index, attachment_id in enumerate(attachments):  # Indexing starts from 0
                    form_data[f'attachmentsIds[{index}]'] = attachment_id
                logger.info(f"Attachment IDs added to the request: {attachments}")
            except Exception as e:
                logger.error(f"Error processing attachment IDs: {str(e)}")
                dispatcher.utter_message(text="Hubo un error al procesar sus documentos adjuntos. Por favor intente nuevamente.")
                return []

        # Authorization header
        auth_token = tracker.get_slot("id_token")
        headers = {
            'Accept-Language': 'en',
            'Authorization': f'Bearer {auth_token}'
        }

        # API endpoint
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/file-claim"
        logger.info(f"Sending claim submission request to: {url}")
        try:
            # Make the POST request to file the claim
            response = requests.post(url, headers=headers, data=form_data, timeout=120)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Claim submission response: {result}")

            # Notify the user of successful claim submission
            dispatcher.utter_message(
            text = (
            "¡Felicidades!\n"
            "Se ha registrado con éxito su reclamo\n"
            f"Su número de ticket es:\n{result.get('newTicketId', 'N/A')}\n"
            "Los detalles se han enviado a su correo electrónico."
        )
            )
            # dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            dispatcher.utter_message(text="Ocurrió un error al presentar su reclamo. Por favor intente nuevamente.")

        except Exception as e:
            logger.error(f"Unexpected error during claim submission: {str(e)}")
            dispatcher.utter_message(text="Ocurrió un error inesperado. Por favor contacte con el SEPS")


        # return [SlotSet("end_of_journey", True), FollowupAction("action_reset_all_slots_except_token")]
        return [SlotSet("end_of_journey", True), FollowupAction("action_reset_all_slots_except_token"), FollowupAction("utter_claim_menu")]


#########################################Second Instance###################################################
class ActionFetchTickets(Action):

    def name(self) -> Text:
        return "action_fetch_tickets"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Log current slot values before processing
        logger.info(f"Tracker slots (before fetching tickets): {tracker.current_slot_values()}")

        # Retrieve authentication token from tracker slots
        auth_token = tracker.get_slot("id_token")
        if not auth_token:
            # Notify the user if authentication fails
            dispatcher.utter_message(text="Autenticación fallida. Por favor, inicie sesión nuevamente.")
            return []

        # Define the API URL and headers for the request
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/list-for-file-second-instance-or-complaint/SECOND_INSTANCE"
        headers = {'Authorization': f'Bearer {auth_token}'}

        # Fetch tickets from the API
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise an error for HTTP issues
            tickets = response.json()  # Parse the JSON response
            logger.info(f"Tickets fetched successfully: {tickets}")
        except requests.exceptions.RequestException as e:
            # Log the error and send a generic error message to the user
            logger.error(f"Error fetching tickets: {e}")
            dispatcher.utter_message(text="Ocurrió un problema al obtener los tickets. Por favor, intente nuevamente")
            return []

        # Generate buttons for each ticket
        buttons = []
        for ticket in tickets:
            ticket_id = ticket.get("ticketId")
            if ticket_id:
                # Add button with ticket ID and payload for selection
                buttons.append({
                    "title": f"Boleto {ticket_id}",
                    "payload": f"/select_ticket{{\"ticket_id\": \"{ticket_id}\"}}"
                })

        # Send buttons to the user if available, otherwise notify no tickets found
        if buttons:
            dispatcher.utter_message(text="Seleccione un ticket:", buttons=buttons)
        else:
            dispatcher.utter_message(text="No se encontraron tickets disponibles")
            dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu
        return []


class ActionFetchClaimReference(Action):

    def name(self) -> Text:
        return "action_fetch_claim_reference"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Log current slot values before processing
        logger.info(f"Tracker slots (before fetching claim reference): {tracker.current_slot_values()}")

        # Retrieve authentication token and selected ticket ID from tracker slots
        auth_token = tracker.get_slot("id_token")
        ticket_id = tracker.get_slot("ticket_id")

        if not auth_token:
            # Notify the user if authentication fails
            dispatcher.utter_message(text="Autenticación fallida. Por favor, inicie sesión nuevamente.")
            return []
        if not ticket_id:
            # Notify the user if no ticket ID is selected
            dispatcher.utter_message(text="No se seleccionó ningún ticket. Por favor, elija un número válido")
            return []

        # Define the API URL and headers for the request
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/list-for-file-second-instance-or-complaint/SECOND_INSTANCE"
        headers = {'Authorization': f'Bearer {auth_token}'}

        # Fetch tickets from the API
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise an error for HTTP issues
            tickets = response.json()  # Parse the JSON response
            logger.info(f"Tickets fetched successfully for claim reference: {tickets}")
        except requests.exceptions.RequestException as e:
            # Log the error and send a generic error message to the user
            logger.error(f"Error fetching tickets for claim reference: {e}")
            dispatcher.utter_message(text="Ocurrió un problema al obtener los detalles del ticket. Por favor, intente nuevamente")
            return []

        # Search for the claim_reference_id for the given ticket_id
        claim_reference_id = None
        for ticket in tickets:
            if str(ticket.get("ticketId")) == ticket_id:
                claim_reference_id = ticket.get("id")  # Extract claim reference ID
                break

        if claim_reference_id:
            # Notify the user with the found claim reference ID
            # dispatcher.utter_message(text=f"El ID de referencia de reclamación para el boleto {ticket_id} es {claim_reference_id}.")
            return [SlotSet("claim_reference_id", claim_reference_id)]
        else:
            # Notify the user if no claim reference ID is found
            dispatcher.utter_message(text=f"No se encontró el número de ticket {ticket_id}")
            return []
   
class ValidateSecondInstanceClaimCommentsForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_second_instance_claim_comments_form"

    def validate_second_instance_claim_comments(
        self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        if not isinstance(slot_value, str):
            dispatcher.utter_message(text="El comentario debe ser un texto válido. Inténtelo de nuevo")
            return {"second_instance_claim_comments": None}

        if len(slot_value.strip()) == 0:
            dispatcher.utter_message(text="El comentario no puede estar vacío. Proporcione un comentario válido")
            return {"second_instance_claim_comments": None}

        if len(slot_value) > 5000:
            dispatcher.utter_message(text="El comentario no puede exceder los 5000 caracteres. Proporcione un comentario más breve")
            return {"second_instance_claim_comments": None}

        return {"second_instance_claim_comments": slot_value}


class ActionFileSecondInstance(Action):
    def name(self) -> Text:
        return "action_file_second_instance"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        logger.info(f"Tracker slots: {tracker.current_slot_values()}")

        # Extract required slots
        auth_token = tracker.get_slot("id_token")
        claim_reference_id = tracker.get_slot("claim_reference_id")
        second_instance_comment = tracker.get_slot("second_instance_claim_comments")

        # Extract attachments by filtering keys starting with 'attachmentsIds'
        metadata = tracker.latest_message.get("metadata", {})
        attachments = [value for key, value in metadata.items() if key.startswith("attachmentsIds")]

        # Check if all required data is available
        slots = {
            "id_token": auth_token,
            "claim_reference_id": claim_reference_id,
            "second_instance_claim_comments": second_instance_comment
        }

        missing_fields = [key for key, value in slots.items() if not (value and str(value).strip())]
        if missing_fields:
            logger.error(f"Mandatory fields are missing: {', '.join(missing_fields)}.")
            dispatcher.utter_message(text="No se pudo escalar su reclamo a segunda instancia. Por favor asegúrese de que toda la información este correcta")
            return []

        # Prepare the payload with the required fields
        form_data = {
            'id': claim_reference_id,
            'comment': second_instance_comment,
            'source': 'CHATBOT',
            'channelOfEntry': 'CHAT'
        }

        # Add attachment IDs dynamically to the payload
        if attachments:
            try:
                for index, attachment_id in enumerate(attachments):
                    if attachment_id:  # Ensure non-empty IDs are added
                        form_data[f'attachmentsIds[{index}]'] = attachment_id
                logger.info(f"Attachment IDs added to the second instance request: {attachments}")
            except Exception as e:
                logger.error(f"Error processing attachment IDs for second instance: {str(e)}")
                dispatcher.utter_message(text="Hubo un problema con el servidor. Intenta nuevamente")
                return []

        # Authorization header
        headers = {
            'Authorization': f'Bearer {auth_token}',
            'Accept-Language': 'en'
        }

        # API request
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/file-second-instance-claim"
        logger.info(f"Sending second instance claim submission request to: {url}")
        logger.debug(f"Form data payload: {form_data}")

        # try:
        #     response = requests.post(url, headers=headers, data=form_data, timeout=120)

        #     if response.status_code == 200:
        #         result = response.json()
        #         ticket_id = result.get("newTicketId", "")
        #         if ticket_id:
        #             dispatcher.utter_message(
        #                 text=f"Se ha presentado su reclamo de segunda instancia con el número de ticket:\n{ticket_id}"
        #             )
        #         else:
        #             dispatcher.utter_message(text="La reclamo de segunda instancia se presentó con éxito.")
        #         logger.info("✅ Second instance claim filed successfully.")

        try:
            response = requests.post(url, headers=headers, data=form_data, timeout=120)

            if response.status_code == 200:
                result = response.json()
                ticket_id = result.get("newTicketId", "")
                if ticket_id:
                    dispatcher.utter_message(
                        text=f"¡Su reclamo de segunda instancia ha sido presentado con éxito!, su número de ticket es:\n{ticket_id}"
                    )
                else:
                    dispatcher.utter_message(text="El reclamo de segunda instancia se presentó con éxito.")
                logger.info("✅ Second instance claim filed successfully.")


            elif response.status_code == 400:
                dispatcher.utter_message(text="Parece que hay un problema con los datos enviados. Por favor, revise la información y vuelva a intentarlo.")
                logger.error(f"Bad request error. Status code: {response.status_code}, Response: {response.text}")
            elif response.status_code == 401:
                dispatcher.utter_message(text="No autorizado. Por favor, inicie sesión nuevamente.")
                logger.error("Unauthorized request. Please check the authentication token.")
            elif response.status_code == 500:
                dispatcher.utter_message(text="El servidor encontró un error. Por favor, intente nuevamente más tarde.")
                logger.error("Internal server error encountered.")
            else:
                dispatcher.utter_message(text="No se pudo escalar su reclamo a segunda instancia debido a un error interno. Por favor intente nuevamente")
                logger.error(f"Unexpected error. Status code: {response.status_code}, Response: {response.text}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Unexpected error while filing second instance claim: {str(e)}")
            dispatcher.utter_message(text="No se pudo escalar su reclamo a segunda instancia debido a un error inesperado. Por favor intente nuevamente")

        return []

######################################## File a Complaint ################################################## 
class ActionFetchComplaintTickets(Action):

    def name(self) -> Text:
        return "action_fetch_complaint_tickets"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Log current slot values before processing
        logger.info(f"Tracker slots (before fetching complaint tickets): {tracker.current_slot_values()}")

        # Retrieve authentication token from tracker slots
        auth_token = tracker.get_slot("id_token")
        if not auth_token:
            # Notify the user if authentication fails
            dispatcher.utter_message(text="Autenticación fallida. Por favor, inicie sesión nuevamente.")
            return []

        # Define the API URL and headers for the request
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/list-for-file-second-instance-or-complaint/COMPLAINT"
        headers = {'Authorization': f'Bearer {auth_token}', 'Accept-Language': 'es'}

        # Fetch tickets from the API
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise an error for HTTP issues
            tickets = response.json()  # Parse the JSON response
            logger.info(f"Complaint tickets fetched successfully: {tickets}")
        except requests.exceptions.RequestException as e:
            # Log the error and send a generic error message to the user
            logger.error(f"Error fetching complaint tickets: {e}")
            dispatcher.utter_message(text="Ocurrió un problema al obtener los tickets. Por favor, intente nuevamente")
            return []

        # Generate buttons for each ticket
        buttons = []
        for ticket in tickets:
            complaint_ticket_id = ticket.get("ticketId")
            if complaint_ticket_id:
                # Add button with ticket ID and payload for selection
                buttons.append({
                    "title": f"Boleto {complaint_ticket_id}",
                    "payload": f"/select_second_instance_ticket_id{{\"complaint_ticket_id\": \"{complaint_ticket_id}\"}}"
                })

        # Send buttons to the user if available, otherwise notify no tickets found
        if buttons:
            dispatcher.utter_message(text="Seleccione un ticket de denuncia:", buttons=buttons)
        else:
            dispatcher.utter_message(text="No se encontraron boletos disponibles para denuncia.")
            dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu
        logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")
        return []


class ActionFetchComplaintReference(Action):

    def name(self) -> Text:
        return "action_fetch_complaint_reference"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Log current slot values before processing
        logger.info(f"Tracker slots (before fetching complaint reference): {tracker.current_slot_values()}")

        # Retrieve authentication token and selected ticket ID from tracker slots
        auth_token = tracker.get_slot("id_token")
        complaint_ticket_id = tracker.get_slot("complaint_ticket_id")

        if not auth_token:
            # Notify the user if authentication fails
            dispatcher.utter_message(text="Autenticación fallida. Por favor, inicie sesión nuevamente.")
            return []
        if not complaint_ticket_id:
            # Notify the user if no ticket ID is selected
            dispatcher.utter_message(text="No se seleccionó ningún boleto para denuncia. Por favor, elija un ID de boleto primero.")
            return []

        # Define the API URL and headers for the request
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/list-for-file-second-instance-or-complaint/COMPLAINT"
        headers = {'Authorization': f'Bearer {auth_token}', 'Accept-Language': 'es'}

        # Fetch tickets from the API
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Raise an error for HTTP issues
            tickets = response.json()  # Parse the JSON response
            logger.info(f"Complaint tickets fetched successfully for reference: {tickets}")
        except requests.exceptions.RequestException as e:
            # Log the error and send a generic error message to the user
            logger.error(f"Error fetching complaint tickets for reference: {e}")
            dispatcher.utter_message(text="Hubo un problema al obtener los detalles del boleto para denuncia. Intente nuevamente más tarde.")
            return []

        # Search for the complaint_reference_id for the given complaint_ticket_id
        complaint_reference_id = None
        for ticket in tickets:
            if str(ticket.get("ticketId")) == complaint_ticket_id:
                complaint_reference_id = ticket.get("id")  # Extract complaint reference ID
                break

        if complaint_reference_id:
            # Notify the user with the found complaint reference ID
            # dispatcher.utter_message(text=f"El ID de referencia de queja para el boleto {complaint_ticket_id} es {complaint_reference_id}.")
            logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")
            return [SlotSet("complaint_reference_id", complaint_reference_id)]
        else:
            # Notify the user if no complaint reference ID is found
            dispatcher.utter_message(text=f"No se encontró el ID de referencia de denuncia para el boleto {complaint_ticket_id}.")
            logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")
            return []


class ValidateClaimDetailsForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_complaint_details_form"

    def validate_complaint_antecedentes(
        self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        # Validate antecedentes
        if not slot_value.strip():
            logger.error("Validation error: complaint_antecedentes cannot be empty.")
            dispatcher.utter_message(
                text="El campo de antecedentes no puede estar vacío. Por favor, intente nuevamente."
            )
            return {"complaint_antecedentes": None}
        elif len(slot_value) > 5000:
            logger.error("Validation error: complaint_antecedentes exceeds max length of 5000 characters.")
            dispatcher.utter_message(
                text="El campo de antecedentes no puede exceder los 5000 caracteres. Por favor, reduzca su entrada."
            )
            return {"complaint_antecedentes": None}

        logger.info(f"Valid complaint_antecedentes received: {slot_value}")
        # dispatcher.utter_message(text="Gracias por proporcionar los antecedentes.")
        logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")
        return {"complaint_antecedentes": slot_value}

    def validate_complaint_peticion_especifica(
        self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        # Validate peticion_especifica
        if not slot_value.strip():
            logger.error("Validation error: complaint_peticion_especifica cannot be empty.")
            dispatcher.utter_message(
                text="El campo de petición concreta no puede estar vacío"
            )
            return {"complaint_peticion_especifica": None}
        elif len(slot_value) > 5000:
            logger.error("Validation error: complaint_peticion_especifica exceeds max length of 5000 characters.")
            dispatcher.utter_message(
                text="El campo de petición concreta no puede exceder los 5000 caracteres. Por favor reduzca los textos"
            )
            return {"complaint_peticion_especifica": None}

        logger.info(f"Valid complaint_peticion_especifica received: {slot_value}")
        # dispatcher.utter_message(text="Gracias por proporcionar la petición específica.")
        logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")        
        return {"complaint_peticion_especifica": slot_value}


class FileComplaint(Action):
    def name(self) -> Text:
        return "action_file_complaint"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict]:
        # Extract required slots
        auth_token = tracker.get_slot("id_token")
        complaint_reference_id = tracker.get_slot("complaint_reference_id")
        specific_petition = tracker.get_slot("complaint_peticion_especifica")
        precedents = tracker.get_slot("complaint_antecedentes")

        # Extract attachments by filtering keys starting with 'attachmentsIds'
        metadata = tracker.latest_message.get("metadata", {})
        attachments = [value for key, value in metadata.items() if key.startswith("attachmentsIds")]

        # Check if all required data is available
        if not all([auth_token, complaint_reference_id, specific_petition, precedents]):
            logger.error("Missing data to file complaint: Some slots are empty.")
            dispatcher.utter_message(text="No se pudo escalar su denuncia. Por favor asegúrese de que toda la información este correcta")
            return []

        # Prepare the payload with the required fields
        payload = {
            'id': complaint_reference_id,
            'specificPetition': specific_petition,
            'precedents': precedents,
            'source': 'CHATBOT',
            'channelOfEntry': 'CHAT'
        }

        # Add attachment IDs to the payload in the required format
        if attachments:
            try:
                for index, attachment_id in enumerate(attachments):
                    if attachment_id:
                        payload[f'attachmentsIds[{index}]'] = attachment_id
                logger.info(f"Attachment IDs added to the request: {attachments}")
            except Exception as e:
                logger.error(f"Error processing attachment IDs: {str(e)}")
                dispatcher.utter_message(text="Hubo un problema con el servidor. Intenta nuevamente")
                return []

        # Authorization header
        headers = {
            'Accept-Language': 'en',
            'Authorization': f'Bearer {auth_token}'
        }

        # API request
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/file-complaint"
        logger.info(f"Sending complaint submission request to: {url}")
        logger.debug(f"Payload for complaint: {payload}")

        try:
            response = requests.post(url, headers=headers, data=payload, timeout=120)

            if response.status_code == 200:
                result = response.json()
                print(result)
                ticket_id = result.get("newTicketId", "")
                if ticket_id:
                    dispatcher.utter_message(
                        text=f"¡Su denuncia ha sido presentada con éxito!, su número de ticket es:\n{ticket_id}"
                    )
                else:
                    dispatcher.utter_message(text="La denuncia se presentó con éxito.")
                logger.info("✅ Complaint filed successfully.")

            elif response.status_code == 400:
                dispatcher.utter_message(text="Parece que hay un problema con los datos enviados. Por favor, revise la información y vuelva a intentarlo.")
                logger.error(f"Bad request error. Status code: {response.status_code}, Response: {response.text}")
            elif response.status_code == 401:
                dispatcher.utter_message(text="No autorizado. Por favor, inicie sesión nuevamente.")
                logger.error("Unauthorized request. Please check the authentication token.")
            elif response.status_code == 500:
                dispatcher.utter_message(text="El servidor encontró un error. Por favor, intente nuevamente más tarde.")
                logger.error("Internal server error encountered.")
            else:
                dispatcher.utter_message(text="No se pudo escalar su denuncia debido a un error interno. Por favor intente nuevamente")
                logger.error(f"Unexpected error. Status code: {response.status_code}, Response: {response.text}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Unexpected error while filing complaint: {str(e)}")
            dispatcher.utter_message(text="No se pudo escalar su denuncia debido a un error inesperado. Por favor intente nuevamente")

        return []



###################################################### ticket status ####################################################
class ActionFetchTicketIds(Action):
    def name(self) -> Text:
        # Name of the action to fetch ticket IDs
        return "action_fetch_ticket_ids_status"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        id_token = tracker.get_slot("id_token")

        if not id_token:
            dispatcher.utter_message(text="El código de autenticación falta. Por favor, inicie sesión nuevamente")
            return []

        headers = {"Authorization": f"Bearer {id_token}"}  # Authorization header
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets"  # API endpoint to fetch tickets

        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 401:
                dispatcher.utter_message(text="Código de autenticación inválido o inesperado. Por favor, inicie sesión nuevamente")
                return []
            elif response.status_code == 403:
                dispatcher.utter_message(text="No está autorizado para ver los tickets.")
                return []
            elif response.status_code >= 500:
                dispatcher.utter_message(text="Hay un problema con el servidor de tickets. Por favor, intente nuevamente")
                return []

            response_data = response.json()

            if isinstance(response_data, list):
                tickets = response_data
            else:
                tickets = response_data.get("tickets", [])

            if not tickets:
                dispatcher.utter_message(text="No hay tickets disponibles.")
                return []

            buttons = []
            for ticket in tickets:
                complaint_ticket_id = ticket.get("ticketId")
                if complaint_ticket_id:
                    buttons.append({
                        "title": f"ID de Ticket: {complaint_ticket_id}",
                        "payload": f"/select_status_ticket_id{{\"status_ticket_id\": \"{complaint_ticket_id}\"}}"
                    })

            dispatcher.utter_message(text="Estos son sus tickets:", buttons=buttons)
            logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")
            return []

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching tickets: {e}")
            dispatcher.utter_message(text="Ocurrió un error al recuperar los tickets. Por favor, intente nuevamente.")
            return []


class ActionFetchTicketDetails(Action):
    def name(self) -> Text:
        return "action_show_ticket_details_status"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        """
        Fetches ticket details based on the given ticket ID and returns them in formatted JSON.
        The ticket status is translated from English to Spanish before being displayed.
        """

        # Retrieve the authentication token and ticket ID from the tracker
        id_token = tracker.get_slot("id_token")
        status_ticket_id = tracker.get_slot("status_ticket_id")

        # Log retrieved values for debugging
        logger.info(f"Retrieved ID Token: {id_token[:10] + '...' if id_token else 'None'}")
        logger.info(f"Retrieved Status Ticket ID: {status_ticket_id}")

        # Validate presence of required slots
        if not id_token:
            error_response = json.dumps({"error": "El código de autenticación falta. Por favor, inicie sesión nuevamente"}, indent=4, ensure_ascii=False)
            dispatcher.utter_message(text=error_response)
            logger.warning("Authorization token missing.")
            return []

        if not status_ticket_id:
            error_response = json.dumps({"error": "No se seleccionó ningún número de ticket. Por favor, elija un ticket primero"}, indent=4, ensure_ascii=False)
            dispatcher.utter_message(text=error_response)
            logger.warning("Ticket ID is missing.")
            return []

        # Define API URL and headers
        headers = {"Authorization": f"Bearer {id_token}"}
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets"
        logger.info(f"Sending request to: {url}")

        # Dictionary for status translation (English → Spanish)
        status_translation = {
            "NEW": "Nuevo",
            "ASSIGNED": "Asignado",
            "IN_PROGRESS": "En Progreso",
            "PENDING": "Pendiente",
            "REJECTED": "Rechazado",
            "CLOSED": "Cerrado"
        }

        try:
            # API request to fetch ticket details
            response = requests.get(url, headers=headers)
            logger.info(f"API Response Status Code: {response.status_code}")

            # Handle possible HTTP errors
            if response.status_code == 401:
                error_response = json.dumps({"error": "Código de autenticación inválido o inesperado. Por favor, inicie sesión nuevamente"}, indent=4, ensure_ascii=False)
                dispatcher.utter_message(text=error_response)
                logger.error("Unauthorized access - Invalid token.")
                return []
            elif response.status_code == 403:
                error_response = json.dumps({"error": "No está autorizado para ver los tickets."}, indent=4, ensure_ascii=False)
                dispatcher.utter_message(text=error_response)
                logger.error("Access forbidden - User not authorized.")
                return []
            elif response.status_code >= 500:
                error_response = json.dumps({"error": "Hay un problema con el servidor de tickets. Por favor, intente nuevamente"}, indent=4, ensure_ascii=False)
                dispatcher.utter_message(text=error_response)
                logger.error("Server error while fetching ticket details.")
                return []

            # Parse response JSON
            response_data = response.json()
            logger.debug(f"Response Data: {response_data}")

            # Extract ticket list from response
            tickets = response_data if isinstance(response_data, list) else response_data.get("tickets", [])
            if not tickets:
                error_response = json.dumps({"error": "No hay tickets disponibles."}, indent=4, ensure_ascii=False)
                dispatcher.utter_message(text=error_response)
                logger.info("No tickets found in response.")
                return []

            # Find the ticket matching the given ticket ID
            ticket_details = next((ticket for ticket in tickets if str(ticket.get("ticketId")) == str(status_ticket_id)), None)

            if ticket_details:
                # Extract ticket status and translate it
                ticket_status_english = ticket_details.get("status", "--")
                ticket_status_spanish = status_translation.get(ticket_status_english, ticket_status_english)

                # Extract agent details
                fi_agent = ticket_details.get("fiAgent", None)
                fi_agent_name = fi_agent.get("name", "--") if fi_agent else "--"

                seps_agent = ticket_details.get("sepsAgent", None)
                seps_agent_name = seps_agent.get("name", "--") if seps_agent else "--"

                # Log extracted values
                logger.info(f"Ticket Found: ID={status_ticket_id}, Status={ticket_status_english} ({ticket_status_spanish}), FI Agent={fi_agent_name}, SEPS Agent={seps_agent_name}")

                # Format response with Markdown-style headings
                ticket_response = (
                    f"**Detalles del Ticket:**\n"
                    f"**ID del Ticket:** {status_ticket_id}\n"
                    f"**Estado:** {ticket_status_spanish}\n"
                    f"**Agente FI:** {fi_agent_name}\n"
                    f"**Agente SEPS:** {seps_agent_name}"
                )

                # Send formatted response with line breaks and bold headings
                dispatcher.utter_message(text=ticket_response)
            else:
                error_response = json.dumps({"error": "No se encontraron detalles para el ticket seleccionado."}, indent=4, ensure_ascii=False)
                dispatcher.utter_message(text=error_response)
                logger.warning(f"No ticket found with ID {status_ticket_id}")

            return []

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching ticket details: {e}")
            error_response = json.dumps({"error": "Ocurrió un error al recuperar los detalles del ticket. Por favor, intente nuevamente"}, indent=4, ensure_ascii=False)
            dispatcher.utter_message(text=error_response)
            return []


class ActionHandleFallback(Action):
    def name(self) -> str:
        return "action_handle_fallback"

    def run(self, dispatcher: CollectingDispatcher, tracker, domain: dict) -> list:
        user_message = tracker.latest_message.get('text')
        fallback_count = tracker.get_slot('fallback_count') or 0
        previous_message = tracker.events[-2].get('text') if len(tracker.events) > 1 else None

        # Log the unrecognized input for analysis
        logger.warning(f"Unrecognized input: {user_message}")
        logger.info(f"Fallback count: {fallback_count}")

        # Handle empty input (whitespace or no input)
        if not user_message.strip():
            dispatcher.utter_message(text="No entendí tu mensaje. ¿Podrías intentarlo de nuevo?")
            logger.info("Handled empty input fallback.")

        # Handle irrelevant or out-of-scope input (e.g., random words or jokes)
        elif "random" in user_message.lower() or "joke" in user_message.lower():
            dispatcher.utter_message(text="No entendí tu pregunta. ¿Podrías intentarlo de nuevo?")
            logger.info("Handled out-of-scope input.")

        # Handle unrecognized input (first or second fallback)
        elif fallback_count < 2:
            dispatcher.utter_message(
                text="No entendí bien. ¿Podrías reformular o hacer otra pregunta sobre tus servicios?"
            )
            logger.info("Handled first or second fallback.")

        # If fallback is triggered multiple times, offer assistance or reset
        elif fallback_count >= 2:
            dispatcher.utter_message(
                text="Parece que no puedo entender tu mensaje. ¿Te gustaría intentar de nuevo o contactar con la SEPS?"
            )
            logger.warning("Fallback triggered multiple times. Resetting fallback count.")
            return [SlotSet("fallback_count", 0)]  # Reset fallback count after offering assistance

        # If the message is too vague, gently prompt for more information
        elif len(user_message.split()) < 3:
            dispatcher.utter_message(
                text="¿Podrías darme un poco más de detalle, sobre la consulta?"
            )
            logger.info("Handled vague input fallback.")

        # Handle user feedback after repeated fallbacks
        elif fallback_count >= 3:
            dispatcher.utter_message(
                text="Si sigues teniendo problemas, puedes ponerte en contacto con la SEPS."
            )
            logger.warning("Fallback count exceeded 3. Prompted user to contact support.")

        # Handle asking for more context or specific details
        elif previous_message:
            dispatcher.utter_message(
                text=f"¿Podrías aclarar tu consulta?"
            )
            logger.info("Handled request for more context.")

        # Increment the fallback count (if less than 2, otherwise reset after support message)
        if fallback_count < 2:
            logger.info("Incrementing fallback count.")
            return [SlotSet("fallback_count", fallback_count + 1)]
        else:
            logger.info("Resetting fallback count after handling support.")
            return [SlotSet("fallback_count", 0)]  # Reset after providing support information

class ActionDefaultFallback(Action):
    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher, tracker, domain) -> List[Dict[Text, Any]]:
        fallback_count = tracker.get_slot("fallback_count") or 0
        fallback_count += 1

        logger.info(f"ActionDefaultFallback triggered. Current fallback count: {fallback_count}")

        if fallback_count >= 3:  # Limit to 3 fallback occurrences
            dispatcher.utter_message(
                text="Parece que no estamos entendiendo. Por favor, reformula tu pregunta o intenta algo diferente."
            )
            logger.warning("Fallback loop detected. Pausing conversation.")
            return [ConversationPaused(), SlotSet("fallback_count", 0)]

        dispatcher.utter_message(
            text="Lo siento, no entendí eso. ¿Podrías intentarlo de otra manera?"
        )
        logger.info("Prompted user to try again.")
        return [SlotSet("fallback_count", fallback_count), UserUtteranceReverted()]


class ActionResetAllSlotsExceptToken(Action):
    def name(self) -> Text:
        return "action_reset_all_slots_except_token"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get all slots except 'id_token'
        all_slots = tracker.slots.keys()
        slots_to_reset = [slot for slot in all_slots if slot != "id_token"]

        logger.info(f"Resetting all slots except 'id_token': {slots_to_reset}")

        # Reset all slots except 'id_token'
        return [SlotSet(slot, None) for slot in slots_to_reset] + [SlotSet("end_of_journey", False)]


class ActionResetAllSlots(Action):
    def name(self) -> Text:
        return "action_reset_all_slots"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Get all slots from the domain
        all_slots = tracker.slots.keys()
        logger.info(f"Resetting all slots: {list(all_slots)}")

        # Reset all slots by setting their values to None
        return [SlotSet(slot, None) for slot in all_slots]

class ActionSetEndOfJourneyFalse(Action):
    def name(self) -> Text:
        return "action_set_end_of_journey_false"

    def run(self, dispatcher, tracker, domain) -> List[Dict[Text, Any]]:
        return [SlotSet("end_of_journey", False)]

class ActionHandoff(Action):
    def name(self) -> str:
        return "action_human_agent_handoff"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Collect conversation history
        conversation = []
        for event in tracker.events:
            if event.get("event") == "user" and "text" in event:
                conversation.append(f"User: {event['text']}")
            elif event.get("event") == "bot" and "text" in event:
                conversation.append(f"Bot: {event['text']}")

        transcript = "\n".join(conversation)

        # Construct API URL dynamically
        api_url = f"{TICKET_BASE_URL}/api/v1/transcripts/send"

        payload = {
            "handoff_to": "human_agent",
            "transcript": transcript
        }

        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(api_url, json=payload, headers=headers, timeout=120)
            response.raise_for_status()  # Raise exception for HTTP errors
            print(f"API Response [{response.status_code}]: {response.text}")
        except requests.exceptions.Timeout:
            dispatcher.utter_message(text="El tiempo de espera de la conexión ha expirado. Inténtelo más tarde.")
            print("Error: La solicitud API tardó demasiado en responder.")
        except requests.exceptions.ConnectionError:
            dispatcher.utter_message(text="Error de conexión con el servidor. Inténtelo más tarde.")
            print("Error: No se pudo conectar con la API.")
        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(text="Hubo un problema al conectar con el asistente humano.")
            print(f"Error en la solicitud API: {e}")

        # Send a message to inform the user
        dispatcher.utter_message(text="Lo estamos redirigiendo al Portal de Agente en Vivo para más ayuda.")

        # Redirect the user to the human agent chat portal
        dispatcher.utter_message(json_message={"redirect": HUMAN_AGENT_URL})

        # Stop conversation completely
        return [SlotSet("inquiry_redirect", True), SlotSet("handoff_requested", True)] #,Restarted()

class ActionResumeConversation(Action):
    def name(self) -> str:
        return "action_resume_conversation"

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="Continuando la conversación con el bot.")
        return [ConversationResumed()]

class ActionHandleMetadata(Action):
    def name(self) -> Text:
        return "action_handle_metadata"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: "Tracker",
            domain: "DomainDict") -> List[Dict[Text, Any]]:

        # Extract metadata from the latest message
        metadata = tracker.latest_message.get("metadata", {})
        logger.info(f"Received metadata: {metadata}")  # Log the metadata for debugging

        # Extract all attachment IDs by filtering keys starting with 'attachmentsIds'
        attachments = [value for key, value in metadata.items() if key.startswith("attachmentsIds") and value]

        if attachments:
            # Confirm processing to the user
            # dispatcher.utter_message(text=f"Processing {len(attachments)} attachments: {', '.join(attachments)}")
            dispatcher.utter_message(text=f"Procesando {len(attachments)} archivos adjuntos")
            logger.info(f"Processed attachments: {attachments}")
        else:
            # Handle case where no attachments are found
            # dispatcher.utter_message(text="No attachments found in the request.")
            logger.info("No attachments found in metadata.")
            dispatcher.utter_message(text="No se encontraron archivos adjuntos en la solicitud.")
        return []

########################PDF DOWNLOAD#######################################
class ActionFetchTicketIdsPdf(Action):
    def name(self) -> Text:
        """Defines the action name"""
        return "action_fetch_ticket_ids_status_pdf_download"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        """Fetches ticket IDs for PDF download"""

        # Retrieve user authentication token
        id_token = tracker.get_slot("id_token")

        if not id_token:
            logger.warning("No authorization token found.")
            dispatcher.utter_message(text="El código de autenticación falta. Por favor, inicie sesión nuevamente")
            return []

        # Set up headers for authentication
        headers = {"Authorization": f"Bearer {id_token}"}
        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets"

        try:
            logger.info(f"Fetching ticket data from {url}...")
            response = requests.get(url, headers=headers, timeout=120)
            response.raise_for_status()  # Raise an error for 4xx/5xx responses

            # Handling different HTTP response codes
            if response.status_code == 401:
                logger.warning("Unauthorized: Invalid or expired token.")
                dispatcher.utter_message(text="Código de autentificación inválido o expirado. Por favor, inicie sesión nuevamente.")
                return []
            elif response.status_code == 403:
                logger.warning("Forbidden: User not authorized to view tickets.")
                dispatcher.utter_message(text="No está autorizado para ver los tickets.")
                return []

            # Parse response JSON
            response_data = response.json()
            tickets = response_data if isinstance(response_data, list) else response_data.get("tickets", [])

            # If no tickets found
            if not tickets:
                logger.info("No tickets available for the user.")
                dispatcher.utter_message(text="Parece que no tiene tickets disponibles. ¿Le gustaría intentar nuevamente más tarde?")
                return [SlotSet("end_of_journey", False)]

            # Create buttons for available tickets
            buttons = [
                {
                    "title": f"ID de Ticket: {ticket.get('ticketId')}",
                    "payload": f"/select_status_ticket_id_pdf{{\"status_ticket_id_pdf\": \"{ticket.get('ticketId')}\"}}"
                }
                for ticket in tickets if ticket.get("ticketId")
            ]

            logger.info(f"Found {len(buttons)} tickets. Sending buttons to the user.")
            dispatcher.utter_message(text="Aquí están sus tickets disponibles para descargar en PDF:", buttons=buttons)

        except requests.exceptions.Timeout:
            logger.error("Request to fetch tickets timed out.")
            dispatcher.utter_message(text="La solicitud de tickets ha expirado. Inténtelo más tarde.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching tickets: {e}")
            dispatcher.utter_message(text="Ocurrió un error al recuperar los tickets. Por favor, intente nuevamente.")

        return []

class ActionDownloadPDF(Action):
    def name(self) -> Text:
        """Defines the action name"""
        return "action_download_pdf"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        """Handles PDF ticket download"""

        pdf_ticket_id = tracker.get_slot("pdf_ticket_id")
        id_token = tracker.get_slot("id_token")

        # 🔴 Check if Token Exists
        if not id_token:
            logger.error("id_token is missing in Rasa slots!")
            dispatcher.utter_message(text="No se encontró el token de autorización. Por favor, inicie sesión nuevamente.")
            return []

        # 🔍 Log Token Usage
        logger.info(f"Using Token: {id_token[:20]}... (truncated for security)")
        backend_url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/{pdf_ticket_id}/ticket-detail-pdf-download"
        user_friendly_url = f"{FRONT_END_URL}/download-ticket-pdf/{pdf_ticket_id}"

        # 🔵 Set Headers (Postman format)
        headers = {
            "Authorization": f"Bearer {id_token}"
        }

        try:
            # 🔍 Log API Request
            logger.info(f"Requesting PDF download from: {backend_url}")

            # 🔵 Make API Request (Same as Postman)
            response = requests.get(backend_url, headers=headers, timeout=120)

            # 📝 Log API Response Details
            logger.info(f"Response Status Code: {response.status_code}")
            logger.info(f"Response Headers: {response.headers}")
            logger.info(f"Response Content (First 500 chars): {response.text[:500]}")  # Truncated for safety

            # 🔴 Handle Unauthorized Response (401)
            if response.status_code == 401:
                logger.warning("Token is invalid or expired! Asking user to re-login.")
                dispatcher.utter_message(text="Tu sesión ha expirado. Por favor, inicia sesión nuevamente.")
                dispatcher.utter_message(response="utter_account_menu")  # Trigger claim menu
                return []

            # ✅ If PDF Download is Successful
            if response.status_code == 200:
                logger.info(f"PDF ready for Ticket ID: {pdf_ticket_id}. Redirecting user.")
                dispatcher.utter_message(text="Tu PDF está listo para descargar. Redirigiendo ahora...")
                dispatcher.utter_message(json_message={"redirect": user_friendly_url})

            # ⚠️ Handle Other Errors (4xx, 5xx)
            else:
                logger.error(f"PDF download failed. Status: {response.status_code}, Response: {response.text}")
                dispatcher.utter_message(text="No se pudo descargar el PDF. Intente nuevamente.")

        except requests.exceptions.Timeout:
            logger.error("PDF download request timed out.")
            dispatcher.utter_message(text="La descarga del PDF ha expirado. Inténtelo nuevamente.")
            dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu
        except requests.exceptions.RequestException as e:
            logger.error(f"Error during PDF download: {e}")
            dispatcher.utter_message(text="Ocurrió un error al descargar el PDF. Por favor, inténtelo nuevamente")
            dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu

        return []

class ActionSendInquiry(Action):
    def name(self) -> str:
        return "action_send_inquiry_datapoints"

    async def run(self, dispatcher, tracker, domain):
        # Retrieve the API base URL from environment variables
        base_url = os.getenv("USER_BASE_URL")
        if not base_url:
            logger.error("USER_BASE_URL is missing in environment variables.")
            return []
        
        # Construct the complete API endpoint URL
        url = f"{base_url}/api/v1/inquiry"

        # Retrieve necessary data from the conversation tracker
        sender_id = tracker.sender_id  # Unique user session identifier
        user_name = tracker.get_slot("name")  # Retrieve user name from slots (updated from user_name to name)
        inquiry_resolved = tracker.get_slot("inquiry_resolved")  # Status of inquiry resolution
        inquiry_redirect = tracker.get_slot("inquiry_redirect")  # Whether the inquiry was redirected
        inquiry_channel = tracker.get_latest_input_channel()  # Capture the inquiry source (Web, WhatsApp, etc.)
        ease_of_finding = tracker.get_slot("ease_of_finding")  # Survey rating for ease of finding info
        formats_provided = tracker.get_slot("formats_provided")  # Survey rating for formats provided
        clarity_response = tracker.get_slot("clarity_response")  # Survey rating for clarity of response
        attention_time = tracker.get_slot("attention_time")  # Survey rating for attention time

        # Retrieve API key from environment variable
        api_key = INQUIRY_TOKEN #os.getenv("INQUIRY_TOKEN")
        if not api_key:
            logger.error("INQUIRY_TOKEN is missing in environment variables.")
            return []

        # Construct the JSON payload with retrieved values, ensuring defaults for missing data
        payload = json.dumps({
            "senderId": sender_id,
            "userName": user_name if user_name else "Unknown",  # Use correct slot name
            "inquiryResolved": inquiry_resolved if inquiry_resolved else "False",  # Ensure boolean format
            "inquiryRedirect": inquiry_redirect if inquiry_redirect else "False",  # Ensure boolean format
            "inquiryChannel": "Chatbot",
            "easeOfFinding": ease_of_finding.split(" ")[0] if ease_of_finding else "",  # Extract numeric part only
            "formatsProvided": formats_provided.split(" ")[0] if formats_provided else "",
            "clarityResponse": clarity_response.split(" ")[0] if clarity_response else "",
            "attentionTime": attention_time.split(" ")[0] if attention_time else ""
        })

        # Define the required headers for API authentication and content type
        headers = {
            'X-API-KEY': api_key,  # API key retrieved from environment variable INQUIRY_TOKEN
            'Content-Type': 'application/json'  # Ensure request is sent as JSON
        }

        # Attempt to send the HTTP POST request to the API
        try:
            response = requests.post(url, headers=headers, data=payload)
            response.raise_for_status()  # Raise an error for unsuccessful responses
            logger.info(f"Inquiry successfully recorded for sender_id: {sender_id}")
        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err}")
        except requests.exceptions.ConnectionError:
            logger.error("Failed to connect to the API endpoint.")
        except requests.exceptions.Timeout:
            logger.error("Request timed out while sending inquiry data.")
        except requests.exceptions.RequestException as err:
            logger.error(f"Unexpected error occurred: {err}")
        
        return []
