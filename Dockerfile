FROM node:lts-alpine

RUN mkdir /app

WORKDIR /app

# add the Express Backend,
ADD api /app/api

# the React Frontend,
ADD client /app/client

# the docker mount point (for sqlite db),
ADD mnt /app/mnt

# add start script
ADD .bin/start.sh /app/.bin/start-something

ADD .bin/build.sh /app/.bin/build-for-production

# make executable
RUN chmod +x /app/.bin/start-something
RUN chmod +x /app/.bin/build-for-production

# add folder to the path
ENV PATH /app/.bin:$PATH

# note: you can replace this with your fork to help keep track of your containers
ENV REACT_FROM_EXPRESS=https://github.com/trevorjamesmartin/something.git
# build client
RUN build-for-production

# remove the client src, now that it's been optimized for production
RUN rm -rf /app/client
# remove the client build script
RUN rm /app/.bin/build-for-production

# install dependencies, & ready the example database
RUN cd /app/api && npm install
RUN cd /app/api && npx knex migrate:latest
RUN cd /app/api && npx knex seed:run

# create the release file: /app/something.tar.gz
RUN cd /app && tar cvf something.tar api && gzip something.tar

# expose the express api port
EXPOSE 8000

# run express in production mode
ENV NODE_ENV=production
# the start script should include a database check
CMD ["start-something"]
