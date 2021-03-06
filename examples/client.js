/*
 * Copyright 2015 Red Hat Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var container = require('rhea');

var args = require('./options.js').options({
      'n': { alias: 'node', default: 'examples', describe: 'name of node (e.g. queue) to which messages are sent'},
      'p': { alias: 'port', default: 5672, describe: 'port to connect to'}
    }).help('help').argv;

var requests = ["Twas brillig, and the slithy toves",
                "Did gire and gymble in the wabe.",
                "All mimsy were the borogroves,",
                "And the mome raths outgrabe."];
var sender;

function next_request(context) {
    if (context.receiver.source.address) {
        sender.send({reply_to:context.receiver.source.address, body:requests[0]})
    }
}

container.on('connection_open', function (context) {
    sender = context.connection.open_sender(args.node);
    context.connection.open_receiver({source:{dynamic:true}});
});
container.on('receiver_open', function (context) {
    next_request(context);
});

container.on('message', function (context) {
    console.log(requests.shift() + " => " + context.message.body);
    if (requests.length) {
        next_request(context);
    } else {
        context.connection.close();
    }
});

container.connect({'port':args.port});
