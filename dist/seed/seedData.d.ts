export interface SeedUser {
    fullName: string;
    email: string;
    interests: string[];
}
export declare const demoPassword = "Articulink123";
export interface SeedArticle {
    title: string;
    author: string;
    summary: string;
    tags: string[];
    content: string;
    hoursAgo: number;
    popularity: number;
}
export declare const seedUsers: SeedUser[];
export declare const seedArticles: SeedArticle[];
//# sourceMappingURL=seedData.d.ts.map