"""
Database Configuration Module

Initializes database connection and ORM configuration for a Flask/Connexion application
using SQLAlchemy with PostgreSQL. Handles environment-based configuration and
secure credential management.
"""

# Third-party imports
from flask_sqlalchemy import SQLAlchemy  # SQLAlchemy ORM integration for Flask
from dotenv import load_dotenv  # Environment variable management
import connexion  # REST API framework with Swagger/OpenAPI support
import pathlib  # Modern path handling
import os  # OS interaction and environment variables

# Environment Configuration
load_dotenv()  # Load variables from .env file (dev environment only - not for production)

# Secure Credential Handling (never hardcode credentials)
# Environment variables are used to prevent secrets from being checked into version control
username = os.getenv("DB_USER")  # Database username
password = os.getenv("DB_PASSWORD")  # Database password (should be strong and encrypted in prod)
host = os.getenv("DB_HOST")  # Database server hostname/IP
port = os.getenv("DB_PORT")  # Database port (default PostgreSQL: 5432)
database = os.getenv("DB_NAME")  # Database name

# Construct secure database connection URL
# Format: postgresql://user:password@host:port/database
connection_url = f"postgresql://{username}:{password}@{host}:{port}/{database}"

# API Configuration
basedir = pathlib.Path(__file__).parent.resolve()  # Get absolute path to current directory
connex_app = connexion.App(__name__, specification_dir=basedir)  # Initialize Connexion with OpenAPI dir

# Flask Application Configuration
app = connex_app.app  # Get underlying Flask application instance

# Database ORM Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = connection_url  # Set database connection string
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # Disable modification tracking (performance optimization)

# Initialize SQLAlchemy ORM
# This creates the database connection pool and ties SQLAlchemy to the Flask app
db = SQLAlchemy(app)
