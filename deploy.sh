#! /bin/sh

eval $(docker-machine env web-1)

if docker-compose build; then
    docker-compose push
    docker-compose up -d --scale web=2
    
    echo "Deployment complete"
else
    echo "Docker build failed"
fi

eval $(docker-machine env --unset)