# Переменные
DOCKER_IMAGE_NAME=gpt-chat-bot
DOCKER_IMAGE_TAG=latest
DOCKER_CONTAINER_NAME=gpt-chat-bot-container

# Сборка Docker-образа
docker-build:
	docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG) .

# Запуск Docker-контейнера
docker-run:
	docker run -d --name $(DOCKER_CONTAINER_NAME) -p 3000:3000 $(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)

# Остановка Docker-контейнера
docker-stop:
	docker stop $(DOCKER_CONTAINER_NAME)
	docker rm $(DOCKER_CONTAINER_NAME)

# Очистка всех собранных образов
docker-clean:
	docker system prune -a

# Сборка и запуск контейнера
run: docker-build docker-run

# Остановка контейнера
stop: docker-stop

# Запуск тестового окружения
dev:
	deno task dev
