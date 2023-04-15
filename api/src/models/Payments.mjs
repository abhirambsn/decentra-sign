import {Schema, model} from 'mongoose';

const schema = new Schema({
    user: {
        type: Schema.Types.String,
        required: true
    },
    paidAt: {
        type: Schema.Types.Date,
        required: true
    },
    amount: {
        type: Schema.Types.Number,
        required: true
    },
    txnHash: {
        type: Schema.Types.String,
        required: true
    }
})

export default model('Payment', schema);