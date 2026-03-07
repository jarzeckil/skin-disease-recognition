import os
import random
from unittest.mock import MagicMock

import numpy as np
import torch

from skin_disease_recognition.utils.seeding import seed_everything


def test_seed_sets_python_random():
    cfg = MagicMock()
    cfg.seed = 42

    seed_everything(cfg)
    val1 = random.random()

    seed_everything(cfg)
    val2 = random.random()

    assert val1 == val2


def test_seed_sets_numpy():
    cfg = MagicMock()
    cfg.seed = 42

    seed_everything(cfg)
    val1 = np.random.rand()

    seed_everything(cfg)
    val2 = np.random.rand()

    assert val1 == val2


def test_seed_sets_torch():
    cfg = MagicMock()
    cfg.seed = 42

    seed_everything(cfg)
    val1 = torch.rand(1).item()

    seed_everything(cfg)
    val2 = torch.rand(1).item()

    assert val1 == val2


def test_seed_sets_pythonhashseed():
    cfg = MagicMock()
    cfg.seed = 123

    seed_everything(cfg)

    assert os.environ['PYTHONHASHSEED'] == '123'


def test_different_seeds_different_results():
    cfg1 = MagicMock()
    cfg1.seed = 42
    cfg2 = MagicMock()
    cfg2.seed = 123

    seed_everything(cfg1)
    val1 = random.random()

    seed_everything(cfg2)
    val2 = random.random()

    assert val1 != val2


def test_cudnn_deterministic():
    cfg = MagicMock()
    cfg.seed = 42

    seed_everything(cfg)

    assert torch.backends.cudnn.deterministic is True
    assert torch.backends.cudnn.benchmark is False


def test_tensor_reproducibility():
    cfg = MagicMock()
    cfg.seed = 42

    seed_everything(cfg)
    t1 = torch.randn(10, 10)

    seed_everything(cfg)
    t2 = torch.randn(10, 10)

    assert torch.allclose(t1, t2)
