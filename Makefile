# Bring in the `source`-command
SHELL := /bin/bash

AWS_REGION ?= eu-central-1
BUCKET_NAME = ek-geloets-installationen-ftw
STACK_NAME = ek-tgif-bot
STAGE ?= dev
GIT_SHA ?= dev

mb: .venv/bin/aws
	@ aws --region $(AWS_REGION) \
		s3 mb s3://$(BUCKET_NAME)

run: .venv/bin/sam src
	@ sam local start-api \
		--region $(AWS_REGION) \
		--template src/template.yaml \
		${ARGS}

package: .venv/bin/aws .venv/bin/sam clean
	@ sam package \
		--region $(AWS_REGION) \
		--template-file src/template.yaml \
		--output-template-file dist/packaged.yaml \
		--s3-bucket $(BUCKET_NAME)

deploy: .venv/bin/aws .venv/bin/sam package
deploy: guard-AWS_ACCESS_KEY_ID
deploy: guard-AWS_SECRET_ACCESS_KEY
deploy: guard-TELEGRAM_BOT_TOKEN
deploy: guard-TENOR_API_KEY
deploy: guard-EMAIL
deploy: guard-HOSTED_ZONE_ID
deploy: guard-CERTIFICATE_ARN
deploy: guard-DOMAIN_NAME
deploy: guard-EK_USER_ID
deploy:
	@ sam deploy \
		--region $(AWS_REGION) \
		--template-file dist/packaged.yaml \
		--stack-name $(STACK_NAME)-$(STAGE) \
		--capabilities CAPABILITY_IAM \
		--parameter-overrides \
			TelegramBotToken=$(TELEGRAM_BOT_TOKEN) \
			TenorApiKey=$(TENOR_API_KEY) \
			Zone=$(HOSTED_ZONE_ID) \
			CertificateArn=$(CERTIFICATE_ARN) \
			DomainName=$(DOMAIN_NAME) \
			StageName=$(STAGE) \
			GitSha=$(GIT_SHA) \
			AlarmRecipient=$(EMAIL) \
			EkUserId=$(EK_USER_ID)

delete: .venv/bin/aws
	@ aws cloudformation delete-stack \
		--region $(AWS_REGION) \
		--stack-name $(STACK_NAME)-$(STAGE)

upload: package deploy

setWebhook: guard-TELEGRAM_BOT_TOKEN guard-LAMBDA_URL
	curl https://api.telegram.org/bot$(TELEGRAM_BOT_TOKEN)/setWebhook?url=$(LAMBDA_URL)

deleteWebhook: guard-TELEGRAM_BOT_TOKEN
	curl https://api.telegram.org/bot$(TELEGRAM_BOT_TOKEN)/deleteWebhook

src: .venv/bin/sam
	@ sam init --name src --runtime nodejs12.x --no-input

clean:
	rm -rf ./dist
	mkdir ./dist

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi

.venv/bin/activate:
	python3 -m venv ./.venv

.venv/bin/aws: .venv/bin/activate
	source ./.venv/bin/activate
	pip install awscli --upgrade

.venv/bin/sam: .venv/bin/activate
	source ./.venv/bin/activate
	pip install aws-sam-cli --upgrade

.PHONY: mb run package deploy upload clean setWebhook deleteWebhook guard-%
