## STAGE 1: Build Angular application ##
FROM node:16-alpine as builder
WORKDIR /tmp/workspace

# install dependencies
ADD package.json .
ADD package-lock.json .
RUN npm ci

# copy sourcecode and build
COPY . .
RUN sed 's/production: false/production: true/' src/environments/environment.ts > src/environments/environment.prod.ts
RUN node --max_old_space_size=8192 $(npm bin)/ng build --configuration production

## STAGE 2: Run nginx to serve application ##
FROM nginx
RUN apt-get update && apt-get install -y curl
COPY --from=builder /tmp/workspace/dist/pwa/ /usr/share/nginx/html/
COPY --from=builder /tmp/workspace/set_env.sh .
ADD nginx-custom.conf /etc/nginx/conf.d/default.conf
RUN chmod -R a+r /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["/bin/sh", "-c", "./set_env.sh && exec nginx -g 'daemon off;'"]
