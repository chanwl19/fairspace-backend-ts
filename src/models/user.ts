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
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  middleName: {
    type: String
  },
  phoneNo: {
    type: String
  },
  image: {
    type: String
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