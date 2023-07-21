FROM --platform=amd64 nginx
MAINTAINER selegant
VOLUME /tmp
ENV LANG en_US.UTF-8 \
    GOARCH=arm64
RUN echo "server {  \
                      listen       8997; \
              location /api {\
                rewrite ^/api/(.*)$ /\$1 break;\
                proxy_pass http://localhost:8896;\
              }\
                  #解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
                  location / { \
                     root   /var/www/html/; \
                      index  index.html index.htm; \
                      if (!-e \$request_filename) { \
                          rewrite ^(.*)\$ /index.html?s=\$1 last; \
                          break; \
                      } \
                  } \
                  access_log  /var/log/nginx/access.log ; \
              } " > /etc/nginx/conf.d/default.conf
RUN  mkdir -p /var/www/html
ADD dist/ /var/www/html/
EXPOSE 8997