FROM python:3.12-alpine
WORKDIR /opt/app
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=/opt/app

EXPOSE 8000

CMD ["python", "app/main.py"]
