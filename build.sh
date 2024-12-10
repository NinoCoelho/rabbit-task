#!/bin/bash

# Build the Docker image
docker build -t kanban-board:latest .

# Run the container
docker run -d -p 8080:80 --name kanban-board kanban-board:latest 