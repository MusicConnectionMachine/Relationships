FROM ubuntu:xenial

MAINTAINER MusicConnectionMachine

# make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu xenial main universe" > /etc/apt/sources.list
RUN apt-get update

# install python-software-properties (so you can do add-apt-repository)
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q python-software-properties software-properties-common

#---------- JAVA ----------#
RUN add-apt-repository ppa:webupd8team/java -y
RUN apt-get update
RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
RUN apt-get -y install oracle-java8-installer && apt-get clean
# set oracle java as the default java RUN update-java-alternatives -s java-8-oracle
RUN echo "export JAVA_HOME=/usr/lib/jvm/java-8-oracle" >> ~/.bashrc

#---------- Utilities----------#
#install utilities in container
RUN apt-get -y install vim curl

#---------- Node.js & npm----------#
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get update
RUN apt-get install -y nodejs

# Create app directory
RUN mkdir -p /usr/src/date_event_extraction
WORKDIR /usr/src/date_event_extraction

# Install app dependencies
COPY package.json /usr/src/date_event_extraction/
RUN npm install

# Bundle app source
COPY . /usr/src/date_event_extraction

EXPOSE 3003

CMD [ "npm", "start"]
