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
    menu: String,
    component: String,
    path: String
  }]
},
  {
    timestamps: true,
  }
);

export const Role = model('roles', roleSchema);