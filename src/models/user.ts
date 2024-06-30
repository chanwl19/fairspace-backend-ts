import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'roles'
    }
  ]
},
  {
    timestamps: true,
  }
);

export const User = model('users', userSchema);