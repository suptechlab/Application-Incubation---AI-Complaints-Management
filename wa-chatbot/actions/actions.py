# Standard Library Imports
import os  # For environment variables and file handling
import time  # For time-related operations
import json  # For handling JSON data
import logging  # For logging messages
import re  # For regular expressions
import warnings  # To suppress warnings
from typing import Any, Text, Dict, List, Optional  # Type hinting support
from datetime import datetime, timedelta  # For date and time operations

# Third-Party Library Imports
import requests  # To make HTTP requests
import urllib3  # For handling HTTP requests and disabling SSL warnings
import aiohttp  # For async HTTP requests
from dotenv import load_dotenv  # Load environment variables from .env file

# Rasa SDK Imports (Organized by Category)
from rasa_sdk import Action  # Base action class for custom actions
from rasa_sdk.executor import CollectingDispatcher  # Handles sending responses to users
from rasa_sdk.interfaces import Tracker  # Tracks conversation history and state
from rasa_sdk.types import DomainDict  # Type alias for domain dictionaries
from rasa_sdk.forms import FormValidationAction  # For validating form inputs

# Rasa SDK Events (Organized for Readability)
from rasa_sdk.events import (
    SlotSet,  # Set slot values
    FollowupAction,  # Trigger another action immediately
    UserUtteranceReverted,  # Undo the last user message
    ActiveLoop,  # Manage active loops for forms
    EventType,  # Generic event type
    Restarted,  # Restart the conversation
    AllSlotsReset,  # Reset all slots
    ConversationPaused,  # Pause the conversation
    ConversationResumed  # Resume the conversation
)

# Load environment variables from .env file
load_dotenv()

# Disable SSL warnings for insecure requests
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Suppress deprecation warnings (Use cautiously in production)
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Local Module Imports
from . import rag_app  # Import the rag_app.py script (Ensure it's in the same folder)
from .logger_fun import setup_logger  # Import the logger setup function

# Initialize logger
logger = setup_logger()

# # Environment variables for URLs
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

# Environment variables for URLs
AUTH_BASE_URL="https://api-stg-suptech.seps.gob.ec/auth"
USER_BASE_URL="https://api-stg-suptech.seps.gob.ec/user"
ADMIN_BASE_URL="https://api-stg-suptech.seps.gob.ec/admin"
TICKET_BASE_URL="https://api-stg-suptech.seps.gob.ec/ticket"
COLLECTION_CENTER_URL = "https://centroserviciosacopio.seps.gob.ec"
HUMAN_AGENT_URL = "https://servicios.seps.gob.ec/mibew/index.php/chat?locale=es&utm_source=seps"
FRONT_END_URL="https://webportal-stg-suptech.seps.gob.ec"
INQUIRY_TOKEN="3n9Xz+1J6hQG3D2NqZldnA0PbJlVa3YZb2JkTkgYjP0="
FAISS_INDEX_FILE="/app/actions/faiss_index"

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
                        dispatcher.utter_message(text="Protección de datos aceptada con éxito.")
                    else:
                        dispatcher.utter_message(text="Protección de datos rechazada con éxito.")
                else:
                    dispatcher.utter_message(text="Ocurrió un problema al procesar su solicitud.")
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
            dispatcher.utter_message(text="El campo de nombre está vacío. Proporcione su nombre completo.")
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
        dispatcher.utter_message(
            text=f"Por favor, visite el Centro de Servicio al Ciudadano para obtener ayuda: {COLLECTION_CENTER_URL}"
        )
        # Update inquiry_redirect slot to TRUE to reflect redirection
        return [SlotSet("inquiry_redirect", True)]   #, Restarted()

class ActionEndConversation(Action):
    def name(self) -> Text:
        return "action_end_conversation"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="¡Fue un placer asistirle!")
        return []

###########Claims Custom Actions#################################

class ActionResetEmail(Action):
    def name(self) -> str:
        return "action_reset_email"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        dispatcher.utter_message(text="✉️ Correo anterior eliminado. Ingresa tu nuevo correo. 📧")
        return [SlotSet("user_email", None), SlotSet("user_otp_token", None)]

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
            # dispatcher.utter_message(text="Por favor, ingrese una dirección de correo electrónico válida.")
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
                    dispatcher.utter_message(text="La dirección de correo electrónico no está registrada. Por favor, regístrese primero.")
                    logger.warning(f"Email not registered: {user_email}")
                    return {"user_email": None, "user_otp_token": None}

                # Handle any other unknown error codes
                else:
                    dispatcher.utter_message(text=error_message)
                    logger.error(f"Unexpected email validation error: {error_message}")
                    return {"user_email": None}

            else:
                dispatcher.utter_message(text="Lo sentimos, no pudimos enviar el OTP. Inténtelo de nuevo más tarde.")

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
                    # dispatcher.utter_message(text="El código OTP ingresado es incorrecto. Por favor, ingrese el código correcto o solicite un nuevo OTP.")
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
                dispatcher.utter_message(text="Lo sentimos, el OTP no es válido. Inténtelo de nuevo más tarde.")

            logger.error(f"Invalid OTP verification attempt: {http_err}")
            return {"user_otp": None, "id_token": None}

        except requests.exceptions.RequestException as e:
            logger.error(f"OTP verification request failed: {e}")
            dispatcher.utter_message(text="Ocurrió un error al verificar el OTP. Por favor, verifica tu conexión a internet e inténtalo nuevamente.")
            
            # Deactivate the loop to prevent further OTP prompts
            return {"user_otp": None, "id_token": None, "active_loop": None}


class ValidateUserForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_user_registration_form"

    # Validate the national ID provided by the user
    def validate_new_user_national_id(
        self,
        slot_value: Any,  # The value entered by the user
        dispatcher: CollectingDispatcher,  # Used to send messages to the user
        tracker: Tracker,  # Tracks the state of the conversation
        domain: Dict[Text, Any],  # Domain configuration for the bot
    ) -> Dict[Text, Any]:
        national_id = slot_value
        url = f"{AUTH_BASE_URL}/api/person-info?identificacion={national_id}"

        try:
            logger.info(f"Validating National ID: {national_id}")
            headers = {"Accept-Language": "es"}  # Use Spanish for the API request
            response = requests.get(url, headers=headers, timeout=60)  # Make the API call with a timeout of 60 seconds
            response.raise_for_status()  # Raise an error for HTTP issues
            response_data = response.json()  # Parse the response JSON

            # Check if the API validated the national ID
            if response_data.get("identificacion") == national_id:
                logger.info(f"National ID {national_id} validated successfully. Name: {response_data.get('nombreCompleto')}")
                logger.debug(f"Setting slot 'new_user_national_id' with value: {national_id}")
                return {"new_user_national_id": national_id}
            else:
                # Inform the user that validation failed
                dispatcher.utter_message(
                    text="No pudimos verificar su identificación nacional. Por favor, revise los datos proporcionados y vuelva a intentarlo."
                )
                logger.error(f"Validation failed for National ID {national_id}. Response: {response_data}")
                logger.debug(f"Slot 'new_user_national_id' not set. Value is None.")
                return {"new_user_national_id": None}
        except requests.exceptions.RequestException as e:
            # Handle network issues
            logger.exception(f"Network error during National ID validation: {e}")
            dispatcher.utter_message(
                text="Ocurrió un problema de conexión mientras verificábamos su identificación nacional. Por favor, inténtelo nuevamente más tarde."
            )
            logger.debug(f"Slot 'new_user_national_id' not set due to network error. Value is None.")
            return {"new_user_national_id": None}
        except Exception as e:
            # Handle unexpected errors
            logger.exception(f"Unexpected error during National ID validation: {e}")
            dispatcher.utter_message(
                text="Ocurrió un problema inesperado mientras verificábamos su identificación nacional. Por favor, inténtelo nuevamente más tarde."
            )
            logger.debug(f"Slot 'new_user_national_id' not set due to unexpected error. Value is None.")
            return {"new_user_national_id": None}

    # Validate the fingerprint provided by the user
    def validate_new_user_fingerprint(
        self,
        slot_value: Any,  # The value entered by the user
        dispatcher: CollectingDispatcher,  # Used to send messages to the user
        tracker: Tracker,  # Tracks the state of the conversation
        domain: Dict[Text, Any],  # Domain configuration for the bot
    ) -> Dict[Text, Any]:
        national_id = tracker.get_slot("new_user_national_id")  # Retrieve the previously set national ID
        fingerprint = slot_value
        url = f"{AUTH_BASE_URL}/api/validate-individual-person"
        payload = json.dumps({"identificacion": national_id, "individualDactilar": fingerprint})  # Prepare the payload
        headers = {"Accept-Language": "es", "Content-Type": "application/json"}  # Set headers for the API request

        try:
            logger.info(f"Validating fingerprint for National ID: {national_id}")
            response = requests.post(url, headers=headers, data=payload, timeout=60)  # Make the API call with a timeout of 60 seconds
            response.raise_for_status()  # Raise an error for HTTP issues
            response_data = response.json()  # Parse the response JSON

            # Check if the API validated the fingerprint
            if isinstance(response_data, bool):
                if response_data:
                    logger.info(f"Fingerprint verification successful for National ID: {national_id}")
                    logger.debug(f"Setting slots 'new_user_fingerprint' with value: {fingerprint} and 'new_user_fingerprint_valid' with value: True")
                    return {"new_user_fingerprint": fingerprint, "new_user_fingerprint_valid": True}
                else:
                    # Inform the user that validation failed
                    dispatcher.utter_message(
                        text="No pudimos verificar su código dactilar. Por favor, revise los datos proporcionados y vuelva a intentarlo."
                    )
                    logger.error(f"Fingerprint validation failed for National ID {national_id}. Response: {response_data}")
                    logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set. Values are None and False.")
                    return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}
            else:
                # Handle unexpected response format
                logger.error(f"Unexpected response format: {response_data}")
                dispatcher.utter_message(
                    text="Ocurrió un error durante la verificación de su código dactilar. Por favor, inténtelo nuevamente más tarde."
                )
                logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set due to unexpected response format. Values are None and False.")
                return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}
        except requests.exceptions.RequestException as e:
            # Handle network issues
            logger.exception(f"Network error during fingerprint validation: {e}")
            dispatcher.utter_message(
                text="Ocurrió un problema de conexión mientras verificábamos su código dactilar. Por favor, inténtelo nuevamente más tarde."
            )
            logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set due to network error. Values are None and False.")
            return {"new_user_fingerprint": None, "new_user_fingerprint_valid": False}
        except Exception as e:
            # Handle unexpected errors
            logger.exception(f"Unexpected error during fingerprint validation: {e}")
            dispatcher.utter_message(
                text="Ocurrió un problema inesperado mientras verificábamos su código dactilar. Por favor, inténtelo nuevamente más tarde."
            )
            logger.debug(f"Slots 'new_user_fingerprint' and 'new_user_fingerprint_valid' not set due to unexpected error. Values are None and False.")
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
        if re.fullmatch(r"\d{1,15}", value):  # Check if the value is up to 15 digits
            logger.debug(f"Setting slot 'phone_number' with value: {value}")
            return {"phone_number": value}
        else:
            # Inform the user with a wrapper message
            dispatcher.utter_message(text="El número de teléfono debe contener hasta 15 dígitos. Por favor, introduce un número válido.")
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
            response = requests.post(url, headers=headers, data=payload, timeout=60)
            
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
            dispatcher.utter_message(text="El código OTP debe ser un número de 6 dígitos. Por favor, inténtalo nuevamente.")
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
            response = requests.post(url, headers=headers, data=payload, timeout=60)
            
            # OTP verification successful
            if response.status_code == 204:
                logger.debug(f"Setting slot 'new_user_otp' with value: {user_otp}")
                dispatcher.utter_message(text="¡OTP verificado con éxito!")
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
                        resend_response = requests.get(resend_url, headers=headers, timeout=60)
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
            dispatcher.utter_message(text="El registro no puede proceder. Por favor, proporcione todos los detalles requeridos.")
            logger.warning("Incomplete user details provided for registration.")
            return []

        # Helper function to make API calls
        def make_api_call(url, headers, payload):
            try:
                # Make the API POST request
                response = requests.post(url, headers=headers, data=payload, timeout=60)
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
                # dispatcher.utter_message(text="¡Registro exitoso! Ahora puede continuar con la presentación de una reclamación.")
                logger.info(f"User with National ID {national_id} registered successfully.")
                return [
                    {"event": "slot", "name": "new_user_registered", "value": True},  # Indicate registration success
                    {"event": "slot", "name": "id_token", "value": id_token}  # Store ID token in slot
                ]
            else:
                # Handle missing ID token in the response
                dispatcher.utter_message(text="El registro falló debido a que la identificación nacional y la código dactila ya están registradas.")
                logger.error(f"Failed to retrieve ID token for user with National ID {national_id}. Response: {response.text}")
                return []
        elif response and response.status_code == 400:
            # Handle bad request errors
            logger.error(f"Registration failed for user with National ID {national_id}. Response: {response.text}")
            dispatcher.utter_message(text="El registro falló. Inténtelo de nuevo más tarde.")
            return []
        else:
            # Handle other errors or lack of response
            dispatcher.utter_message(text="El registro falló debido a que la identificación nacional y la código dactilar ya están registradas.")
            logger.error(f"Failed to register user with National ID {national_id}. Response: {response.text if response else 'No response'}")
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
            dispatcher.utter_message(text="Autenticación fallida. Por favor, inicie sesión nuevamente.")
            return []

        # Retrieve ticket list and pagination data
        ticket_list = tracker.get_slot("ticket_list") or []
        ticket_page = tracker.get_slot("ticket_page") or 1  # Default to page 1

        page_size = 2  # Show only 2 tickets at a time
        start_index = (ticket_page - 1) * page_size  # Calculate starting index

        # Reset ticket list if switching from another action
        last_action = tracker.get_slot("last_ticket_action")
        if last_action != "fetch_tickets":
            ticket_list = []
            ticket_page = 1

        if not ticket_list:
            # Fetch tickets from API only if not already stored
            url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/list-for-file-second-instance-or-complaint/SECOND_INSTANCE"
            headers = {'Authorization': f'Bearer {auth_token}'}

            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()  # Raise an error for HTTP issues
                ticket_list = response.json()  # Parse the JSON response

                if not isinstance(ticket_list, list):
                    dispatcher.utter_message(text="Hubo un problema al procesar la respuesta del servidor.")
                    return []

                if not ticket_list:
                    dispatcher.utter_message(text="No se encontraron boletos disponibles.")
                    dispatcher.utter_message(response="utter_claim_menu")
                    return [
                        SlotSet("ticket_page", 1),
                        SlotSet("ticket_list", []),
                        SlotSet("last_ticket_action", "fetch_tickets")
                    ]

                logger.info(f"Second instance tickets fetched successfully: {ticket_list}")

            except requests.exceptions.Timeout:
                dispatcher.utter_message(text="La solicitud de boletos ha expirado. Inténtelo más tarde.")
                return []

            except requests.exceptions.ConnectionError:
                dispatcher.utter_message(text="No se pudo conectar con el servicio. Verifique su conexión a internet.")
                return []

            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching second instance tickets: {e}")
                dispatcher.utter_message(text="Hubo un problema al obtener los boletos. Intente nuevamente más tarde.")
                return []

        # Get the subset of tickets for the current page
        paginated_tickets = ticket_list[start_index:start_index + page_size]

        # Generate buttons for each ticket (Keeping 🎟️ emoji for consistency)
        buttons = [
            {
                "title": f"🎟️ {ticket.get('ticketId')}",
                "payload": f"/select_ticket{{\"ticket_id\": \"{ticket.get('ticketId')}\"}}"
            }
            for ticket in paginated_tickets if ticket.get("ticketId")
        ]

        # Add "Más" button if more tickets are available
        if start_index + page_size < len(ticket_list):
            logger.info("📜 Más boletos solicitados por el usuario. Mostrando siguiente página. 🎟️")
            buttons.append({
                "title": "Más 🎟️",  # Fixed button text for consistency
                "payload": "/second_instance_next_ticket"  # Different pagination intent for second-instance tickets
            })
            new_ticket_page = ticket_page + 1  # Increment the page
        else:
            new_ticket_page = 1  # Reset pagination when all tickets are shown

        # Send buttons to the user if available, otherwise notify no tickets found
        if buttons:
            dispatcher.utter_message(text="Seleccione un ticket:", buttons=buttons)
        else:
            dispatcher.utter_message(text="No se encontraron boletos disponibles.")
            dispatcher.utter_message(response="utter_claim_menu")

        logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")

        return [
            SlotSet("ticket_page", new_ticket_page),
            SlotSet("ticket_list", ticket_list),
            SlotSet("last_ticket_action", "fetch_tickets")
        ]


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
            dispatcher.utter_message(text="No se seleccionó ningún boleto. Por favor, elija un ID de boleto primero.")
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
            dispatcher.utter_message(text="Hubo un problema al obtener los detalles del boleto. Intente nuevamente más tarde.")
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
            dispatcher.utter_message(text=f"No se encontró el ID de referencia de reclamación para el boleto {ticket_id}.")
            return []
   
class ValidateSecondInstanceClaimCommentsForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_second_instance_claim_comments_form"

    def validate_second_instance_claim_comments(
        self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> Dict[Text, Any]:
        if not isinstance(slot_value, str):
            dispatcher.utter_message(text="Comment must be valid text. Please try again.")
            return {"second_instance_claim_comments": None}

        if len(slot_value.strip()) == 0:
            dispatcher.utter_message(text="Comment cannot be empty. Please provide a valid comment.")
            return {"second_instance_claim_comments": None}

        if len(slot_value) > 1024:
            dispatcher.utter_message(text="Comment cannot exceed 1024 characters. Please provide a shorter comment.")
            return {"second_instance_claim_comments": None}

        return {"second_instance_claim_comments": slot_value}

# ✅ Supported MIME Types and Extensions
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
class ActionFileSecondInstance(Action):
    def name(self) -> Text:
        return "action_file_second_instance"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict]:
        """Handles second-instance claim submission with multiple file attachments"""

        logger.info(f"Tracker slots: {tracker.current_slot_values()}")

        # ✅ Extract required slots
        auth_token = tracker.get_slot("id_token")
        claim_reference_id = tracker.get_slot("claim_reference_id")
        second_instance_comment = tracker.get_slot("second_instance_claim_comments")

        # ✅ Retrieve stored attachments from slots
        attachments = []
        opened_files = []
        file_paths = tracker.get_slot("file_path")
        mime_types = tracker.get_slot("mime_type")
        captions = tracker.get_slot("caption")

        if file_paths:
            try:
                file_paths = json.loads(file_paths)
                mime_types = json.loads(mime_types) if mime_types else []
                captions = json.loads(captions) if captions else []

                for idx, file_path in enumerate(file_paths):
                    if os.path.exists(file_path):
                        file_extension = os.path.splitext(file_path)[-1].lower()
                        correct_mime_type = mime_types[idx] if idx < len(mime_types) else "application/octet-stream"

                        expected_ext = MIME_TYPE_MAP.get(correct_mime_type, None)
                        if expected_ext and not file_path.endswith(expected_ext):
                            logger.warning(f"⚠️ File extension mismatch! Expected {expected_ext} for {correct_mime_type}, got {file_extension}.")
                            correct_mime_type = next((k for k, v in MIME_TYPE_MAP.items() if v == file_extension), "application/octet-stream")

                        file_obj = open(file_path, "rb")
                        opened_files.append(file_obj)

                        attachments.append((
                            f"attachments[{idx}]",
                            (os.path.basename(file_path), file_obj, correct_mime_type)
                        ))

                        logger.info(f"✅ File {file_path} added with MIME type: {correct_mime_type}")

            except Exception as e:
                logger.error(f"Error processing attachments: {str(e)}")

        # ✅ Validate required fields
        slots = {
            "id_token": auth_token,
            "claim_reference_id": claim_reference_id,
            "second_instance_claim_comments": second_instance_comment
        }

        missing_fields = [key for key, value in slots.items() if not (value and str(value).strip())]
        if missing_fields:
            logger.error(f"Mandatory fields are missing: {', '.join(missing_fields)}.")
            dispatcher.utter_message(text="No se pudo presentar la reclamo de segunda instancia. Por favor asegúrese de que todos los campos obligatorios estén llenos.")
            return []

        # ✅ Prepare API payload
        payload = {
            'id': str(claim_reference_id),
            'comment': second_instance_comment,
            'source': 'CHATBOT',
            'channelOfEntry': 'WHATSAPP'
        }

        headers = {
            'Accept-Language': 'en',
            'Authorization': f'Bearer {auth_token}'
        }

        url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/file-second-instance-claim"
        logger.info(f"Sending second instance claim submission request to: {url}")

        try:
            response = requests.post(url, headers=headers, data=payload, files=attachments, timeout=60)

            if response.status_code == 200:
                result = response.json()
                ticket_id = result.get("newTicketId", "")
                if ticket_id:
                    dispatcher.utter_message(
                        text=f"Se ha presentado su reclamo de segunda instancia con el número de ticket:\n{ticket_id}"
                    )
                else:
                    dispatcher.utter_message(text="La reclamo de segunda instancia se presentó con éxito.")
                logger.info("✅ Second instance claim filed successfully.")

                # ✅ Reset all related slots
                return [
                    SlotSet("claim_reference_id", None),
                    SlotSet("second_instance_claim_comments", None),
                    SlotSet("file_path", None),
                    SlotSet("mime_type", None),
                    SlotSet("caption", None),
                    SlotSet("ticket_list", None),         # 🔁 Reset ticket list
                    SlotSet("ticket_page", 1),            # 🔁 Reset page
                    SlotSet("last_ticket_action", None)   # 🔁 Ensure refetch on next attempt
                ]
            elif response.status_code == 400:
                dispatcher.utter_message(text="Parece que ya ha presentado una reclamo de segunda instancia para este caso.")
                logger.error(f"❌ Bad request error. Status code: {response.status_code}, Response: {response.text}")
            elif response.status_code == 401:
                dispatcher.utter_message(text="No autorizado. Por favor, inicie sesión nuevamente.")
                logger.error("❌ Unauthorized request. Please check the authentication token.")
            elif response.status_code == 500:
                dispatcher.utter_message(text="El servidor encontró un error. Por favor, intente nuevamente más tarde.")
                logger.error("❌ Internal server error encountered.")
            else:
                dispatcher.utter_message(text="No se pudo presentar la reclamo de segunda instancia debido a un error interno. Por favor intente nuevamente más tarde.")
                logger.error(f"❌ Unexpected error. Status code: {response.status_code}, Response: {response.text}")

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Unexpected error while filing second instance claim: {str(e)}")
            dispatcher.utter_message(text="Ocurrió un error inesperado mientras se presentaba la reclamo de segunda instancia. Por favor intente nuevamente más tarde.")

        finally:
            for file_obj in opened_files:
                try:
                    file_obj.close()
                except Exception as e:
                    logger.warning(f"⚠️ Failed to close file object: {str(e)}")

        # Default slot reset if unsuccessful (only file slots)
        return [
            SlotSet("file_path", None),
            SlotSet("mime_type", None),
            SlotSet("caption", None)
        ]
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
            dispatcher.utter_message(text="Hubo un problema al obtener los boletos. Intente nuevamente más tarde.")
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
            dispatcher.utter_message(text="Seleccione un ID de boleto para queja:", buttons=buttons)
        else:
            dispatcher.utter_message(text="No se encontraron boletos disponibles para quejas.")
            dispatcher.utter_message(response="utter_claim_menu")  # Trigger claim menu
        logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")
        return []

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
            dispatcher.utter_message(text="Autenticación fallida. Por favor, inicie sesión nuevamente.")
            return []

        # Retrieve ticket list and pagination data
        ticket_list = tracker.get_slot("ticket_list") or []
        ticket_page = tracker.get_slot("ticket_page") or 1  # Default to page 1

        page_size = 2  # Show only 2 tickets at a time
        start_index = (ticket_page - 1) * page_size  # Calculate starting index

        # Reset ticket list if switching from another action
        last_action = tracker.get_slot("last_ticket_action")
        if last_action != "fetch_complaint_tickets":
            ticket_list = []
            ticket_page = 1

        if not ticket_list:
            # Fetch tickets from API only if not already stored
            url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets/list-for-file-second-instance-or-complaint/COMPLAINT"
            headers = {'Authorization': f'Bearer {auth_token}', 'Accept-Language': 'es'}

            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()  # Raise an error for HTTP issues
                ticket_list = response.json()  # Parse the JSON response

                if not isinstance(ticket_list, list):
                    dispatcher.utter_message(text="Hubo un problema al procesar la respuesta del servidor.")
                    return []

                if not ticket_list:
                    dispatcher.utter_message(text="No se encontraron boletos disponibles para denuncias.")
                    dispatcher.utter_message(response="utter_claim_menu")
                    return [
                        SlotSet("ticket_page", 1),
                        SlotSet("ticket_list", []),
                        SlotSet("last_ticket_action", "fetch_complaint_tickets")
                    ]

                logger.info(f"Complaint tickets fetched successfully: {ticket_list}")

            except requests.exceptions.Timeout:
                dispatcher.utter_message(text="La solicitud de boletos ha expirado. Inténtelo más tarde.")
                return []

            except requests.exceptions.ConnectionError:
                dispatcher.utter_message(text="No se pudo conectar con el servicio. Verifique su conexión a internet.")
                return []

            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching complaint tickets: {e}")
                dispatcher.utter_message(text="Hubo un problema al obtener los boletos. Intente nuevamente más tarde.")
                return []

        # Get the subset of tickets for the current page
        paginated_tickets = ticket_list[start_index:start_index + page_size]

        # Generate buttons for each ticket (Removing "Boleto" but keeping 🎟️)
        buttons = [
            {
                "title": f"🎟️ {ticket.get('ticketId')}",
                "payload": f"/select_second_instance_ticket_id{{\"complaint_ticket_id\": \"{ticket.get('ticketId')}\"}}"
            }
            for ticket in paginated_tickets if ticket.get("ticketId")
        ]

        # Add "Más" button if more tickets are available
        if start_index + page_size < len(ticket_list):
            logger.info("📜 Más boletos solicitados por el usuario. Mostrando siguiente página. 🎟️")
            buttons.append({
                "title": "Más 🎟️",  # Fixed button title for consistency
                "payload": "/claim_complaint_ticket_next"
            })
            new_ticket_page = ticket_page + 1  # Increment the page
        else:
            new_ticket_page = 1  # Reset pagination when all tickets are shown

        # Send buttons to the user if available, otherwise notify no tickets found
        if buttons:
            dispatcher.utter_message(text="Seleccione un ticket para elevar a denuncia:", buttons=buttons)
        else:
            dispatcher.utter_message(text="No se encontraron boletos disponibles para denuncia.")
            dispatcher.utter_message(response="utter_claim_menu")

        logger.info(f"Tracker slots (before filing claim): {tracker.current_slot_values()}")

        return [
            SlotSet("ticket_page", new_ticket_page),
            SlotSet("ticket_list", ticket_list),
            SlotSet("last_ticket_action", "fetch_complaint_tickets")
        ]

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
        elif len(slot_value) > 4000:
            logger.error("Validation error: complaint_antecedentes exceeds max length of 4000 characters.")
            dispatcher.utter_message(
                text="El campo de antecedentes no puede exceder los 4000 caracteres. Por favor, reduzca su entrada."
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
                text="El campo de petición específica no puede estar vacío. Por favor, intente nuevamente."
            )
            return {"complaint_peticion_especifica": None}
        elif len(slot_value) > 4000:
            logger.error("Validation error: complaint_peticion_especifica exceeds max length of 4000 characters.")
            dispatcher.utter_message(
                text="El campo de petición específica no puede exceder los 4000 caracteres. Por favor, reduzca su entrada."
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
        logger.info(f"Tracker slots: {tracker.current_slot_values()}")

        # Extract required slots
        auth_token = tracker.get_slot("id_token")
        complaint_reference_id = tracker.get_slot("complaint_reference_id")
        specific_petition = tracker.get_slot("complaint_peticion_especifica")
        precedents = tracker.get_slot("complaint_antecedentes")

        # Extract attachments from metadata (Both WhatsApp & Normal)
        metadata = tracker.latest_message.get("metadata", {})
        attachments = [value for key, value in metadata.items() if key.startswith("attachmentsIds")]

        # Handle WhatsApp Media Attachments (Fixing JSON formatting issue)
        if "file_path" in metadata:
            whatsapp_attachment = {
                "file_path": metadata["file_path"],
                "mime_type": metadata.get("mime_type", ""),
                "caption": metadata.get("caption", "")
            }
            attachments.append(json.dumps(whatsapp_attachment))  # Convert to proper JSON format

        # Check if all required data is available
        slots = {
            "id_token": auth_token,
            "complaint_reference_id": complaint_reference_id,
            "complaint_peticion_especifica": specific_petition,
            "complaint_antecedentes": precedents
        }

        missing_fields = [key for key, value in slots.items() if not (value and str(value).strip())]
        if missing_fields:
            logger.error(f"Mandatory fields are missing: {', '.join(missing_fields)}.")
            dispatcher.utter_message(text="No se pudo presentar la denuncia. Por favor asegúrese de que todos los campos obligatorios estén llenos.")
            return []

        # Prepare the payload with the required fields
        payload = {
            'id': complaint_reference_id,
            'specificPetition': specific_petition,
            'precedents': precedents,
            'source': 'CHATBOT',
            'channelOfEntry': 'WHATSAPP'
        }

        # Add attachment IDs dynamically to the payload
        if attachments:
            try:
                for index, attachment_id in enumerate(attachments):
                    if attachment_id:
                        payload[f'attachmentsIds[{index}]'] = attachment_id
                logger.info(f"Attachment IDs added to the request: {attachments}")
            except Exception as e:
                logger.error(f"Error processing attachment IDs: {str(e)}")
                dispatcher.utter_message(text="Hubo un error al procesar sus documentos adjuntos. Por favor intente nuevamente.")
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
            response = requests.post(url, headers=headers, data=payload, timeout=60)

            if response.status_code == 200:
                result = response.json()
                print(result)
                ticket_id = result.get("newTicketId", "")
                if ticket_id:
                    dispatcher.utter_message(
                        text=f"Se ha creado su denuncia, su número de ticket es:\n{ticket_id}"
                    )
                else:
                    dispatcher.utter_message(text="La denuncia se presentó con éxito.")
                logger.info("Complaint filed successfully.")

                # ✅ Reset all complaint-related slots
                return [
                    SlotSet("complaint_reference_id", None),
                    SlotSet("complaint_ticket_id", None),
                    SlotSet("complaint_peticion_especifica", None),
                    SlotSet("complaint_antecedentes", None),
                    SlotSet("file_path", None),
                    SlotSet("mime_type", None),
                    SlotSet("caption", None),
                    SlotSet("ticket_list", None),
                    SlotSet("ticket_page", 1),
                    SlotSet("last_ticket_action", None)
                ]

            elif response.status_code == 400:
                error_detail = response.json().get("errorDescription", "")
                logger.error(f"Bad request error. Status code: 400, Detail: {error_detail}")
                dispatcher.utter_message(text=error_detail or "Parece que hay un problema con los datos enviados. Por favor, revise la información y vuelva a intentarlo.")
            elif response.status_code == 401:
                dispatcher.utter_message(text="No autorizado. Por favor, inicie sesión nuevamente.")
                logger.error("Unauthorized request. Please check the authentication token.")
            elif response.status_code == 500:
                dispatcher.utter_message(text="El servidor encontró un error. Por favor, intente nuevamente más tarde.")
                logger.error("Internal server error encountered.")
            else:
                logger.error(f"Unexpected error. Status code: {response.status_code}, Response: {response.text}")
                dispatcher.utter_message(text="No se pudo presentar la denuncia debido a un error interno. Por favor intente nuevamente más tarde.")

        except requests.exceptions.RequestException as e:
            logger.error(f"Unexpected error while filing complaint: {str(e)}")
            dispatcher.utter_message(text="Ocurrió un error inesperado mientras se presentaba la denuncia. Por favor intente nuevamente más tarde.")

        # Default fallback: Reset attachment slots only
        return [
            SlotSet("file_path", None),
            SlotSet("mime_type", None),
            SlotSet("caption", None)
        ]


###################################################### ticket status ####################################################
class ActionFetchTicketIds(Action):
    def name(self) -> Text:
        """Defines the action name"""
        return "action_fetch_ticket_ids_status"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        """Fetches ticket IDs with pagination"""

        id_token = tracker.get_slot("id_token")
        if not id_token:
            dispatcher.utter_message(text="El token de autorización falta. Por favor, inicie sesión nuevamente.")
            return []

        ticket_list = tracker.get_slot("ticket_list") or []
        ticket_page = tracker.get_slot("ticket_page") or 1
        page_size = 2
        start_index = (ticket_page - 1) * page_size

        last_action = tracker.get_slot("last_ticket_action")
        if last_action != "fetch_ticket_status":
            ticket_list = []
            ticket_page = 1

        if not ticket_list:
            headers = {"Authorization": f"Bearer {id_token}"}
            url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets"

            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                response_data = response.json()

                ticket_list = response_data.get("tickets", []) if isinstance(response_data, dict) else response_data

                if not isinstance(ticket_list, list):
                    dispatcher.utter_message(text="Hubo un problema al procesar la respuesta del servidor.")
                    return []

                if not ticket_list:
                    dispatcher.utter_message(text="No hay tickets disponibles.")
                    return [
                        SlotSet("ticket_page", 1),
                        SlotSet("ticket_list", []),
                        SlotSet("last_ticket_action", "fetch_ticket_status")
                    ]

            except requests.exceptions.Timeout:
                dispatcher.utter_message(text="La solicitud de tickets ha expirado. Inténtelo más tarde.")
                return []

            except requests.exceptions.ConnectionError:
                dispatcher.utter_message(text="No se pudo conectar con el servicio. Verifique su conexión a internet.")
                return []

            except requests.exceptions.RequestException as e:
                dispatcher.utter_message(text="Ocurrió un error al recuperar los tickets. Por favor, intente más tarde.")
                return []

        total_tickets = len(ticket_list)

        if total_tickets <= 3:
            paginated_tickets = ticket_list
            show_more_button = False
            new_ticket_page = 1
        else:
            paginated_tickets = ticket_list[start_index:start_index + page_size]
            show_more_button = (start_index + page_size < total_tickets)
            new_ticket_page = ticket_page + 1 if show_more_button else 1

        buttons = [
            {
                "title": f"🎟️ {ticket.get('ticketId')}",
                "payload": f"/select_status_ticket_id{{\"status_ticket_id\": \"{ticket.get('ticketId')}\"}}"
            }
            for ticket in paginated_tickets if ticket.get("ticketId")
        ]

        if show_more_button:
            logger.info("📜 Más tickets solicitados por el usuario. Mostrando siguiente página. 🎟️")
            buttons.append({
                "title": "Más tickets 🎟️",
                "payload": "/claim_ticket_status_next"
            })

        if buttons:
            dispatcher.utter_message(text="Aquí están sus tickets:", buttons=buttons)
        else:
            dispatcher.utter_message(text="No hay más tickets para mostrar.")

        return [
            SlotSet("ticket_page", new_ticket_page),
            SlotSet("ticket_list", ticket_list),
            SlotSet("last_ticket_action", "fetch_ticket_status")
        ]


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
            error_response = json.dumps({"error": "El token de autorización falta. Por favor, inicie sesión nuevamente."}, indent=4, ensure_ascii=False)
            dispatcher.utter_message(text=error_response)
            logger.warning("Authorization token missing.")
            return []

        if not status_ticket_id:
            error_response = json.dumps({"error": "No se seleccionó ningún ID de ticket. Por favor, elija un ticket primero."}, indent=4, ensure_ascii=False)
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
                error_response = json.dumps({"error": "Token de autorización inválido o expirado. Por favor, inicie sesión nuevamente."}, indent=4, ensure_ascii=False)
                dispatcher.utter_message(text=error_response)
                logger.error("Unauthorized access - Invalid token.")
                return []
            elif response.status_code == 403:
                error_response = json.dumps({"error": "No está autorizado para ver los tickets."}, indent=4, ensure_ascii=False)
                dispatcher.utter_message(text=error_response)
                logger.error("Access forbidden - User not authorized.")
                return []
            elif response.status_code >= 500:
                error_response = json.dumps({"error": "Hay un problema con el servidor de tickets. Por favor, intente más tarde."}, indent=4, ensure_ascii=False)
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
                    f"*Detalles del Ticket:*\n\n"
                    f"*ID del Ticket:* {status_ticket_id}\n"
                    f"*Estado:* {ticket_status_spanish}\n"
                    f"*Agente FI:* {fi_agent_name}\n"
                    f"*Agente SEPS:* {seps_agent_name}"
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
            error_response = json.dumps({"error": "Ocurrió un error al recuperar los detalles del ticket. Por favor, intente más tarde."}, indent=4, ensure_ascii=False)
            dispatcher.utter_message(text=error_response)
            return []

##################################Supporting & fallback actions######################################
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
            dispatcher.utter_message(text="Parece que estás buscando algo fuera de lugar. ¿En qué puedo ayudarte?")
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
                text="Parece que no puedo entender tu mensaje. ¿Te gustaría intentar de nuevo o contactar con soporte?"
            )
            logger.warning("Fallback triggered multiple times. Resetting fallback count.")
            return [SlotSet("fallback_count", 0)]  # Reset fallback count after offering assistance

        # If the message is too vague, gently prompt for more information
        elif len(user_message.split()) < 3:
            dispatcher.utter_message(
                text="¿Podrías darme un poco más de detalle, por favor?"
            )
            logger.info("Handled vague input fallback.")

        # Handle user feedback after repeated fallbacks
        elif fallback_count >= 3:
            dispatcher.utter_message(
                text="Si sigues teniendo problemas, puedes ponerte en contacto con el soporte en nuestro sitio web."
            )
            logger.warning("Fallback count exceeded 3. Prompted user to contact support.")

        # Handle asking for more context or specific details
        elif previous_message:
            dispatcher.utter_message(
                text=f"Me mencionaste. ¿Podrías aclarar un poco más?"
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

        # Get all slots from the tracker except id_token
        all_slots = tracker.slots.keys()
        slots_to_reset = [slot for slot in all_slots if slot != "id_token"]

        logger.info(f"Resetting all slots except 'id_token': {slots_to_reset}")

        # Reset slots by setting their values to None, except id_token
        return [SlotSet(slot, None) for slot in slots_to_reset]

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

##################################live agent handoff#######################################      
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
            response = requests.post(api_url, json=payload, headers=headers, timeout=10)
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
        dispatcher.utter_message(text=f"Para más ayuda, visite el Portal de Agente en Vivo: {HUMAN_AGENT_URL}")

        # Stop conversation completely
        return [SlotSet("inquiry_redirect", True), SlotSet("handoff_requested", True)] #,Restarted()

class ActionResumeConversation(Action):
    def name(self) -> str:
        return "action_resume_conversation"

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="Continuando la conversación con el bot.")
        return [ConversationResumed()]

