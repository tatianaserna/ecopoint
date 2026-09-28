import { Repository } from "typeorm";
import { User, User as UserDomain } from "../../domain/User";
import { User as UserEntity } from "../entities/User";
import { UserPort } from "../../domain/port/UserPort";
import { AppDataSource, connectToDatabase } from "../config/data-base";

export class UserAdapter implements UserPort {

    // Método asíncrono que garantiza la conexión antes de obtener el repositorio
    private async getRepository(): Promise<Repository<UserEntity>> {
        await connectToDatabase();
        return AppDataSource.getRepository(UserEntity);
    }

    // Transformar UserEntity a UserDomain
    private toDomain(userEntity: UserEntity): UserDomain {
        return {
            id: userEntity.id_user,
            name: userEntity.name_user,
            email: userEntity.email_user,
            password: userEntity.password_user,
            status: userEntity.status_user,
            roleId: userEntity.role_id,
        };
    }

    private toEntity(userDomain: Omit<UserDomain, "id">): UserEntity {
        const userEntity = new UserEntity();
        userEntity.name_user = userDomain.name;
        userEntity.email_user = userDomain.email;
        userEntity.password_user = userDomain.password;
        userEntity.status_user = userDomain.status;
        userEntity.role_id = userDomain.roleId ?? 2;
        return userEntity;
    }

    async createUser(user: Omit<UserDomain, "id">): Promise<number> {
        try {
            const repo = await this.getRepository();
            const newUser = this.toEntity(user);
            const savedUser = await repo.save(newUser);
            return savedUser.id_user;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }

    async updateUser(id: number, user: Partial<UserDomain>): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existingUser = await repo.findOne({ where: { id_user: id } });
            if (!existingUser) return false;

            Object.assign(existingUser, {
                name_user: user.name ?? existingUser.name_user,
                email_user: user.email ?? existingUser.email_user,
                password_user: user.password ?? existingUser.password_user,
                status_user: user.status ?? existingUser.status_user,
                role_id: user.roleId ?? existingUser.role_id,
            });

            await repo.save(existingUser);
            return true;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existingUser = await repo.findOne({ where: { id_user: id } });
            if (!existingUser) return false;

            Object.assign(existingUser, { status_user: 0 });
            await repo.save(existingUser);
            return true;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }

    async getUserById(id: number): Promise<User | null> {
        try {
            const repo = await this.getRepository();
            const user = await repo.findOne({ where: { id_user: id } });
            return user ? this.toDomain(user) : null;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const repo = await this.getRepository();
            const user = await repo.findOne({ where: { email_user: email } });
            if (!user) return null;
            return this.toDomain(user);
        } catch (error) {
            console.error("Error fetching user by email:", error);
            throw error;
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const repo = await this.getRepository();
            const users = await repo.find({ where: { status_user: 1 } });
            return users.map((user) => this.toDomain(user));
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    }
}
