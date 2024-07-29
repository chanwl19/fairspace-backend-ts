import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
  roleId: {
    type: Number,
    required: true
  },
  roleName: {
    type: String,
    required: true
  },
  endPoints: [{
    type: String
  }],
  pages: [{
    path: {type: String, required: true}
  }]
},
  {
    timestamps: true,
  }
);

export const Role = model('roles', roleSchema);