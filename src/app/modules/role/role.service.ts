// src/modules/role/role.service.ts
import { Role } from "./role.model";
import { IRole } from "./role.model";

const createRole = async (data: IRole): Promise<IRole> => {
  return await Role.create(data);
};

const getRoles = async (): Promise<IRole[]> => {
  return await Role.find();
};

export const RoleService = {
  createRole,
  getRoles,
};
