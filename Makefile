
TAG=$(shell git rev-parse --short HEAD)
LOCAL_CONTAINER=gcr.io/$(PROJECT_ID)/$(IMAGE_NAME)-$(TAG)

help:
	@make -qp | awk -F':' '/^[a-zA-Z0-9][^$$#\/\t=]*:([^=]|$$)/ {split($$1,A,/ /);for(i in A)print A[i]}'

build:
	gcloud docker -- build --build-arg TELEGRAM_BOT_TOKEN=$(TELEGRAM_BOT_TOKEN) -t $(LOCAL_CONTAINER) .

push: build
	gcloud docker -- push $(LOCAL_CONTAINER)

deploy: push
	gcloud app deploy --project $(PROJECT_ID) --image-url "$(LOCAL_CONTAINER):latest" --stop-previous-version --quiet
