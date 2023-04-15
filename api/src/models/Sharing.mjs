import {Schema, model} from 'mongoose';

const sharingSchema = new Schema({
    hash: {
        type: Schema.Types.String,
        required: true,
    },
    to: [{
        type: Schema.Types.String,
        required: true,
    }],
    by: {
        type: Schema.Types.String,
        required: true
    }
});

export default model('Sharing', sharingSchema);