################handle attachment metadata################################
class ActionHandleMediaUpload(Action):
    def name(self) -> Text:
        return "action_handle_metadata"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict]:
        """Handles multiple media uploads and stores them in slots"""

        # ✅ Retrieve media metadata from latest user message
        metadata = tracker.latest_message.get("metadata", {})
        logger.info(f"📂 Metadata received in Rasa: {metadata}")

        if not metadata or "attachments" not in metadata:
            dispatcher.utter_message(text="❌ No se recibió información del archivo. Intente nuevamente.")
            logger.error("⚠️ No metadata found in the latest message.")
            return []

        # ✅ Extract media details (list of attachments)
        attachments = metadata.get("attachments", [])
        stored_files = []

        for attachment in attachments:
            file_path = attachment.get("file_path")
            mime_type = attachment.get("mime_type", "unknown")
            caption = attachment.get("caption", "")

            # ✅ Ensure file exists
            if not file_path or not os.path.exists(file_path):
                dispatcher.utter_message(text="❌ No se pudo procesar uno o más archivos. Verifique los archivos y vuelva a intentarlo.")
                logger.error(f"⚠️ Media file not found: {file_path}")
                continue

            # ✅ Store each file as a dictionary
            stored_files.append({
                "file_path": file_path,
                "mime_type": mime_type,
                "caption": caption
            })

            logger.info(f"📂 Stored file: {file_path} (MIME: {mime_type})")

        if not stored_files:
            dispatcher.utter_message(text="❌ No se recibieron archivos válidos.")
            return []

        dispatcher.utter_message(text="📁 Sus archivos han sido recibidos y almacenados para la denuncia.")

        return [
            SlotSet("file_path", json.dumps([f["file_path"] for f in stored_files])),
            SlotSet("mime_type", json.dumps([f["mime_type"] for f in stored_files])),
            SlotSet("caption", json.dumps([f["caption"] for f in stored_files]))
        ]


