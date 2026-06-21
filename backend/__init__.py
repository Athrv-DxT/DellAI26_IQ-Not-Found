import sys
import os

# Automatically add the backend directory to Python's sys.path
# to allow importing 'models', 'database', etc. directly.
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
