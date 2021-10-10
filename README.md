# something 

[something's running in the cloud.](https://trevor.cloud)


## run

with [Docker](https://www.docker.com/get-started) installed, you can download & run the [latest example container](https://hub.docker.com/r/trevorjmartin/something-webbed).

```
docker run -p 80:80 -e CONTAINER_PORT=80 trevorjmartin/something-webbed:latest
```

create a *docker-compose file to map volumes, ports, and environment variables. [*example](example-release.yml)

#

## developing...

on first run, you'll need to initialize the database & install dependencies.
```
npm run first-run
```

subsequently, to start (in development mode)
```
npm start
```

# 

the project is structured to locally encapsulate a Full Stack application.

[/something/api](api/README.md) → backend (Express)

[/something/client](client/README.md) → frontend (React)

[/something/package.json](package.json) → "scripts" 


_to deploy each piece seperately, you'll need to adjust your CI accordingly_

#

## building,

everything builds inside the latest node:lts-alpine container.

![](.img/docker.png)

the container is built from [the Official Node JS image](https://hub.docker.com/_/node)


```
docker-compose build
```
[read more about docker-compose](https://docs.docker.com/compose/install/)

to copy the new release-build from the container (without having to launch the app)
```
npm run copy-release
```
#

![](.img/cli.png)

(without Docker)


![](.img/bridge.jpg)

to create an optimized production build of the client (during development)
```
npm run build
```

this custom-build script prepares the client to be served from the api

#

## cleaning up

__remove__ all "node_modules"
```
npm run clean
```

__remove__ the sqlite3 db file
```
npm run remove-db
```

__remove__ the "build" target folder
```
npm run remove-build
```

# 

## contribute

fork it and make something awesome!
