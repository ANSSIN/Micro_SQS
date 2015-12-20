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
    var params = {
        QueueName: 'RequestProcessor'
    };
    sqs.getQueueUrl(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else {
            Q_Url = data.QueueUrl;
            message.forEach(function(eachMessage) {
                var params = {
                    MessageBody: JSON.stringify(eachMessage), //.text,
                    QueueUrl: Q_Url,
                    DelaySeconds: 0
                };
                sqs.sendMessage(params, function(err, data) {
                    if (err) console.log(err, err.stack);
                    else console.log('Message pushed to Queue from SQS file');
                });
            });
        }
        callback();
    });
}
