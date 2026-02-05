import albumentations as A
import numpy as np
from albumentations import ToTensorV2
from omegaconf import DictConfig
from torch.utils.data import DataLoader, WeightedRandomSampler

from skin_disease_recognition.data.dataset import SkinDataset


def get_transforms(cfg: DictConfig, stage = 'train'):
    image_size = cfg.data.image_size
    if stage == 'train':
        return A.Compose([
            A.Resize(image_size, image_size),
            A.HorizontalFlip(),
            A.VerticalFlip(),
            A.Rotate(limit=30, p=0.7),
            A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.3),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2(),
        ])
    elif stage == 'test':
        return A.Compose([
            A.Resize(image_size, image_size),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2(),
        ])
    raise ValueError('Wrong stage has been specified')


def make_loaders(cfg: DictConfig):
    train_transform = get_transforms(cfg, 'train')
    test_transform = get_transforms(cfg, 'test')

    train_dataset = SkinDataset(cfg.data.train_path, train_transform)
    test_dataset = SkinDataset(cfg.data.test_path / 'test', test_transform)

    class_weights = 1.0 / np.bincount(train_dataset.targets)
    sample_weights = class_weights[train_dataset.targets]

    sampler = WeightedRandomSampler(sample_weights.tolist(), num_samples=len(train_dataset))


    train_loader = DataLoader(dataset=train_dataset, batch_size=cfg.data.batch_size, num_workers=cfg.data.num_workers, pin_memory=True,
                              sampler=sampler)
    test_loader = DataLoader(dataset=test_dataset, batch_size=cfg.data.batch_size, num_workers=cfg.data.num_workers, pin_memory=True)

    return train_loader, test_loader