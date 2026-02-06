import os.path

import hydra
from omegaconf import DictConfig

from skin_disease_recognition.config import PROJECT_ROOT
from skin_disease_recognition.data.loaders import make_loaders


@hydra.main(
    config_path=os.path.join(PROJECT_ROOT, 'conf'),
    config_name='config',
    version_base='1.2',
)
def train(cfg: DictConfig):
    train_loader, test_loader = make_loaders(cfg)


if __name__ == '__main__':
    train()
