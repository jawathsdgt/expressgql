
export class socketService{

    gethttpSocket(app){
        let http = require('http').Server(app);
        let io = require('socket.io')(http);
        var Kafka = require('no-kafka');

        io.on('connection', (socket) => {
            console.log('USER CONNECTED');

            socket.on('disconnect', function(){
                console.log('USER DISCONNECTED');
            });

        });

        http.listen(9092, () => {
            console.log('started on port 9092');
            var consumer = new Kafka.SimpleConsumer({
                connectionString: 'localhost:9092',
                clientId: 'no-kafka-client'
            }); 

        // data handler function can return a Promise 
            var dataHandler = function (messageSet, topic, partition) {
                messageSet.forEach(function (m) {
                    console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
                    if(topic=="MEDCARE_QMS")
                    {
                        io.emit('encounterToken', {x:(new Date()).getTime(), y: m.message.value.toString('utf8')});
                    }
                    else
                    {
                        io.emit('message', {x:(new Date()).getTime(), y: m.message.value.toString('utf8')});
                    }
                });
            };

            return consumer.init().then(function () {
                // Subscribe partitons 0 and 1 in a topic: 
                var v1= consumer.subscribe('MEDCARE_QMS', dataHandler);
                //var v2= consumer.subscribe('MEDCARE_QMS', [0, 1], dataHandler);
                var arr=[];
                arr.push([v1]);
                //arr.push([v1,v2]);
                console.log("val:"+arr);
                return arr;
                
            });
        });
    }
    
}