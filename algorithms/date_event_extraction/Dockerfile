FROM rowanto/docker-java8-mvn-nodejs-npm
#FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/date_event_extraction
WORKDIR /usr/src/date_event_extraction

# Install app dependencies
COPY package.json /usr/src/date_event_extraction/
RUN npm install npm@latest -g
RUN npm install
# Bundle app source
COPY . /usr/src/date_event_extraction

EXPOSE 3003

CMD [ "npm", "start"]

