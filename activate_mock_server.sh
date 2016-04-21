#!/bin/sh

# モックサーバーを立ち上げるスクリプト

DIR=$(cd $(dirname $0); pwd)

cd $DIR/public
$DIR/node_modules/easymock/bin/easymock
