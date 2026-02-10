import random

import albumentations as A
from albumentations import ToTensorV2
import hydra.utils
import numpy as np
from omegaconf import DictConfig
import torch
from torch.utils.data import DataLoader, WeightedRandomSampler

from skin_disease_recognition.data.dataset import SkinDataset


def seed_worker(worker_id):
    worker_seed = torch.initial_seed() % 2**32
    np.random.seed(worker_seed)
    random.seed(worker_seed)


def get_transforms(cfg: DictConfig, stage='train'):
    image_size = cfg.data.image_size
    if stage == 'train':
        return A.Compose(
            [
                A.Resize(image_size, image_size),
                A.HorizontalFlip(),
                A.VerticalFlip(),
                A.Rotate(limit=30, p=0.7),
                A.ColorJitter(
                    brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.3
                ),
                A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
                ToTensorV2(),
            ]
        )
    elif stage == 'test':
        return A.Compose(
            [
                A.Resize(image_size, image_size),
                A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
                ToTensorV2(),
            ]
        )
    raise ValueError('Wrong stage has been specified')


def make_loaders(cfg: DictConfig):
    train_transform = get_transforms(cfg, 'train')
    test_transform = get_transforms(cfg, 'test')

    train_dataset = SkinDataset(
        hydra.utils.to_absolute_path(cfg.data.train_path), train_transform
    )
    test_dataset = SkinDataset(
        hydra.utils.to_absolute_path(cfg.data.test_path), test_transform
    )

    class_weights = 1.0 / np.bincount(train_dataset.targets)
    sample_weights = class_weights[train_dataset.targets]

    g = torch.Generator()
    g.manual_seed(cfg.seed)

    sampler = WeightedRandomSampler(
        sample_weights.tolist(), num_samples=len(train_dataset), generator=g
    )

    train_loader = DataLoader(
        dataset=train_dataset,
        batch_size=cfg.data.batch_size,
        num_workers=cfg.data.num_workers,
        pin_memory=True,
        sampler=sampler,
        shuffle=False,
        generator=g,
        worker_init_fn=seed_worker,
    )
    test_loader = DataLoader(
        dataset=test_dataset,
        batch_size=cfg.data.batch_size,
        num_workers=cfg.data.num_workers,
        pin_memory=True,
        generator=g,
        worker_init_fn=seed_worker,
    )

    return train_loader, test_loader
