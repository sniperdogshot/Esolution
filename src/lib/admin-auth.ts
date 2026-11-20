import { createServerFn } from "@tanstack/react-start";

console.log("[admin-auth.ts] Module loaded, registering server functions");

export const verifyAdminPasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    console.log("[Admin Auth] Validator received:", JSON.stringify(data));

    // Handle TanStack Start's RPC format: { data: { password: string } }
    let password: unknown;

    if (data && typeof data === "object" && "data" in data) {
      const inner = (data as { data: unknown }).data;
      if (inner && typeof inner === "object" && "password" in inner) {
        password = (inner as { password: unknown }).password;
      }
    } else if (data && typeof data === "object" && "password" in data) {
      // Direct format
      password = (data as { password: unknown }).password;
    }

    if (typeof password !== "string") {
      console.error("[Admin Auth] Invalid password format, received:", JSON.stringify(data));
      throw new Error("Formato inválido: esperado { password: string }");
    }

    return { password };
  })
  .handler(async ({ data }: { data: { password: string } }) => {
    console.log("[Admin Auth] Handler received:", data);
    const password = data.password;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validPassword) {
      throw new Error("Configuração de autenticação inválida");
    }

    return password === validPassword;
  });