FROM node:boron
MAINTAINER MusicConnectionMachine http://music-connection-machine.peachnote.com/
# Create app directory
RUN mkdir -p /usr/src/relationships
WORKDIR /usr/src/relationships
# Install app dependencies
COPY package.json /usr/src/relationships/
RUN npm install
# Bundle app source
COPY . /usr/src/relationships
EXPOSE 8080
CMD [ "npm", "start"]
