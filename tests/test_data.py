import numpy as np
import pytest
import torch

from skin_disease_recognition.data.dataset import SkinDataset
from skin_disease_recognition.data.factory import get_transforms


def test_dataset_init(temp_image_folder):
    dataset = SkinDataset(root_dir=str(temp_image_folder))

    assert len(dataset) == 9
    assert len(dataset.classes) == 3
    assert 'class_a' in dataset.classes


def test_dataset_getitem(temp_image_folder):
    dataset = SkinDataset(root_dir=str(temp_image_folder))
    image, label = dataset[0]

    assert isinstance(image, np.ndarray)
    assert image.ndim == 3
    assert isinstance(label, int)
    assert 0 <= label < len(dataset.classes)


def test_dataset_with_transform(temp_image_folder):
    import albumentations as A
    from albumentations.pytorch import ToTensorV2

    transform = A.Compose(
        [
            A.Resize(64, 64),
            A.Normalize(mean=(0.5, 0.5, 0.5), std=(0.5, 0.5, 0.5)),
            ToTensorV2(),
        ]
    )
    dataset = SkinDataset(root_dir=str(temp_image_folder), transform=transform)
    image, label = dataset[0]

    assert isinstance(image, torch.Tensor)
    assert image.shape == (3, 64, 64)


def test_dataset_targets(temp_image_folder):
    dataset = SkinDataset(root_dir=str(temp_image_folder))

    assert len(dataset.targets) == 9
    counts = {}
    for t in dataset.targets:
        counts[t] = counts.get(t, 0) + 1
    assert all(c == 3 for c in counts.values())


def test_dataset_invalid_path():
    with pytest.raises(FileNotFoundError):
        SkinDataset(root_dir='/nonexistent/path')


def test_train_transforms(mock_hydra_cfg):
    transform = get_transforms(mock_hydra_cfg, stage='train')
    sample = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    result = transform(image=sample)

    assert isinstance(result['image'], torch.Tensor)
    assert result['image'].shape == (3, 224, 224)


def test_test_transforms(mock_hydra_cfg):
    transform = get_transforms(mock_hydra_cfg, stage='test')
    sample = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    result = transform(image=sample)

    assert isinstance(result['image'], torch.Tensor)
    assert result['image'].shape == (3, 224, 224)


def test_invalid_stage_raises(mock_hydra_cfg):
    with pytest.raises(ValueError, match='Wrong stage'):
        get_transforms(mock_hydra_cfg, stage='invalid')


def test_train_has_augmentation(mock_hydra_cfg):
    transform = get_transforms(mock_hydra_cfg, stage='train')
    names = [t.__class__.__name__ for t in transform.transforms]

    assert 'HorizontalFlip' in names
    assert 'Resize' in names


def test_test_no_augmentation(mock_hydra_cfg):
    transform = get_transforms(mock_hydra_cfg, stage='test')
    names = [t.__class__.__name__ for t in transform.transforms]

    assert 'HorizontalFlip' not in names
    assert 'Rotate' not in names
    assert 'Resize' in names


@pytest.fixture
def mock_hydra_cfg():
    from unittest.mock import MagicMock

    cfg = MagicMock()
    cfg.seed = 42
    cfg.model.image_size = 224
    cfg.data.batch_size = 4
    cfg.data.num_workers = 0
    return cfg
