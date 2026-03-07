from pathlib import Path

from skin_disease_recognition.core.config import (
    DATA_DIR,
    MODEL_DIR,
    PROCESSED_DATA_DIR,
    PROJECT_ROOT,
    RAW_DATA_DIR,
)


def test_project_root_exists():
    assert PROJECT_ROOT.exists()
    assert PROJECT_ROOT.is_dir()


def test_project_root_contains_pyproject():
    assert (PROJECT_ROOT / 'pyproject.toml').exists()


def test_data_directories_are_paths():
    assert isinstance(DATA_DIR, Path)
    assert isinstance(RAW_DATA_DIR, Path)
    assert isinstance(PROCESSED_DATA_DIR, Path)
    assert isinstance(MODEL_DIR, Path)


def test_data_dir_hierarchy():
    assert RAW_DATA_DIR.parent == DATA_DIR
    assert PROCESSED_DATA_DIR.parent == DATA_DIR


def test_model_dir_under_project_root():
    assert MODEL_DIR.parent == PROJECT_ROOT
