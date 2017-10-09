FROM node

RUN mkdir -p /usr/chippie
WORKDIR /usr/chippie

RUN npm install yarn -g

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn

COPY . /usr/chippie

RUN yarn production

EXPOSE 3000

CMD ["yarn", "start"]