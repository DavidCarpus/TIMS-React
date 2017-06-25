#!/bin/bash
TMPDIR="/tmp/"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
[[ $HOSTNAME == "E6420" ]] && TMPDIR=$DIR"/tmp/"

# 348572 pts/0    SN     0:00 /bin/bash /home/carpusco/bin/startAPI.sh product
#[[ ! $PWD == *"nodeapi"* ]] && echo "Not in nodeapi dir" && pushd nodeapi
NODE_ENV=$1
SCRIPT_NAME=`basename $0`

function getIDFileName()
{
  CUSTNAME=$(pwd)
  CUSTNAME=${CUSTNAME%/nodeapi}
  CUSTNAME=${CUSTNAME##*www/}
  PIDFILE=${TMPDIR}${CUSTNAME}_${NODE_ENV}
  eval $1=\$PIDFILE
}

function startNode()
{
  getIDFileName fn
  [[ -e $fn ]] && echo "ID file $PIDFILE already exists" && return
  echo "Starting: $fn mode: $NODE_ENV"
 # echo "======"
  env NODE_ENV=$NODE_ENV node app.js &
  echo $! > $fn
}

function stopNode()
{
  getIDFileName fn
#  echo "Stopping $fn ??"
  [[ ! -e $fn ]] && return
  echo "Stopping: $fn"
#  echo "======"
  ID=$(cat $fn)
  kill $ID && rm $fn
}

# [[ ! $PWD == *"nodeapi"* ]] && echo "Not in nodeapi dir" && exit 1

# [ "$SCRIPT_NAME" = "stopAPI.sh" ] && stopNode
# [ "$SCRIPT_NAME" = "startAPI.sh" ] && startNode
# [ "$SCRIPT_NAME" = "restartAPI.sh" ] && stopNode && startNode

#echo "$SCRIPT_NAME"

#env NODE_ENV=$1 node app.js
echo $DIR
echo $TMPDIR
getIDFileName fn
echo $fn
