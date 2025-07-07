# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /workdir

# Copy dependencies first for caching
COPY requirements.txt .
COPY serve.sh .
RUN chmod +x serve.sh

# Install dependencies
RUN apt-get update && apt-get install -y \
    gcc g++ python3-dev \
    && pip install --no-cache-dir cython \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove gcc g++ python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the app code
COPY . .

# Expose the port Gunicorn will run on
EXPOSE 80
EXPOSE 443

# Start Gunicorn with Flask
CMD ["./serve.sh"]
