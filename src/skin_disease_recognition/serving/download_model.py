import ast
import json
import os

import mlflow
from mlflow.tracking import MlflowClient
import torch

from skin_disease_recognition.core.config import MODEL_DIR

MODEL_NAME = 'SkinDiseaseModel'
DEST_DIR = MODEL_DIR

client = MlflowClient()

latest_versions = client.get_latest_versions(MODEL_NAME)
if not latest_versions:
    raise Exception(f'No registered model found for name: {MODEL_NAME}')

latest_version_info = sorted(latest_versions, key=lambda x: x.version, reverse=True)[0]
run_id = latest_version_info.run_id

print(
    f'Exporting artifacts from Run ID: {run_id} '
    f'(Model Version: {latest_version_info.version})'
)

model = mlflow.pyfunc.load_model(
    f'models:/{MODEL_NAME}/{latest_version_info.version}'
).get_raw_model()
model_data = ast.literal_eval(
    client.get_run(run_id).data.to_dictionary()['params']['model']
)
metrics = client.get_run(run_id).data.to_dictionary()['metrics']

model_name = model_data['model_name']

os.mkdir(DEST_DIR / model_name)

torch.save(model, DEST_DIR / model_name / 'model.pth')
print(f'Model saved to {DEST_DIR / model_name / "model.pth"}')

with open(DEST_DIR / model_name / 'model_data.json', 'w') as f:
    json.dump(model_data, f)
with open(DEST_DIR / model_name / 'metrics.json', 'w') as f:
    json.dump(metrics, f)

# TODO download class names from mlflow
# TODO download classification report
# TODO pull model version

print('Export complete.')
