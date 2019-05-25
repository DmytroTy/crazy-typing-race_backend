FROM node:10-alpine

WORKDIR /app/

COPY ./package.json ./package-lock.json /app/
COPY . /app/

RUN npm ci --production

EXPOSE 3000

CMD ["npm", "start"]
