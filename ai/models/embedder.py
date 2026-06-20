from sentence_transformers import SentenceTransformer
import os

class Embedder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initializes the sentence-transformers model.
        Model runs fully offline and outputs 384-dimensional embeddings.
        """
        self.model_name = model_name
        self._model = None

    @property
    def model(self):
        if self._model is None:
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def get_embedding(self, text: str):
        """
        Generate embedding vector for a single piece of text.
        """
        if not text:
            return [0.0] * 384
        return self.model.encode(text).tolist()

# Singleton embedder instance
embedder = Embedder()
