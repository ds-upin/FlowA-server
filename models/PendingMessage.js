const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    target:{
        type: mongoose
    },
    messages:[
        {
            userId: mongoose.Types.ObjectId,
            message:[
                {
                    content:{
                        type:String
                    },
                    time:{
                        type:String
                    }
                }
            ]
        }
    ]
},{timestamps:true});

const PendingMessage = mongoose.model('pendingmessage',messageSchema);
module.exports = PendingMessage;