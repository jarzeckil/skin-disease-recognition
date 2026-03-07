import io
from unittest.mock import AsyncMock

import numpy as np
from PIL import Image
import pytest
import torch

from skin_disease_recognition.serving.preprocessing import (
    get_data_from_file,
    make_transform,
)


@pytest.mark.asyncio
async def test_get_data_returns_numpy(sample_image_bytes):
    mock_file = AsyncMock()
    mock_file.read.return_value = sample_image_bytes

    result = await get_data_from_file(mock_file)

    assert isinstance(result, np.ndarray)
    assert result.ndim == 3


@pytest.mark.asyncio
async def test_get_data_returns_rgb(sample_image_bytes):
    mock_file = AsyncMock()
    mock_file.read.return_value = sample_image_bytes

    result = await get_data_from_file(mock_file)

    assert result.shape[2] == 3


@pytest.mark.asyncio
async def test_get_data_preserves_dimensions():
    img = Image.new('RGB', (300, 200), color=(100, 150, 200))
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)

    mock_file = AsyncMock()
    mock_file.read.return_value = buffer.getvalue()

    result = await get_data_from_file(mock_file)

    assert result.shape[0] == 200
    assert result.shape[1] == 300


@pytest.mark.asyncio
async def test_get_data_handles_png():
    img = Image.new('RGB', (100, 100), color=(50, 100, 150))
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    mock_file = AsyncMock()
    mock_file.read.return_value = buffer.getvalue()

    result = await get_data_from_file(mock_file)

    assert result.shape == (100, 100, 3)


def test_make_transform_resize(sample_image_numpy):
    transform = make_transform(224)
    result = transform(image=sample_image_numpy)

    assert result['image'].shape == (3, 224, 224)


def test_make_transform_different_sizes(sample_image_numpy):
    for size in [224, 300, 384]:
        transform = make_transform(size)
        result = transform(image=sample_image_numpy)
        assert result['image'].shape == (3, size, size)


def test_make_transform_returns_tensor(sample_image_numpy):
    transform = make_transform(224)
    result = transform(image=sample_image_numpy)

    assert isinstance(result['image'], torch.Tensor)


def test_make_transform_normalizes(sample_image_numpy):
    transform = make_transform(224)
    result = transform(image=sample_image_numpy)

    assert result['image'].min() >= -3.0
    assert result['image'].max() <= 3.0
