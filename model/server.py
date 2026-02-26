from flask import Flask
from flask_cors import CORS
from translate import translate

app = Flask(__name__)
CORS(app, resources={'/*': {"origins": ["http://localhost:1234", "https://prekladac.rusyn.it"]}})

@app.route("/translate/rue/sk/<text>")
def translate_rue_sk(text):
    translation = translate(text, "models/rusyn-slovak.tar")[0]
    return translation

@app.route("/translate/sk/rue/<text>")
def translate_sk_rue(text):
    translation = translate(text, "models/slovak-rusyn.tar")[0]
    return translation