#############################################PDF DOWNLOAD###################################################
class ActionFetchTicketIdsPdf(Action):
    def name(self) -> Text:
        return "action_fetch_ticket_ids_status_pdf_download"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        id_token = tracker.get_slot("id_token")
        if not id_token:
            logger.warning("No authorization token found.")
            dispatcher.utter_message(text="El token de autorización falta. Por favor, inicie sesión nuevamente.")
            return []

        ticket_list = tracker.get_slot("ticket_list") or []
        ticket_page = tracker.get_slot("ticket_page") or 1
        page_size = 2
        start_index = (ticket_page - 1) * page_size

        last_action = tracker.get_slot("last_ticket_action")
        if last_action != "fetch_ticket_pdf":
            ticket_list = []
            ticket_page = 1

        if not ticket_list:
            headers = {"Authorization": f"Bearer {id_token}"}
            url = f"{TICKET_BASE_URL}/api/v1/user/claim-tickets"

            try:
                logger.info(f"Fetching ticket data from {url}...")
                response = requests.get(url, headers=headers, timeout=10)
                logger.info(f"Received response with status code: {response.status_code}")
                response.raise_for_status()

                response_data = response.json()
                ticket_list = response_data.get("tickets", []) if isinstance(response_data, dict) else response_data

                if not isinstance(ticket_list, list):
                    logger.error("Unexpected response format: %s", response_data)
                    dispatcher.utter_message(text="Hubo un problema al procesar la respuesta del servidor.")
                    return []

                if not ticket_list:
                    logger.info("No tickets available for the user.")
                    dispatcher.utter_message(text="Parece que no tiene tickets disponibles. ¿Le gustaría intentar nuevamente más tarde?")
                    return [
                        SlotSet("end_of_journey", False),
                        SlotSet("ticket_page", 1),
                        SlotSet("ticket_list", []),
                        SlotSet("last_ticket_action", "fetch_ticket_pdf")
                    ]

            except requests.exceptions.Timeout:
                logger.error("Request to fetch tickets timed out.")
                dispatcher.utter_message(text="La solicitud de tickets ha expirado. Inténtelo más tarde.")
                return []

            except requests.exceptions.ConnectionError:
                logger.error("Connection error while fetching tickets.")
                dispatcher.utter_message(text="No se pudo conectar con el servicio. Verifique su conexión a internet.")
                return []

            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching tickets: {e}")
                dispatcher.utter_message(text="Ocurrió un error al recuperar los tickets. Por favor, intente más tarde.")
                return []

        total_tickets = len(ticket_list)

        if total_tickets <= 3:
            paginated_tickets = ticket_list
            show_more_button = False
            new_ticket_page = 1
        else:
            paginated_tickets = ticket_list[start_index:start_index + page_size]
            show_more_button = (start_index + page_size < total_tickets)
            new_ticket_page = ticket_page + 1 if show_more_button else 1

        buttons = [
            {
                "title": f"🎫{ticket.get('ticketId')}",
                "payload": f"/select_status_ticket_id_pdf{{\"status_ticket_id_pdf\": \"{ticket.get('ticketId')}\"}}"
            }
            for ticket in paginated_tickets if ticket.get("ticketId")
        ]

        if show_more_button:
            buttons.append({
                "title": "Más tickets 🎫",
                "payload": "/claim_ticket_next"
            })

        if buttons:
            logger.info(f"Showing {len(paginated_tickets)} tickets. Sending buttons to the user.")
            dispatcher.utter_message(text="Aquí están sus tickets disponibles para descargar en PDF:", buttons=buttons)
        else:
            dispatcher.utter_message(text="No hay más tickets para mostrar.")

        return [
            SlotSet("ticket_page", new_ticket_page),
            SlotSet("ticket_list", ticket_list),
            SlotSet("last_ticket_action", "fetch_ticket_pdf")
        ]

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
            response = requests.get(backend_url, headers=headers, timeout=10)

            # 📝 Log API Response Details
            logger.info(f"Response Status Code: {response.status_code}")
            logger.info(f"Response Headers: {response.headers}")
            logger.info(f"Response Content (First 500 chars): {response.text[:500]}")  # Truncated for safety

            # 🔴 Handle Unauthorized Response (401)
            if response.status_code == 401:
                logger.warning("Token is invalid or expired! Asking user to re-login.")
                dispatcher.utter_message(text="Tu sesión ha expirado. Por favor, inicia sesión nuevamente.")
                return []

            # ✅ If PDF Download is Successful
            if response.status_code == 200:
                logger.info(f"PDF ready for Ticket ID: {pdf_ticket_id}.")
                # dispatcher.utter_message(text="Tu PDF está listo para descargar", user_friendly_url)
                dispatcher.utter_message(
                text=f"Tu PDF está listo para descargar.\n {user_friendly_url}")
       
                # dispatcher.utter_message(json_message={"redirect": user_friendly_url})

            # ⚠️ Handle Other Errors (4xx, 5xx)
            else:
                logger.error(f"PDF download failed. Status: {response.status_code}, Response: {response.text}")
                dispatcher.utter_message(text="No se pudo descargar el PDF. Intente de nuevo más tarde.")

        except requests.exceptions.Timeout:
            logger.error("PDF download request timed out.")
            dispatcher.utter_message(text="La descarga del PDF ha expirado. Inténtelo nuevamente.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error during PDF download: {e}")
            dispatcher.utter_message(text="Ocurrió un error al descargar el PDF. Por favor, inténtelo más tarde.")

        return []

