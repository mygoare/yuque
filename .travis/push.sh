#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_files() {
  git add . data/*.json
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

push_commits() {
  git push --quiet origin master
}

setup_git
commit_files
push_commits
