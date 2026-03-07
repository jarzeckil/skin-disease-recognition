import io
import json
from pathlib import Path
import tempfile
from unittest.mock import patch

import numpy as np
from PIL import Image
import pytest
import torch
import torch.nn as nn


@pytest.fixture
def sample_image_bytes():
    img = Image.new('RGB', (224, 224), color=(128, 64, 192))
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return buffer.getvalue()


@pytest.fixture
def sample_image_numpy():
    return np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)


@pytest.fixture
def sample_classes():
    return ['Acne', 'Eczema', 'Psoriasis', 'Melanoma', 'Benign_tumors']


@pytest.fixture
def sample_metadata():
    return {
        'model_name': 'EFFICIENTNET-B0',
        'version': 1,
        'image_size': 224,
    }


@pytest.fixture
def sample_report():
    return {
        'Acne': {
            'precision': 0.897,
            'recall': 0.938,
            'f1-score': 0.917,
            'support': 65.0,
        },
        'Eczema': {
            'precision': 0.766,
            'recall': 0.759,
            'f1-score': 0.762,
            'support': 112.0,
        },
        'accuracy': 0.806,
        'macro avg': {
            'precision': 0.783,
            'recall': 0.783,
            'f1-score': 0.781,
            'support': 177.0,
        },
        'weighted avg': {
            'precision': 0.808,
            'recall': 0.806,
            'f1-score': 0.805,
            'support': 177.0,
        },
    }


class MockModel(nn.Module):
    def __init__(self, num_classes=5):
        super().__init__()
        self.num_classes = num_classes

    def forward(self, x):
        batch_size = x.shape[0]
        return torch.randn(batch_size, self.num_classes)


@pytest.fixture
def mock_model(sample_classes):
    model = MockModel(num_classes=len(sample_classes))
    model.eval()
    return model


@pytest.fixture
def temp_model_dir(sample_classes, sample_metadata, sample_report, mock_model):
    with tempfile.TemporaryDirectory() as tmpdir:
        model_path = Path(tmpdir) / 'test_model'
        model_path.mkdir()

        torch.save(mock_model, model_path / 'model.pth')

        with open(model_path / 'model_data.json', 'w') as f:
            json.dump(sample_metadata, f)

        with open(model_path / 'class_names.txt', 'w') as f:
            f.write('\n'.join(sample_classes))

        with open(model_path / 'classification_report.json', 'w') as f:
            json.dump(sample_report, f)

        yield model_path


@pytest.fixture
def temp_image_folder():
    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)
        for cls in ['class_a', 'class_b', 'class_c']:
            cls_dir = root / cls
            cls_dir.mkdir()
            for i in range(3):
                img = Image.new('RGB', (100, 100), color=(i * 50, i * 50, i * 50))
                img.save(cls_dir / f'image_{i}.jpg')
        yield root


@pytest.fixture
def test_client(temp_model_dir):
    from fastapi.testclient import TestClient

    from skin_disease_recognition.serving.app import app

    model_name = temp_model_dir.name
    model_storage = temp_model_dir.parent

    with (
        patch('skin_disease_recognition.serving.app.MODEL_DIR', model_storage),
        patch('skin_disease_recognition.serving.app.ACTIVE_MODEL', model_name),
        patch('skin_disease_recognition.serving.app.ACTIVE_DEVICE', 'cpu'),
    ):
        with TestClient(app) as client:
            yield client
