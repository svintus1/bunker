FROM python:3.13.7-slim
WORKDIR /opt/app
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./ .
ENV PYTHONPATH=/opt/app

EXPOSE 8000

CMD ["python", "main.py"]
