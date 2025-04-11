from flask import jsonify
from flask_cors import CORS
import os
import config

app = config.connex_app
app.add_api(config.basedir / "swagger.yml")

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "").split(",")

CORS(
    app.app,
    resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
    expose_headers=["X-Total-Count"],
    supports_credentials=True
)


@app.route("/")
def home():
    return jsonify({"message": "Привет от Flask!"})


if __name__ == "__main__":
    app.run()