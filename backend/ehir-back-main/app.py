"""
HuggingFace Spaces Entry Point
Starts FastAPI server on port 7860 for HF deployment
"""
import subprocess
import sys

if __name__ == "__main__":
    subprocess.run([
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "7860"
    ])
