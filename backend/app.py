from flask import jsonify
import config

app = config.connex_app
app.add_api(config.basedir / "swagger.yml")


@app.route("/")
def home():
    return jsonify({"message": "Привет от Flask!"})


if __name__ == "__main__":
    app.run()
