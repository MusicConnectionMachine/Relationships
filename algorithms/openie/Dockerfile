FROM rowanto/docker-java8-mvn-nodejs-npm:latest
#FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/openie
WORKDIR /usr/src/openie

# Install app dependencies
COPY package.json /usr/src/openie/
RUN npm install npm@latest -g
RUN npm cache clean -f
RUN npm install -g n
RUN n stable
RUN npm install
# Bundle app source
COPY . /usr/src/openie

EXPOSE 3001

CMD [ "npm", "start"]

