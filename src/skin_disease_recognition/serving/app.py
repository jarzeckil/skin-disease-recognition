from contextlib import asynccontextmanager
import json
import logging
import os.path

from fastapi import FastAPI, UploadFile, status
import torch
import torch.nn as nn

from skin_disease_recognition.core.config import MODEL_DIR

logger = logging.getLogger(__name__)

artifacts = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    device = 'cpu'

    model_storage = MODEL_DIR
    model_name = 'efficientnet_b0_pretrained'
    model_folder = os.path.join(model_storage, model_name)

    model_path = os.path.join(model_folder, 'model.pth')
    metrics_path = os.path.join(model_folder, 'metrics.json')
    data_path = os.path.join(model_folder, 'model_data.json')

    try:
        model: nn.Module = torch.load(
            model_path, weights_only=False, map_location=torch.device(device)
        )
        model.eval()
        artifacts['model'] = model
        logger.info('Model loaded successfully')
    except FileNotFoundError:
        logger.error('Model not found')

    try:
        with open(metrics_path) as f:
            metrics = json.load(f)
        artifacts['metrics'] = metrics
    except FileNotFoundError:
        logger.error('Metrics not found')

    try:
        with open(data_path) as f:
            data = json.load(f)
        artifacts['metadata'] = data
    except FileNotFoundError:
        logger.error('Metadata not found')

    yield

    artifacts.clear()


app = FastAPI(lifespan=lifespan)


@app.post('/predict', status_code=status.HTTP_200_OK)
async def predict(file: UploadFile):
    pass
