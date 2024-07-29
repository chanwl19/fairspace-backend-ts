import { Role } from '../models/role';
import dotenv from 'dotenv';


dotenv.config();

interface BasicReturn {
    errorCode: number;
    errorMessage: string;
}

interface RoleReturn extends BasicReturn {
    roles: InstanceType<typeof Role>[];
}

export async function getRoles() {

    const roleReturn: RoleReturn = {
        roles: [],
        errorCode: 500,
        errorMessage: 'Error Occurs'
    };

    try {
        const roles = await Role.find().select('-endPoints');
        roleReturn.roles = roles;
        roleReturn.errorCode = 0;
        roleReturn.errorMessage = "";
    } catch {
        roleReturn.errorCode = 500;
        roleReturn.errorMessage = 'Error Occurs';
    }

    return roleReturn;
}
