import io

import cv2
from PIL import Image
import pytest


def test_predict_returns_200(test_client, sample_image_bytes):
    response = test_client.post(
        '/predict',
        files={'file': ('test.jpg', sample_image_bytes, 'image/jpeg')},
    )
    assert response.status_code == 200


def test_predict_returns_predictions(test_client, sample_image_bytes):
    response = test_client.post(
        '/predict',
        files={'file': ('test.jpg', sample_image_bytes, 'image/jpeg')},
    )
    data = response.json()

    assert 'predictions' in data
    assert isinstance(data['predictions'], dict)


def test_predict_all_classes(test_client, sample_image_bytes, sample_classes):
    response = test_client.post(
        '/predict',
        files={'file': ('test.jpg', sample_image_bytes, 'image/jpeg')},
    )
    predictions = response.json()['predictions']

    assert len(predictions) == len(sample_classes)
    for cls in sample_classes:
        assert cls in predictions


def test_predict_probabilities_sum(test_client, sample_image_bytes):
    response = test_client.post(
        '/predict',
        files={'file': ('test.jpg', sample_image_bytes, 'image/jpeg')},
    )
    predictions = response.json()['predictions']
    total = sum(predictions.values())

    assert abs(total - 1.0) < 0.01


def test_predict_probabilities_range(test_client, sample_image_bytes):
    response = test_client.post(
        '/predict',
        files={'file': ('test.jpg', sample_image_bytes, 'image/jpeg')},
    )
    predictions = response.json()['predictions']

    for prob in predictions.values():
        assert 0.0 <= prob <= 1.0


def test_predict_png(test_client):
    img = Image.new('RGB', (224, 224), color=(100, 100, 100))
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    response = test_client.post(
        '/predict',
        files={'file': ('test.png', buffer.getvalue(), 'image/png')},
    )
    assert response.status_code == 200


def test_predict_different_sizes(test_client):
    for size in [(100, 100), (500, 300), (1000, 800)]:
        img = Image.new('RGB', size, color=(128, 128, 128))
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        buffer.seek(0)

        response = test_client.post(
            '/predict',
            files={'file': ('test.jpg', buffer.getvalue(), 'image/jpeg')},
        )
        assert response.status_code == 200


def test_info_returns_200(test_client):
    response = test_client.get('/info')
    assert response.status_code == 200


def test_info_model_name(test_client):
    response = test_client.get('/info')
    data = response.json()

    assert 'model_name' in data
    assert isinstance(data['model_name'], str)
    assert len(data['model_name']) > 0


def test_info_model_version(test_client):
    response = test_client.get('/info')
    data = response.json()

    assert 'model_version' in data


def test_info_matches_metadata(test_client, sample_metadata):
    response = test_client.get('/info')
    data = response.json()

    assert data['model_name'] == sample_metadata['model_name']
    assert data['model_version'] == sample_metadata['version']


def test_report_returns_200(test_client):
    response = test_client.get('/report')
    assert response.status_code == 200


def test_report_returns_dict(test_client):
    response = test_client.get('/report')
    assert isinstance(response.json(), dict)


def test_report_has_accuracy(test_client):
    response = test_client.get('/report')
    data = response.json()

    assert 'accuracy' in data
    assert isinstance(data['accuracy'], (int, float))


def test_report_has_macro_avg(test_client):
    response = test_client.get('/report')
    data = response.json()

    assert 'macro avg' in data
    assert 'precision' in data['macro avg']
    assert 'recall' in data['macro avg']
    assert 'f1-score' in data['macro avg']


def test_report_has_weighted_avg(test_client):
    response = test_client.get('/report')
    data = response.json()

    assert 'weighted avg' in data


def test_report_metrics_valid_range(test_client):
    response = test_client.get('/report')
    macro = response.json().get('macro avg', {})

    for metric in ['precision', 'recall', 'f1-score']:
        if metric in macro:
            assert 0.0 <= macro[metric] <= 1.0


def test_predict_no_file_422(test_client):
    response = test_client.post('/predict')
    assert response.status_code == 422


def test_predict_empty_file_raises(test_client):
    with pytest.raises((TypeError, cv2.error)):
        test_client.post(
            '/predict',
            files={'file': ('test.jpg', b'', 'image/jpeg')},
        )


def test_nonexistent_endpoint_404(test_client):
    response = test_client.get('/nonexistent')
    assert response.status_code == 404


def test_multiple_requests(test_client, sample_image_bytes):
    for _ in range(5):
        response = test_client.post(
            '/predict',
            files={'file': ('test.jpg', sample_image_bytes, 'image/jpeg')},
        )
        assert response.status_code == 200


def test_mixed_endpoints(test_client, sample_image_bytes):
    assert test_client.get('/info').status_code == 200
    assert test_client.get('/report').status_code == 200
    assert (
        test_client.post(
            '/predict',
            files={'file': ('test.jpg', sample_image_bytes, 'image/jpeg')},
        ).status_code
        == 200
    )
