from fastapi import FastAPI, Request
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
import os

server = FastAPI()

model = None

if os.path.exists("model.joblib"):
  model = joblib.load("model.joblib")

@server.post("/inference-api/predict")
async def predict(request: Request):
  if model is None:
    return {"error": "Model not trained yet. Please train the model first."}

  data = await request.json()

  input_data = pd.DataFrame({
    'exercise': [data.get("exercise")],
    'code': [data.get("code")]
  })

  prediction = model.predict(input_data)[0]

  return {"prediction": prediction}

@server.post("/inference-api/train")
async def train(request: Request):
  data = await request.json()

  training_data = pd.DataFrame(data)

  if 'exercise' not in training_data.columns or 'code' not in training_data.columns:
    return {"error": "Invalid input data. Expected columns: 'exercise', 'code'."}

  preprocessor = ColumnTransformer(
    transformers=[
      ('code', CountVectorizer(ngram_range=(1, 3)), 'code')
    ]
  )

  pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
  ])

  X = training_data[['code']]
  y = training_data['exercise']

  pipeline.fit(X, y)

  joblib.dump(pipeline, 'model.joblib')

  global model
  model = pipeline

  return {"status": "Model trained successfully"}