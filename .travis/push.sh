#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.com"
  git config --global user.name "Travis CI"
}

commit_files() {
  git checkout master
  git status
  git add data/*.json
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

push_commits() {
  git remote add travis-build https://${GITHUB_TOKEN}@github.com/mygoare/yuque.git > /dev/null 2>&1
  git push travis-build master --quiet
}

setup_git
commit_files
push_commits
