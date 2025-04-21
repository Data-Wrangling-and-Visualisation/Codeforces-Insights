"""
Flask Application Configuration with Connexion and CORS

This module configures a RESTful API service using Flask, Connexion (OpenAPI/Swagger),
and CORS handling. It includes a simple health check endpoint and security configurations.
"""

from flask import jsonify
from flask_cors import CORS  # For Cross-Origin Resource Sharing protection
import os
import config

# Initialize Connexion app with OpenAPI/Swagger specification
app = config.connex_app  # Get pre-configured Connexion app from config

# CORS Security Configuration
# Extract allowed origins from environment variable (comma-separated list)
# Default is empty string which results in no allowed origins
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "").split(",")

# Configure Cross-Origin Resource Sharing (CORS) policies
CORS(
    app.app,  # Apply to underlying Flask app (Connexion wraps Flask)
    resources={
        r"/api/*": {  # Apply CORS only to API endpoints
            "origins": ["*"]  # Whitelist of allowed domains
        }
    },
    expose_headers=["X-Total-Count"],  # Custom headers exposed to clients
    supports_credentials=True  # Allow cookies and authentication headers
)


@app.app.route("/")
def home():
    """Health check endpoint providing basic service information

    Returns:
        JSON: Simple greeting message in Russian
    """
    return jsonify({"message": "Hello from Flask!"})


if __name__ == "__main__":
    # Запускаем только при старте приложения, не на каждом reload
    app.add_api(config.basedir / "swagger.yml")
    app.run(host="0.0.0.0", port=8000)