############################inquiry data points collection###############################
class ActionSendInquiry(Action):
    def name(self) -> str:
        return "action_send_inquiry_datapoints"

    async def run(self, dispatcher, tracker, domain):
        # Retrieve the API base URL from environment variables
        if not USER_BASE_URL:
            logger.error("USER_BASE_URL is missing in environment variables.")
            return []
        
        # Construct the complete API endpoint URL
        url = f"{USER_BASE_URL}/api/v1/inquiry"

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
        if not INQUIRY_TOKEN:
            logger.error("INQUIRY_TOKEN is missing in environment variables.")
            return []

        # Construct the JSON payload with retrieved values, ensuring defaults for missing data
        payload = json.dumps({
            "senderId": sender_id,
            "userName": user_name if user_name else "Unknown",  # Use correct slot name
            "inquiryResolved": inquiry_resolved if inquiry_resolved else "False",  # Ensure boolean format
            "inquiryRedirect": inquiry_redirect if inquiry_redirect else "False",  # Ensure boolean format
            "inquiryChannel": "WhatsApp", #inquiry_channel if inquiry_channel else "",
            "easeOfFinding": ease_of_finding.split(" ")[0] if ease_of_finding else "",  # Extract numeric part only
            "formatsProvided": formats_provided.split(" ")[0] if formats_provided else "",
            "clarityResponse": clarity_response.split(" ")[0] if clarity_response else "",
            "attentionTime": attention_time.split(" ")[0] if attention_time else ""
        })

        # Define the required headers for API authentication and content type
        headers = {
            'X-API-KEY': INQUIRY_TOKEN,  # API key retrieved from environment variable INQUIRY_TOKEN
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


############first claim redirect#########################
class ActionRedirectFileFirstClaim(Action):
    def name(self) -> Text:
        return "action_redirect_file_first_claim"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Logging
        logger.info("🔄 Executing action: action_redirect_file_first_claim")

        # Check if FRONT_END_URL is set properly
        if not FRONT_END_URL or FRONT_END_URL == "Not Defined":
            logger.critical("❌ FRONT_END_URL is missing or not defined!")
            dispatcher.utter_message(text="⚠️ No se encontró el enlace del portal. Inténtelo más tarde o contacte soporte.")
            return []

        logger.debug(f"✅ Sending user to the claim portal: {FRONT_END_URL}\n")

        dispatcher.utter_message(
            text=f"📌 Para presentar su reclamo visite el siguiente enlace:\n{FRONT_END_URL}"
        )

        return []
