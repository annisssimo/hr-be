1. Download docker desktop
   https://docs.docker.com/desktop/setup/install/windows-install/

2. Open project and run next command in cli tool:

```BASH
docker-compose up --build
```

3. After creation if containers was stopped use:

```BASH
docker-compose start
```

4. To stop your containers use:

```BASH
docker-compose stop
```

5. To drop your containers use:

```BASH
docker-compose drop
```

```BASH
docker-compose up --build
```

`--build` flag is here because at the first startupt you shoud build images before starting container
After initial build you shoud use `docker-compose up` command to start your container and `docker-compose stop` to stop.
If you want remove docker containers use `docker-compose down`

It's important to understand difference between `docker-compose up`and `start` commands

> `docker-compose up`

This command creates and startups containers.

- If containers doesn't created, `up` command will create them based on `docker-compose.yaml`.
- If containers created, `up` will startup them.
- Also you should rebuild your containers using `up` in case you have changed your docker-compose file.

> `docker-compose start`

This command only startups containers that have already been created and paused . It doesn't take into account `docker-compose.yaml` file.

You may customize certain settings in `docker-composer.yaml` file:

```yml
services:
    career_day_db:
        container_name: 'career_day_db' #container name
        ports:
            - '5432:5432' # left port is responsible for the port on your PC, right for the port in our container
        environment:
            POSTGRES_USER: 'postgres'
            POSTGRES_PASSWORD: 'postgres'
        image: postgres:14.15-alpine3.21 # template for container
        volumes:
            - pg_data:/var/lib/postgresql/data # links our volume with container
        restart: always #always restart in case of errors

volumes:  #specifies where data would be stored
    pg_data:
```

If you encouner any errors just write in CLI tool `rm -fr`
