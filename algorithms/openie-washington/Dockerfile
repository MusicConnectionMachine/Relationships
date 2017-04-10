FROM ubuntu:xenial

MAINTAINER MusicConnectionMachine http://music-connection-machine.peachnote.com/

# make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu xenial main universe" > /etc/apt/sources.list
RUN apt-get update && apt-get clean
# install python-software-properties (so you can do add-apt-repository)
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q python-software-properties=0.96.20 software-properties-common=0.96.20 --no-install-recommends

#---------- JAVA ----------#
RUN add-apt-repository ppa:webupd8team/java -y
RUN apt-get update
RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
RUN apt-get -y install oracle-java8-installer --no-install-recommends && apt-get clean
# set oracle java as the default java RUN update-java-alternatives -s java-8-oracle
RUN echo "export JAVA_HOME=/usr/lib/jvm/java-8-oracle" >> ~/.bashrc

#---------- Utilities----------#
#install utilities in container
RUN apt-get -y install vim=2:7.4.1689-3ubuntu1 curl=7.47.0-1ubuntu2 --no-install-recommends

#---------- Node.js & npm----------#
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get update
RUN apt-get install -y nodejs --no-install-recommends

# Create app directory
RUN mkdir -p /usr/src/openie_washington
WORKDIR /usr/src/openie_washington

# Install app dependencies
COPY package.json /usr/src/openie_washington/
RUN npm install

# Bundle app source
COPY . /usr/src/openie_washington

EXPOSE 3001

CMD [ "npm", "start"]
