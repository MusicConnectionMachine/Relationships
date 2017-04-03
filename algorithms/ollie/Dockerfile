FROM rowanto/docker-java8-mvn-nodejs-npm:latest
#FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/ollie
WORKDIR /usr/src/ollie

# Install app dependencies
COPY package.json /usr/src/ollie/
RUN npm install npm@latest -g
RUN npm cache clean -f
RUN npm install -g n
RUN n stable
RUN npm install -g swagger
RUN npm install
# Bundle app source
COPY . /usr/src/ollie

EXPOSE 3000

CMD [ "npm", "start"]

