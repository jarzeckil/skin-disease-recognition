import logging
import os
from typing import Any, cast

import mlflow
import mlflow.pytorch
import numpy as np
from omegaconf import DictConfig, OmegaConf
import torch
from torch import Tensor, nn
from torch.optim import Optimizer
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader
import torchmetrics
from torchmetrics import Accuracy, F1Score, Precision, Recall

logger = logging.getLogger(__name__)


class Trainer:
    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        test_loader: DataLoader,
        optimizer: Optimizer,
        scheduler: ReduceLROnPlateau,
        loss_fn: nn.Module,
        device: str,
        num_classes,
    ):
        self.model = model
        self.train_loader = train_loader
        self.test_loader = test_loader
        self.optimizer = optimizer
        self.loss_fn = loss_fn
        self.device = device
        self.scheduler = scheduler

        self.metrics = torchmetrics.MetricCollection(
            {
                'accuracy': Accuracy(task='multiclass', num_classes=num_classes),
                'precision': Precision(
                    task='multiclass', num_classes=num_classes, average='macro'
                ),
                'recall': Recall(
                    task='multiclass', num_classes=num_classes, average='macro'
                ),
                'f1': F1Score(
                    task='multiclass', num_classes=num_classes, average='macro'
                ),
            }
        ).to(device=self.device)

    def train_one_epoch(self, epoch_index):
        self.model.train()
        losses = []
        n = len(self.train_loader)
        for i, data in enumerate(self.train_loader):
            images: Tensor
            labels: Tensor
            images, labels = data

            images = images.to(device=self.device)
            labels = labels.to(device=self.device)

            self.optimizer.zero_grad()

            pred = self.model(images)

            loss = self.loss_fn(pred, labels)
            losses.append(loss.item())
            loss.backward()

            self.optimizer.step()

            if i % 100 == 0:
                logger.info(f'Epoch {epoch_index}, Batch {i}/{n}')
        avg_loss = np.mean(losses)
        return avg_loss

    def evaluate(self):
        self.model.eval()
        self.metrics.reset()

        losses = []

        with torch.no_grad():
            for data in self.test_loader:
                images: Tensor
                labels: Tensor
                images, labels = data

                images = images.to(device=self.device)
                labels = labels.to(device=self.device)

                pred = self.model(images)

                loss = self.loss_fn(pred, labels)
                losses.append(loss.item())

                self.metrics.update(pred, labels)

        score = {k: v.item() for k, v in self.metrics.compute().items()}
        score['validation_loss'] = np.mean(losses)

        return score

    def train(
        self, max_epochs: int, experiment_name: str, run_name: str, cfg: DictConfig
    ):
        mlflow.set_experiment(experiment_name)

        with mlflow.start_run(run_name=run_name):
            mlflow.log_params(cast(dict[str, Any], OmegaConf.to_object(cfg)))

            best_f1 = 0.0
            best_step = 0
            best_model_path = 'best_model_state.pth'

            for epoch in range(max_epochs):
                logger.info(f'Epoch {epoch}')
                loss = self.train_one_epoch(epoch_index=epoch)
                logger.info(f'Epoch {epoch} finished. Training loss: {loss}')

                scores = self.evaluate()
                logger.info(f'Metrics for epoch {epoch}: {scores}')
                curr_f1 = scores['f1']
                curr_val_loss = scores['validation_loss']

                backbone_lr = self.optimizer.param_groups[0]['lr']
                head_lr = self.optimizer.param_groups[1]['lr']
                self.scheduler.step(curr_val_loss)

                if best_f1 < curr_f1:
                    logger.info(f'New model with better F1 found: f1 = {curr_f1}')
                    best_f1 = curr_f1
                    best_step = epoch
                    torch.save(self.model.state_dict(), best_model_path)
                scores['training_loss'] = loss
                scores['backbone_lr'] = backbone_lr
                scores['head_lr'] = head_lr
                mlflow.log_metrics(metrics=scores, step=epoch)

            if best_f1 > 0.0:
                logger.info('Loading best model and logging to MLflow')
                self.model.load_state_dict(torch.load(best_model_path))
                mlflow.pytorch.log_model(
                    pytorch_model=self.model, name='model', step=best_step
                )
                if os.path.exists(best_model_path):
                    os.remove(best_model_path)

            logger.info(f'Run finished after {epoch + 1} epochs')
