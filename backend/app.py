from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Разрешаем запросы с фронтенда

@app.route('/', methods=['GET'])
def hello():
    return jsonify({"message": "Привет от Flask!"})

if __name__ == '__main__':
    app.run(debug=True)
