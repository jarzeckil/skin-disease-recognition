import albumentations as A
from albumentations import ToTensorV2
import cv2
from fastapi import UploadFile
import numpy as np


async def get_data_from_file(file: UploadFile):
    bts = await file.read()
    nparr = np.frombuffer(bts, np.uint8)

    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    return img


def make_transform(image_size: int):
    return A.Compose(
        [
            A.Resize(image_size, image_size),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2(),
        ]
    )
