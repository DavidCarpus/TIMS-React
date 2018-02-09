DIR="$( cd "$( dirname "$0" )" && pwd )"
. $DIR/../.env


echo "BASH_SOURCE:"
echo $0

ps ax

PATH=$PATH:$HOME/bin

#export NODE_ENV=production
cd $DIR
node_modules/nodemon/bin/nodemon.js app.js $NODE_ENV $DIR &
#node app.js $NODE_ENV $DIR &
# npm run start $DIR
