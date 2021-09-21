# something

bored? make something. ok.

#

## developing

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

## building

![](.img/docker.png)

with Docker, it's possible to build everything inside the latest node:lts-alpine container.

it's the cleanest environment I can spin up in under a minute and it builds on [the official Node image](https://hub.docker.com/_/node)

```
docker-compose build
```
[read more about docker-compose](https://docs.docker.com/compose/install/)


#

![](.img/cli.png)

(without Docker)

to create an optimized production build of the client (during devlopment)
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

# 

## contributing

fork it and make something awesome!
