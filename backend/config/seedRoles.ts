import roles from "../models/role.model";

/**
 * Seeds default roles and permissions into the database if they do not exist.
 * This is called automatically when the database connection is established.
 */
export const seedRoles = async (): Promise<void> => {
    try {
        const defaultRoles: Array<{ role: "USER" | "ADMIN" | "SUPER_ADMIN"; permissions: string[] }> = [
            {
                role: "USER",
                permissions: ["read:product"]
            },
            {
                role: "ADMIN",
                permissions: [
                    "read:product",
                    "write:product",
                    "read:order",
                    "write:order",
                    "read:user"
                ]
            },
            {
                role: "SUPER_ADMIN",
                permissions: ["all"]
            }
        ];

        for (const item of defaultRoles) {
            const exists = await roles.findOne({ role: item.role });
            if (!exists) {
                await roles.create(item);
                console.log(`Role ${item.role} successfully seeded.`);
            }
        }
    } catch (error) {
        console.error("Error during roles seeding:", error);
    }
};
