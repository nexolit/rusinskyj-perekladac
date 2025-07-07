#!/bin/bash

if [ "$USE_SSL" = "true" ]; then
  echo "Starting in HTTPS mode"
  if [[ "$DOMAIN" ]]; then # IF DOMAIN variable exists 
    if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" && ! -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]]; then
        if [[ "$EMAIL" ]]; then
            certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m $EMAIL || exit 1
        else
            echo 'ERROR: $EMAIL variable not set' >&2 # >&2 operator redirects the output of a command to stderr
            echo 'Please set the $EMAIL variable with -e EMAIL= to your email accordingly!'
            exit 1
        fi
    else
        certbot renew || exit 1
    fi
    gunicorn \
        --certfile=/etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        --keyfile=/etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -b 0.0.0.0:443 server:app
  else
    echo 'ERROR: $DOMAIN variable not set' >&2 # >&2 operator redirects the output of a command to stderr
    echo 'Please set the $DOMAIN variable with -e DOMAIN= to your preffered domain!'
    exit 1
  fi
else
  echo "Starting in HTTP mode"
  gunicorn -b 0.0.0.0:80 server:app
fi
