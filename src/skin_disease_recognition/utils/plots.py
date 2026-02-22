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


def plot_misclassified_images(
    path: str,
    entries: list,
    classes: list[str],
    title: str,
):
    """
    Plots a grid of misclassified images.

    entries: list of tuples (image, pred_idx, true_idx, prob)
    """
    # Create a 3x3 grid or smaller if fewer entries
    n = min(9, len(entries))
    if n == 0:
        return

    # Create figure with subplots
    fig, axes = plt.subplots(3, 3, figsize=(12, 12))
    fig.suptitle(title, fontsize=16)

    # Flatten axes for easy iteration
    axes_flat = axes.flat

    for i in range(9):
        ax = axes_flat[i]

        if i < n:
            img, pred_idx, true_idx, prob = entries[i]

            if hasattr(img, 'permute'):
                img_np = img.permute(1, 2, 0).cpu().numpy()
            else:
                img_np = img

            if img_np.max() > img_np.min():
                img_disp = (img_np - img_np.min()) / (img_np.max() - img_np.min())
            else:
                img_disp = img_np

            ax.imshow(img_disp)

            pred_name = classes[pred_idx] if pred_idx < len(classes) else str(pred_idx)
            true_name = classes[true_idx] if true_idx < len(classes) else str(true_idx)

            ax.set_title(
                f'True: {true_name}\nPred: {pred_name}\nProb: {prob:.4f}',
                fontsize=10,
                color='red',
            )
            ax.axis('off')
        else:
            # Hide unused subplots
            ax.axis('off')

    plt.tight_layout()
    plt.savefig(path)
    plt.close()
