import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      departement: string;
      nom: string;
      prenom: string;
    };
  }

  interface User {
    role: Role;
    departement: string;
    nom: string;
    prenom: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    departement: string;
    nom: string;
    prenom: string;
  }
}
