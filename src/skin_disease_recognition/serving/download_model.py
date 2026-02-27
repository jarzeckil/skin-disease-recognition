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

model = mlflow.pytorch.load_model(f'models:/{MODEL_NAME}/{latest_version_info.version}')
model_data = ast.literal_eval(
    client.get_run(run_id).data.to_dictionary()['params']['model']
)

model_name = model_data['model_name']

path = DEST_DIR / (model_name + f'v{latest_version_info.version}')
os.mkdir(path)

torch.save(model, path / 'model.pth')
print(f'Model saved to {path / "model.pth"}')

model_data['version'] = latest_version_info.version
with open(path / 'model_data.json', 'w') as f:
    json.dump(model_data, f)

mlflow.artifacts.download_artifacts(
    run_id=run_id, artifact_path='classification_report.json', dst_path=path
)
mlflow.artifacts.download_artifacts(
    run_id=run_id, artifact_path='class_names.txt', dst_path=path
)

with open(path / 'classification_report.json') as f:
    classif_report = json.load(f)
metrics = classif_report['macro avg']
with open(path / 'metrics.json', 'w') as f:
    json.dump(metrics, f)

print('Export complete.')
