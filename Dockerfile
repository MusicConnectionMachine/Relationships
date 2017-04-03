FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/relationships
WORKDIR /usr/src/relationships

# Install app dependencies
COPY package.json /usr/src/relationships/
RUN npm install -g swagger
RUN npm install
# Bundle app source
COPY . /usr/src/relationships

EXPOSE 8080

CMD [ "npm", "start"]

