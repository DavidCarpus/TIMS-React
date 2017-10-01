DIR="$( cd "$( dirname "$0" )" && pwd )"
echo $DIR
[ ! -d "../logs" ] && mkdir ../logs
./server.sh >> ../logs/log.txt 2 >> ../logs/err.txt
