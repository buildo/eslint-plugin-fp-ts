#!/bin/sh

set -e

LATEST_TAG=$(git describe --tags)
VERSION=${LATEST_TAG#v}

ssh-keyscan github.com >> $HOME/.ssh/known_hosts

git config --global user.email "nemobot@buildo.io"
git config --global user.name "Nemobot"

yarn install --no-progress
yarn version --no-git-tag-version --new-version $VERSION

git add .
git commit -m "v$VERSION"
git push origin HEAD:main

yarn config set _authToken $NPM_TOKEN
yarn publish --non-interactive
