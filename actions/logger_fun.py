import logging
import os
from datetime import datetime

# Define the directory and log file path
LOG_DIR = "chatbot_logs"
LOG_FILE_NAME = "chatbot.log"

# Ensure that the log directory exists
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE_PATH = os.path.join(LOG_DIR, LOG_FILE_NAME)

# Set up the logger with FileHandler
def setup_logger(name="my_logger"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:
        # Attach FileHandler to send logs to a file
        handler = logging.FileHandler(LOG_FILE_PATH)
        handler.setLevel(logging.DEBUG)

        # Define the log message format
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)

        # Add the handler to the logger
        logger.addHandler(handler)

    return logger