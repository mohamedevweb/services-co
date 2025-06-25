import {
    pgTable,
    varchar,
    integer,
    decimal,
    boolean,
    timestamp,
    primaryKey,
    pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("role", ["ADMIN", "ORG", "PRESTA", "USER"]);
export const jobEnum = pgEnum("job", [
    "DEVELOPMENT",
    "DESIGN",
    "MARKETING",
    "HUMAN_RESOURCES",
    "SALES",
]);

// Tables

export const users = pgTable("users", {
    id: integer("Id_users").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email", { length: 50 }),
    password: varchar("password", { length: 50 }),
    role: userRoleEnum("role"),
    siret: varchar("siret", { length: 50 }),
});

export const prestataire = pgTable("prestataire", {
    id: integer("Id_prestataire").primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar("first_name", { length: 50 }),
    name: varchar("name", { length: 50 }),
    job: jobEnum("job"),
    description: varchar("description", { length: 50 }),
    experienceTime: integer("experience_time"),
    studyLevel: integer("study_level"),
    city: varchar("city", { length: 50 }),
    tjm: decimal("tjm", { precision: 15, scale: 2 }),
    userId: integer("Id_users").notNull().references(() => users.id),
});

export const organization = pgTable("organization", {
    id: integer("Id_organization").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 50 }),
    adresse: varchar("adresse", { length: 50 }),
    solde: decimal("solde", { precision: 15, scale: 2 }),
    tel: varchar("tel", { length: 50 }),
    userId: integer("Id_users").notNull().references(() => users.id),
});

export const project = pgTable("project", {
    id: integer("Id_project").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 50 }),
    description: varchar("description", { length: 50 }),
    organizationId: integer("Id_organization").notNull().references(() => organization.id),
});

export const path = pgTable("path", {
    id: integer("Id_path").primaryKey().generatedAlwaysAsIdentity(),
    isChoose: boolean("isChoose"),
    number: integer("number"),
    projectId: integer("Id_project").notNull().references(() => project.id),
});

export const aiTranslate = pgTable("ai_translate", {
    id: integer("Id_ai_translate").primaryKey().generatedAlwaysAsIdentity(),
    content: varchar("content", { length: 50 }),
    contentTranslate: varchar("content_translate", { length: 50 }),
    organizationId: integer("Id_organization").notNull().references(() => organization.id),
});

export const skill = pgTable("skill", {
    id: integer("Id_skill").primaryKey().generatedAlwaysAsIdentity(),
    description: varchar("description", { length: 50 }),
    prestataireId: integer("Id_prestataire").notNull().references(() => prestataire.id),
});

export const diploma = pgTable("diploma", {
    id: integer("Id_diploma").primaryKey().generatedAlwaysAsIdentity(),
    description: varchar("description", { length: 50 }),
    prestataireId: integer("Id_prestataire").notNull().references(() => prestataire.id),
});

export const experience = pgTable("experience", {
    id: integer("Id_experience").primaryKey().generatedAlwaysAsIdentity(),
    description: varchar("description", { length: 50 }),
    prestataireId: integer("Id_prestataire").notNull().references(() => prestataire.id),
});

export const languages = pgTable("languages", {
    id: integer("Id_languages").primaryKey().generatedAlwaysAsIdentity(),
    description: varchar("description", { length: 50 }), // corrigé ici
    prestataireId: integer("Id_prestataire").notNull().references(() => prestataire.id),
});

export const contract = pgTable("contract", {
    id: integer("Id_contract").primaryKey().generatedAlwaysAsIdentity(),
    numContract: varchar("num_contract", { length: 50 }),
    prestataireId: integer("Id_prestataire").notNull().references(() => prestataire.id),
    projectId: integer("Id_project").notNull().references(() => project.id),
});

export const message = pgTable(
    "message",
    {
        prestataireId: integer("Id_prestataire").notNull().references(() => prestataire.id),
        organizationId: integer("Id_organization").notNull().references(() => organization.id),
        createAt: timestamp("createAt"),
        content: varchar("content", { length: 50 }),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.prestataireId, table.organizationId] }),
    })
);

export const pathPrestataire = pgTable(
    "path_prestataire",
    {
        prestataireId: integer("Id_prestataire").notNull().references(() => prestataire.id),
        pathId: integer("Id_path").notNull().references(() => path.id),
        isApproved: boolean("isApproved"),
        nbDays: integer("nb_days"),
        name: varchar("name", { length: 50 }),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.prestataireId, table.pathId] }),
    })
);

export const schema = {
    users,
    prestataire,
    organization,
    project,
    path,
    aiTranslate,
    skill,
    diploma,
    experience,
    languages,
    contract,
    message,
    pathPrestataire,
};