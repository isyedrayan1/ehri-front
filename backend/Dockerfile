# HuggingFace Spaces Dockerfile for EHIR Backend
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire application
COPY app app/
COPY app/data app/data/
COPY .env .env

# Copy model files
COPY risk_model.pkl .
COPY scaler.pkl .
COPY feature_columns.pkl .

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Start FastAPI server on port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
