"use server";
import { z } from "zod";
import { AUTH_USERS, type Role } from "./access-store";

const loginSchema = z.object({
    role: z.enum(["gouverneur", "bourgmestre", "admin", "agent"]),
    identifier: z.string(),
    password: z.string(),
});

export const loginAuthority = async ({ data }: { data: z.infer<typeof loginSchema> }) => {
    const { role, identifier, password } = loginSchema.parse(data);

    const userAuth = AUTH_USERS[role as Exclude<Role, "citoyen">];

    if (userAuth && userAuth.identifier === identifier && userAuth.password === password) {
        // Dans un vrai projet, on retournerait un token JWT ici.
        // Pour la simulation, on retourne les infos de l'utilisateur.
        return {
            success: true,
            user: {
                role: role,
                name: userAuth.name,
            },
        };
    }

    throw new Error("Identifiant ou mot de passe incorrect.");
};