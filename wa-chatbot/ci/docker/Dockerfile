# Use a minimal Python Alpine image
FROM python:3.8

# Install dependencies for Rasa and build tools for compiling additional Python dependencies
#RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev python3-dev make

# Set working directory
WORKDIR /app

# Copy Rasa project files and requirements.txt into the container
COPY . /app

# Install dependencies from requirements.txt
# It should include rasa and any other necessary packages like openai
#RUN pip install --no-cache-dir -r /app/requirements.txt
RUN pip install "packaging==24.2" "langchain-openai==0.1.25" "langchain-community==0.2.18" --no-cache-dir
RUN pip install --default-timeout=120 "Flask==3.0.3" "packaging==20.0" "dask==2022.10.2" "faiss-cpu==1.8.0.post1" "marshmallow==3.22.0" "matplotlib==3.5.3" "rasa==3.6.20" "openai==1.56.2" "python-dotenv==1.0.1" "chardet==5.2.0" "Flask-Cors==5.0.0" --no-cache-dir
RUN pip install "numpy==1.23.5" "pandas==2.0.3" "scikit-learn==1.1.3" "joblib==1.2.0" "openpyxl==3.1.5" --no-cache-dir
RUN pip install fsspec==2024.6.0 --no-cache-dir

# Expose ports for Rasa server (5005) and Action server (5055)
EXPOSE 5005 5055 5000

# Create an entrypoint script to start both Rasa server and action server
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
