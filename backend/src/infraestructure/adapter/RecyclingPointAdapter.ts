import { Repository } from "typeorm";
import { RecyclingPoint as RecyclingPointDomain } from "../../domain/RecyclingPoint";
import { RecyclingPoint as RecyclingPointEntity } from "../entities/RecyclingPoint";
import { Material } from "../entities/Material";
import { RecyclingPointPort } from "../../domain/port/RecyclingPointPort";
import { AppDataSource, connectToDatabase } from "../config/data-base";

export class RecyclingPointAdapter implements RecyclingPointPort {
    // Métodos asíncronos para garantizar la conexión antes de obtener los repositorios
    private async getPointRepository(): Promise<Repository<RecyclingPointEntity>> {
        await connectToDatabase();
        return AppDataSource.getRepository(RecyclingPointEntity);
    }

    private async getMaterialRepository(): Promise<Repository<Material>> {
        await connectToDatabase();
        return AppDataSource.getRepository(Material);
    }

    private toDomain(pointEntity: RecyclingPointEntity): RecyclingPointDomain {
        return {
            id: pointEntity.id_point,
            materialId: pointEntity.material_id ?? null,
            name: pointEntity.name_point,
            address: pointEntity.address_point ?? "",
            latitude: Number(pointEntity.latitude),
            longitude: Number(pointEntity.longitude),
            status: pointEntity.status_point,
        };
    }

    private toEntity(pointDomain: Omit<RecyclingPointDomain, "id">): RecyclingPointEntity {
        const pointEntity = new RecyclingPointEntity();
        pointEntity.material_id = pointDomain.materialId;
        pointEntity.name_point = pointDomain.name;
        pointEntity.address_point = pointDomain.address;
        pointEntity.latitude = pointDomain.latitude;
        pointEntity.longitude = pointDomain.longitude;
        pointEntity.status_point = pointDomain.status;
        return pointEntity;
    }

    async materialExists(materialId: number): Promise<boolean> {
        const repo = await this.getMaterialRepository();
        const material = await repo.findOne({
            where: { id_material: materialId, status_material: 1 },
        });
        return material !== null;
    }

    async createPoint(point: Omit<RecyclingPointDomain, "id">): Promise<number> {
        try {
            const repo = await this.getPointRepository();
            const newPoint = this.toEntity(point);
            const savedPoint = await repo.save(newPoint);
            return savedPoint.id_point;
        } catch (error) {
            console.error("Error creating recycling point:", error);
            throw error;
        }
    }

    async updatePoint(id: number, point: Partial<RecyclingPointDomain>): Promise<boolean> {
        try {
            const repo = await this.getPointRepository();
            const existingPoint = await repo.findOne({ where: { id_point: id } });
            if (!existingPoint) return false;

            Object.assign(existingPoint, {
                material_id: point.materialId !== undefined
                    ? point.materialId ?? null
                    : existingPoint.material_id,
                name_point: point.name ?? existingPoint.name_point,
                address_point: point.address ?? existingPoint.address_point,
                latitude: point.latitude ?? existingPoint.latitude,
                longitude: point.longitude ?? existingPoint.longitude,
                status_point: point.status ?? existingPoint.status_point,
            });

            await repo.save(existingPoint);
            return true;
        } catch (error) {
            console.error("Error updating recycling point:", error);
            throw error;
        }
    }

    async deletePoint(id: number): Promise<boolean> {
        try {
            const repo = await this.getPointRepository();
            const existingPoint = await repo.findOne({ where: { id_point: id } });
            if (!existingPoint) return false;

            Object.assign(existingPoint, { status_point: 0 });
            await repo.save(existingPoint);
            return true;
        } catch (error) {
            console.error("Error deleting recycling point:", error);
            throw error;
        }
    }

    async getPointById(id: number): Promise<RecyclingPointDomain | null> {
        try {
            const repo = await this.getPointRepository();
            const point = await repo.findOne({ where: { id_point: id } });
            return point ? this.toDomain(point) : null;
        } catch (error) {
            console.error("Error fetching recycling point by ID:", error);
            throw error;
        }
    }

    async getAllPoints(): Promise<RecyclingPointDomain[]> {
        try {
            const repo = await this.getPointRepository();
            const points = await repo.find({ where: { status_point: 1 } });
            return points.map((point) => this.toDomain(point));
        } catch (error) {
            console.error("Error fetching all recycling points:", error);
            throw error;
        }
    }
}
