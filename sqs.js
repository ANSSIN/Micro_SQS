var AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
});
var sqs = new AWS.SQS({
    apiVersion: '2012-11-05'
});

exports.queueInitiator = function() {
    var params = {
        QueueName: 'RequestProcessor',
    };

    sqs.createQueue(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else console.log('Message Queue initialised from SQS file');
    });
}

exports.sendMessage = function(message, callback) {
    var message = JSON.parse(message);
    var params = {
        QueueName: 'RequestProcessor'
    };
    sqs.getQueueUrl(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
            Q_Url = data.QueueUrl;
                var params = {

                    MessageBody: JSON.stringify(message), //.text,
                    QueueUrl: Q_Url,
                    DelaySeconds: 0,
                    MessageAttributes:{
                      ResponseQueue:{
                                      DataType: 'String', /* required */
                                      StringValue: message.ResponseQueue
                                    },
                      CorrelationId:{
                                        DataType: 'String', /* required */
                                        StringValue: message.CorrelationId
                                    },
                      Operation:{
                                   DataType: 'String', /* required */
                                   StringValue: message.Operation
                                }    /* anotherKey: ... */
                   }
                };
                sqs.sendMessage(params, function(err, data) {
                    if (err) console.log(err, err.stack);
                    else console.log('Message pushed to Queue from SQS file');
                });
        }
        callback();
    });
}


var receiveMessage = exports.receiveMessage = function () { //callback) {
    var params = {
        QueueName: 'ResponseQueue'
    };
    sqs.getQueueUrl(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
            Q_Url = data.QueueUrl;
            var params = {

                QueueUrl: Q_Url,
                MessageAttributeNames : ['CorrelationId'],
                MaxNumberOfMessages: 10,
                VisibilityTimeout: 60,
                WaitTimeSeconds: 10
            };
            sqs.receiveMessage(params, function(err, messages) {
                if (err) console.log(err, err.stack);
                else {
                    if (messages.Messages && messages.Messages.length > 0) {
                        console.log(messages);
                        //console.log(messages.Messages.MessageAttributes);
                        data = messages.Messages;
                        //attributes = data.MessageAttributes;
                        //console.log(attributes);
                        resultList = [];

                        var counter = 0;
                        data.forEach(function(d) {
                            var attributes = d.MessageAttributes;
                            var body = d.Body;
                            console.log(attributes);
                            console.log(body);

                            // var params = {
                            //     QueueUrl: Q_Url,
                            //     ReceiptHandle: d.ReceiptHandle
                            // };
                            // sqs.deleteMessage(params, function(err, data) {
                            //     if (err) console.log(err, err.stack);
                            //     else {
                            //         console.log('Messages Deleted from Queue in trend worker ELB')
                            //     }
                            // });
                            // counter++;
                            // if (counter == data.length) {
                            //     receiveMessage();
                            //     //console.log('CALLING AGAIN');
                            // }
                        });
                    } else {
                        receiveMessage();
                        //console.log('CALLING AGAIN');
                    }
                }
            });
        }
    });
}
