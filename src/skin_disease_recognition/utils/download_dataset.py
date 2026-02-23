import kagglehub

from skin_disease_recognition.core.config import RAW_DATA_DIR

path = kagglehub.dataset_download('pacificrm/skindiseasedataset')

print(f'Dataset downloaded to: {path}')
print(f'Move the files to {RAW_DATA_DIR}')
