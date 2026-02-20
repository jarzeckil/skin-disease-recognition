import logging
import os.path

import hydra
from omegaconf import DictConfig
import torch.nn
from torch.optim.lr_scheduler import ReduceLROnPlateau
import torchvision.models

from skin_disease_recognition.config import PROJECT_ROOT
from skin_disease_recognition.data.loaders import make_loaders
from skin_disease_recognition.modeling.engine import Trainer
from skin_disease_recognition.utils.seeding import seed_everything

logger = logging.getLogger(__name__)


@hydra.main(
    config_path=os.path.join(PROJECT_ROOT, 'conf'),
    config_name='config',
    version_base='1.2',
)
def train(cfg: DictConfig):
    seed_everything(cfg)

    logger.info('Creating data loaders')
    train_loader, test_loader = make_loaders(cfg)

    logger.info('Instantiating objects')
    model: torch.nn.Module = hydra.utils.instantiate(cfg.model.estimator)

    if cfg.model.pretrained and cfg.freeze_layers:
        logger.info('Freezing parameters')
        for param in model.parameters():
            param.requires_grad = False

    if cfg.model.model_type == 'resnet':
        model: torchvision.models.ResNet
        model.fc = torch.nn.Linear(
            in_features=model.fc.in_features, out_features=cfg.data.num_classes
        )
        backbone_params = [
            param for name, param in model.named_parameters() if 'fc' not in name
        ]
        head_params = model.fc.parameters()

        optim_partial = hydra.utils.instantiate(cfg.optimizer.adam)
        base_lr = cfg.optimizer.adam.lr
    elif cfg.model.model_type == 'efficientnet':
        model: torchvision.models.EfficientNet
        model.classifier[1] = torch.nn.Linear(
            in_features=model.classifier[1].in_features,
            out_features=cfg.data.num_classes,
        )
        backbone_params = [
            param
            for name, param in model.named_parameters()
            if 'classifier' not in name
        ]
        head_params = model.classifier.parameters()

        optim_partial = hydra.utils.instantiate(cfg.optimizer.adamw)
        base_lr = cfg.optimizer.adamw.lr
    else:
        raise ValueError('Model type unknown')

    model = model.to(device=cfg.device)

    loss_fn = hydra.utils.instantiate(cfg.loss_function)
    optim = optim_partial(
        [
            {'params': backbone_params, 'lr': base_lr * 0.1},
            {'params': head_params},
        ]
    )
    scheduler = ReduceLROnPlateau(
        optimizer=optim,
        mode='min',
        patience=cfg.scheduler.patience,
        factor=cfg.scheduler.factor,
    )

    logger.info('Creating trainer')
    trainer = Trainer(
        model=model,
        train_loader=train_loader,
        test_loader=test_loader,
        optimizer=optim,
        loss_fn=loss_fn,
        device=cfg.device,
        num_classes=cfg.data.num_classes,
        scheduler=scheduler,
    )
    logger.info('Starting training')
    trainer.train(
        max_epochs=cfg.max_epochs,
        experiment_name=cfg.experiment_name,
        run_name=cfg.model.model_name,
        cfg=cfg,
    )


if __name__ == '__main__':
    train()
