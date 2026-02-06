import numpy as np
import torch
from torchmetrics import Accuracy, Precision, Recall, F1Score
from torch.optim import Optimizer
from torch import nn, Tensor
from torch.utils.data import DataLoader


class Trainer:
    def __init__(
            self,
            model: nn.Module,
            train_loader: DataLoader,
            test_loader: DataLoader,
            optimizer: Optimizer,
            loss_fn: nn.Module,
            device: str
    ):
        self.model = model
        self.train_loader = train_loader
        self.test_loader = test_loader
        self.optimizer = optimizer
        self.loss_fn = loss_fn
        self.device = device

    def train_one_epoch(self, epoch_index):
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

            if i%100 == 0:
                print(f'Epoch {epoch_index}, Batch {i}/{n}')
        avg_loss = np.mean(losses)
        print(f'Epoch {epoch_index} finished with average loss {avg_loss}')
        return avg_loss

    def evaluate(self, num_classes):
        f1 = F1Score(task='multiclass', num_classes=num_classes)
        precision = Precision(task='multiclass', num_classes=num_classes)
        recall = Recall(task='multiclass', num_classes=num_classes)
        accuracy = Accuracy(task='multiclass', num_classes=num_classes)

        self.model.eval()

        metrics = {
            'accuracy': [],
            'precision': [],
            'recall': [],
            'f1': []
        }

        with torch.no_grad():
            for i, data in enumerate(self.test_loader):

                images: Tensor
                labels: Tensor
                images, labels = data

                images = images.to(device=self.device)
                labels = labels.to(device=self.device)

                pred = self.model(images)

                metrics['accuracy'].append(accuracy(pred, labels))
                metrics['precision'].append(precision(pred, labels))
                metrics['recall'].append(recall(pred, labels))
                metrics['f1'].append(f1(pred, labels))

        metrics_avg = {}
        for metric in metrics:
            metrics_avg[metric] = np.mean(metrics[metric])

        return metrics_avg






