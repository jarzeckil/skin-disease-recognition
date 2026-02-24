from contextlib import asynccontextmanager
import json
import logging
import os.path

import albumentations as A
from fastapi import FastAPI, UploadFile, status
import torch
import torch.nn as nn
from torch.nn.functional import softmax

from skin_disease_recognition.core.config import ACTIVE_DEVICE, ACTIVE_MODEL, MODEL_DIR
from skin_disease_recognition.serving.preprocessing import (
    get_data_from_file,
    make_transform,
)

logger = logging.getLogger(__name__)

artifacts = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    device = ACTIVE_DEVICE
    if device is None:
        raise ValueError('Active device name not found in .env')

    model_storage = MODEL_DIR
    model_name: str = ACTIVE_MODEL
    if model_name is None:
        raise ValueError('Active model name not found in .env')
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
    except FileNotFoundError as e:
        raise ValueError('Model not found') from e

    try:
        with open(metrics_path) as f:
            metrics = json.load(f)
        artifacts['metrics'] = metrics
    except FileNotFoundError as e:
        raise ValueError('Metrics not found') from e

    try:
        with open(data_path) as f:
            data = json.load(f)
        artifacts['metadata'] = data
    except FileNotFoundError as e:
        raise ValueError('Metadata not found') from e

    transform = make_transform(artifacts['metadata']['image_size'])
    artifacts['transform'] = transform

    yield

    artifacts.clear()


app = FastAPI(lifespan=lifespan)


@app.post('/predict', status_code=status.HTTP_200_OK)
async def predict(file: UploadFile):
    transform: A.Compose = artifacts['transform']
    model: nn.Module = artifacts['model']

    mat = await get_data_from_file(file)
    data: torch.Tensor = transform(image=mat)['image']
    data = data.unsqueeze(0)

    with torch.no_grad():
        pred = model(data)
        soft = softmax(pred, dim=1)

    return {'predictions': soft.tolist()[0]}
