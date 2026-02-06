import numpy as np
import torch
from torch import Tensor, nn
from torch.optim import Optimizer
from torch.utils.data import DataLoader
import torchmetrics
from torchmetrics import Accuracy, F1Score, Precision, Recall


class Trainer:
    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        test_loader: DataLoader,
        optimizer: Optimizer,
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

        self.metrics = torchmetrics.MetricCollection(
            [
                Accuracy(task='multiclass', num_classes=num_classes),
                Precision(task='multiclass', num_classes=num_classes, average='macro'),
                Recall(task='multiclass', num_classes=num_classes, average='macro'),
                F1Score(task='multiclass', num_classes=num_classes, average='macro'),
            ]
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

            outputs = self.model(images)

            loss = self.loss_fn(outputs, labels)
            losses.append(loss.item())
            loss.backward()

            self.optimizer.step()

            if i % 100 == 0:
                print(f'Epoch {epoch_index}, Batch {i}/{n}')
        avg_loss = np.mean(losses)
        print(f'Epoch {epoch_index} finished with average loss {avg_loss}')
        return avg_loss

    def evaluate(self, num_classes):
        self.model.eval()

        with torch.no_grad():
            for data in self.test_loader:
                images: Tensor
                labels: Tensor
                images, labels = data

                images = images.to(device=self.device)
                labels = labels.to(device=self.device)

                pred = self.model(images)

                self.metrics.update(pred, labels)

        return self.metrics.compute()
