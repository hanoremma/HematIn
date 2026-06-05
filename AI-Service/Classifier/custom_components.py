"""
custom_components.py — Custom TF/Keras components untuk Classifier HematIn

OCR menggunakan PaddleOCR pretrained.

Komponen:
    AttentionLayer             -- Custom Layer  (Classifier)
    FocalLoss                  -- Custom Loss   (Classifier)
    PerCategoryMetricsCallback -- Custom Callback (Classifier)
"""
import numpy as np
import tensorflow as tf
from sklearn.metrics import f1_score
import config


# ── AttentionLayer ────────────────────────────────────────────────────────────
@tf.keras.utils.register_keras_serializable(package="HematIn")
class AttentionLayer(tf.keras.layers.Layer):
    """
    Bahdanau-style self-attention atas output BiLSTM.

    Rumus:
        e_t  = tanh(W * h_t + b)
        a_t  = softmax(v^T * e_t)
        ctx  = sum(a_t * h_t)

    Kata kunci seperti "goreng", "bioskop", "laptop" sangat informatif
    untuk klasifikasi. Attention memungkinkan model fokus pada kata tersebut.
    """

    def __init__(self, units: int = 64, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.supports_masking = True

    def build(self, input_shape):
        self.W = tf.keras.layers.Dense(self.units, use_bias=True, activation="tanh")
        self.v = tf.keras.layers.Dense(1, use_bias=False)
        self.W.build(input_shape)
        self.v.build((input_shape[0], input_shape[1], self.units))
        super().build(input_shape)

    def call(self, sequence, mask=None):
        score = self.v(self.W(sequence))
        if mask is not None:
            mask = tf.cast(mask, tf.float32)
            score += (1.0 - tf.expand_dims(mask, -1)) * -1e9
        weights = tf.nn.softmax(score, axis=1)
        context = tf.reduce_sum(weights * sequence, axis=1)
        return context

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units})
        return cfg


# ── FocalLoss ─────────────────────────────────────────────────────────────────
@tf.keras.utils.register_keras_serializable(package="HematIn")
class FocalLoss(tf.keras.losses.Loss):
    """
    Focal Loss — Lin et al. 2017.

    FL(p_t) = -alpha * (1 - p_t)^gamma * log(p_t)

    Dataset pengeluaran tidak seimbang (Makanan/Minuman >> kategori lain).
    Focal loss menekan kontribusi loss dari sampel mudah agar model
    lebih fokus pada kategori yang sulit.

    Args:
        gamma : focusing parameter (default=2.0)
        alpha : weighting factor   (default=0.25)
    """

    def __init__(self, gamma: float = 2.0, alpha: float = 0.25,
                 name: str = "focal_loss", **kwargs):
        super().__init__(name=name, **kwargs)
        self.gamma = gamma
        self.alpha = alpha

    def call(self, y_true, y_pred):
        y_pred       = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)
        ce           = -tf.reduce_sum(y_true * tf.math.log(y_pred), axis=-1)
        p_t          = tf.reduce_sum(y_true * y_pred, axis=-1)
        focal_weight = self.alpha * tf.pow(1.0 - p_t, self.gamma)
        return tf.reduce_mean(focal_weight * ce)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"gamma": self.gamma, "alpha": self.alpha})
        return cfg


# ── PerCategoryMetricsCallback ────────────────────────────────────────────────
class PerCategoryMetricsCallback(tf.keras.callbacks.Callback):
    """
    Log F1-score per kategori pengeluaran setiap epoch.

    - Menyimpan histori F1 di self.history untuk diplot setelah training.
    - Menambahkan 'val_macro_f1' ke logs Keras → dipakai EarlyStopping.
    - Kompatibel dengan TensorBoard melalui logs dict.

    Args:
        val_dataset : tf.data.Dataset validasi → (x_dict, y_onehot)
        categories  : list nama kategori
    """

    def __init__(self, val_dataset, categories=None):
        super().__init__()
        self.val_dataset = val_dataset
        self.categories  = categories or config.CATEGORIES
        self.history     = {c: [] for c in self.categories}
        self.history["macro_f1"] = []

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        y_true_all, y_pred_all = [], []

        for x_batch, y_batch in self.val_dataset:
            probs = self.model(x_batch, training=False).numpy()
            y_pred_all.append(np.argmax(probs, axis=1))
            y_true_all.append(np.argmax(y_batch.numpy(), axis=1))

        y_true = np.concatenate(y_true_all)
        y_pred = np.concatenate(y_pred_all)

        f1_per_class = f1_score(
            y_true, y_pred,
            average=None,
            labels=list(range(len(self.categories))),
            zero_division=0,
        )
        support  = np.bincount(y_true, minlength=len(self.categories))
        macro_f1 = float(np.mean(f1_per_class))

        print(f"\n  [Epoch {epoch + 1}] Per-Category F1:")
        print(f"  {'Category':<26}| {'F1':>6} | Support")
        print("  " + "-" * 44)
        for i, cat in enumerate(self.categories):
            f1  = float(f1_per_class[i]) if i < len(f1_per_class) else 0.0
            sup = int(support[i])
            self.history[cat].append(f1)
            print(f"  {cat:<26}| {f1:>6.4f} | {sup:>7}")
        print("  " + "-" * 44)
        print(f"  {'Macro F1':<26}| {macro_f1:>6.4f} |")

        logs["val_macro_f1"] = macro_f1
        self.history["macro_f1"].append(macro_f1)


# ── CUSTOM_OBJECTS registry ───────────────────────────────────────────────────
CUSTOM_OBJECTS = {
    "AttentionLayer" : AttentionLayer,
    "FocalLoss"      : FocalLoss,
    "PerCategoryMetricsCallback" : PerCategoryMetricsCallback,
}
