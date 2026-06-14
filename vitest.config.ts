import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// `import "server-only"` lança fora de um Server Component; nos testes (vitest)
// resolvemos o módulo para o stub vazio (empty.js) que o próprio pacote fornece
// — o mesmo arquivo que o Next.js usa sob a condição "react-server". Permite
// testar módulos server-only. O subpath "./empty" não está no exports do pacote,
// então apontamos direto para o arquivo.
export default defineConfig({
  resolve: {
    alias: {
      // Espelha o path "@/*" -> "./src/*" do tsconfig.json para o vitest.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
});
