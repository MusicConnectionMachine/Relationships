FROM rowanto/docker-java8-mvn-nodejs-npm:latest

# Create app directory
RUN mkdir -p /usr/src/corefresolve
WORKDIR /usr/src/corefresolve

# Install app dependencies
COPY package.json /usr/src/corefresolve/
RUN npm install npm@latest -g
RUN npm cache clean -f
RUN npm install -g n
RUN n stable
RUN npm install -g swagger
RUN npm install
# Bundle app source
COPY . /usr/src/corefresolve

EXPOSE 3005

CMD [ "npm", "start"]

