FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED 1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./app /app/app
# Make sure to copy the CSV file as well

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]