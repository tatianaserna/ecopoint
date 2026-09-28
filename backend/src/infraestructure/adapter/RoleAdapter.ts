import { Repository } from "typeorm";
import { Role as RoleDomain } from "../../domain/Role";
import { Role as RoleEntity } from "../entities/Role";
import { RolePort } from "../../domain/port/RolePort";
import { AppDataSource, connectToDatabase } from "../config/data-base";

export class RoleAdapter implements RolePort {
    // Método asíncrono que garantiza la conexión antes de obtener el repositorio
    private async getRepository(): Promise<Repository<RoleEntity>> {
        await connectToDatabase();
        return AppDataSource.getRepository(RoleEntity);
    }

    private toDomain(entity: RoleEntity): RoleDomain {
        return {
            id: entity.id_role,
            name: entity.name_role,
            status: entity.status_role,
        };
    }

    private toEntity(domain: Omit<RoleDomain, "id">): RoleEntity {
        const entity = new RoleEntity();
        entity.name_role = domain.name;
        entity.status_role = domain.status;
        return entity;
    }

    async createRole(role: Omit<RoleDomain, "id">): Promise<number> {
        try {
            const repo = await this.getRepository();
            const saved = await repo.save(this.toEntity(role));
            return saved.id_role;
        } catch (error) {
            console.error("Error creating role:", error);
            throw error;
        }
    }

    async updateRole(id: number, role: Partial<RoleDomain>): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existing = await repo.findOne({ where: { id_role: id } });
            if (!existing) return false;

            Object.assign(existing, {
                name_role: role.name ?? existing.name_role,
                status_role: role.status ?? existing.status_role,
            });

            await repo.save(existing);
            return true;
        } catch (error) {
            console.error("Error updating role:", error);
            throw error;
        }
    }

    async deleteRole(id: number): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existing = await repo.findOne({ where: { id_role: id } });
            if (!existing) return false;
            Object.assign(existing, { status_role: 0 });
            await repo.save(existing);
            return true;
        } catch (error) {
            console.error("Error deleting role:", error);
            throw error;
        }
    }

    async getRoleById(id: number): Promise<RoleDomain | null> {
        try {
            const repo = await this.getRepository();
            const role = await repo.findOne({ where: { id_role: id } });
            return role ? this.toDomain(role) : null;
        } catch (error) {
            console.error("Error fetching role by ID:", error);
            throw error;
        }
    }

    async getRoleByName(name: string): Promise<RoleDomain | null> {
        try {
            const repo = await this.getRepository();
            const role = await repo.findOne({ where: { name_role: name } });
            return role ? this.toDomain(role) : null;
        } catch (error) {
            console.error("Error fetching role by name:", error);
            throw error;
        }
    }

    async getAllRoles(): Promise<RoleDomain[]> {
        try {
            const repo = await this.getRepository();
            const roles = await repo.find({ where: { status_role: 1 } });
            return roles.map((r) => this.toDomain(r));
        } catch (error) {
            console.error("Error fetching all roles:", error);
            throw error;
        }
    }
}
