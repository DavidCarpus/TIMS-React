DIR="$( cd "$( dirname "$0" )" && pwd )"

echo "BASH_SOURCE:"
echo $0

ps ax

PATH=$PATH:$HOME/bin

export NODE_ENV=production
cd $DIR
# npm run start $DIR
node app.js $NODE_ENV $DIR &
