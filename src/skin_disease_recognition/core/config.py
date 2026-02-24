import logging
import os
from pathlib import Path

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

DATA_DIR = PROJECT_ROOT / 'data'
RAW_DATA_DIR = DATA_DIR / 'raw'
PROCESSED_DATA_DIR = DATA_DIR / 'processed'
MODEL_DIR = PROJECT_ROOT / 'models'

load_dotenv(PROJECT_ROOT / '.env')
ACTIVE_MODEL = os.getenv('ACTIVE_MODEL_NAME')
ACTIVE_DEVICE = os.getenv('ACTIVE_DEVICE')

if __name__ == '__main__':
    print(f'Project root is: {PROJECT_ROOT}')
    print(f'Active model is: {ACTIVE_MODEL}')
