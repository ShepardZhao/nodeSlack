FROM shepard/ubuntu-node

RUN apt-get update
RUN apt-get install -y locales locales-all vim nano wget curl libfontconfig
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8    
ENV ACCEPT_HIGHCHARTS_LICENSE YES

# copy source code from
COPY bin /slacker

WORKDIR /slacker

RUN npm i -g typescript && npm i

# entrypoin
ENTRYPOINT pm2 start app.ts -i 1 && /bin/bash