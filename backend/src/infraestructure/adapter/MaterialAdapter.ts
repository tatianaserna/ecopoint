import { Repository } from "typeorm";
import { Material as MaterialDomain } from "../../domain/Material";
import { Material as MaterialEntity } from "../entities/Material";
import { MaterialPort } from "../../domain/port/MaterialPort";
import { AppDataSource, connectToDatabase } from "../config/data-base";

export class MaterialAdapter implements MaterialPort {
    // Método asíncrono para garantizar la conexión a la base de datos antes de obtener el repositorio
    private async getRepository(): Promise<Repository<MaterialEntity>> {
        await connectToDatabase();
        return AppDataSource.getRepository(MaterialEntity);
    }

    private toDomain(entity: MaterialEntity): MaterialDomain {
        return {
            id: entity.id_material,
            name: entity.name_material,
            category: entity.category_material ?? "",
            status: entity.status_material,
        };
    }

    private toEntity(domain: Omit<MaterialDomain, "id">): MaterialEntity {
        const entity = new MaterialEntity();
        entity.name_material = domain.name;
        entity.category_material = domain.category;
        entity.status_material = domain.status;
        return entity;
    }

    async createMaterial(material: Omit<MaterialDomain, "id">): Promise<number> {
        try {
            const repo = await this.getRepository();
            const saved = await repo.save(this.toEntity(material));
            return saved.id_material;
        } catch (error) {
            console.error("Error creating material:", error);
            throw error;
        }
    }

    async updateMaterial(id: number, material: Partial<MaterialDomain>): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existing = await repo.findOne({ where: { id_material: id } });
            if (!existing) return false;

            Object.assign(existing, {
                name_material: material.name ?? existing.name_material,
                category_material: material.category ?? existing.category_material,
                status_material: material.status ?? existing.status_material,
            });

            await repo.save(existing);
            return true;
        } catch (error) {
            console.error("Error updating material:", error);
            throw error;
        }
    }

    async deleteMaterial(id: number): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existing = await repo.findOne({ where: { id_material: id } });
            if (!existing) return false;
            Object.assign(existing, { status_material: 0 });
            await repo.save(existing);
            return true;
        } catch (error) {
            console.error("Error deleting material:", error);
            throw error;
        }
    }

    async getMaterialById(id: number): Promise<MaterialDomain | null> {
        try {
            const repo = await this.getRepository();
            const material = await repo.findOne({ where: { id_material: id } });
            return material ? this.toDomain(material) : null;
        } catch (error) {
            console.error("Error fetching material by ID:", error);
            throw error;
        }
    }

    async getMaterialByName(name: string): Promise<MaterialDomain | null> {
        try {
            const repo = await this.getRepository();
            const material = await repo.findOne({ where: { name_material: name } });
            return material ? this.toDomain(material) : null;
        } catch (error) {
            console.error("Error fetching material by name:", error);
            throw error;
        }
    }

    async getAllMaterials(): Promise<MaterialDomain[]> {
        try {
            const repo = await this.getRepository();
            const materials = await repo.find({ where: { status_material: 1 } });
            return materials.map((m) => this.toDomain(m));
        } catch (error) {
            console.error("Error fetching all materials:", error);
            throw error;
        }
    }
}
