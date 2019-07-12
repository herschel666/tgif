# Bring in the `source`-command
SHELL := /bin/bash

AWS_REGION ?= eu-central-1
BUCKET_NAME = ek-tgif-bot-deployment
STACK_NAME = ek-tgif-bot
STAGE ?= dev

mb: .venv/bin/aws
	@ aws --region $(AWS_REGION) \
		s3 mb s3://$(BUCKET_NAME)

run: .venv/bin/sam src
	@ sam local start-api \
		--region $(AWS_REGION) \
		--template src/template.yaml \
		--debug

package: .venv/bin/aws .venv/bin/sam clean
	@ sam package \
		--region $(AWS_REGION) \
		--template-file src/template.yaml \
		--output-template-file dist/packaged.yaml \
		--s3-bucket $(BUCKET_NAME)

deploy: .venv/bin/aws .venv/bin/sam package guard-TELEGRAM_BOT_TOKEN guard-GIPHY_API_KEY
	@ sam deploy \
		--region $(AWS_REGION) \
		--template-file dist/packaged.yaml \
		--stack-name $(STACK_NAME)-$(STAGE) \
		--capabilities CAPABILITY_IAM \
		--parameter-overrides \
			TelegramBotToken=$(TELEGRAM_BOT_TOKEN) \
			GiphyApiKey=$(GIPHY_API_KEY) \
			StageName=$(STAGE)

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
	@ sam init --name src --runtime nodejs10.x --no-input

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
	pip install awscli

.venv/bin/sam: .venv/bin/activate
	source ./.venv/bin/activate
	pip install aws-sam-cli

.PHONY: mb run package deploy upload clean setWebhook deleteWebhook guard-%
