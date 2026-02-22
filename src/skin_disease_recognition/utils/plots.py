from matplotlib import pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix


def plot_confusion_matrix(path: str, y_trues: list, y_preds: list, classes: list[str]):
    conf = confusion_matrix(y_trues, y_preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        conf,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=classes,
        yticklabels=classes,
    )
    plt.title('Confusion Matrix on Test Set')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.xticks(rotation=90)
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig(path)
    plt.close()


def plot_bad_pred_distribution(path: str, miss_probs: list):
    plt.figure(figsize=(6, 4))
    sns.histplot(miss_probs, bins=100)
    plt.title('Prediction value of missclassified samples')
    plt.savefig(path)
    plt.close()
