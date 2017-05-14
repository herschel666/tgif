
# Dockerfile extending the generic Node image with application files for a
# single application.
FROM gcr.io/google_appengine/nodejs

ARG TELEGRAM_BOT_TOKEN=""

ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN

RUN if [ "$TELEGRAM_BOT_TOKEN" -eq "" ]; then exit 1; fi

# You have to specify "--unsafe-perm" with npm install
# when running as root.  Failing to do this can cause
# install to appear to succeed even if a preinstall
# script fails, and may have other adverse consequences
# as well.
RUN npm install --unsafe-perm --global yarn

COPY . /app/

RUN yarn install --production || \
  ((if [ -f yarn-error.log ]; then \
      cat yarn-error.log; \
    fi) && false)

CMD yarn start
