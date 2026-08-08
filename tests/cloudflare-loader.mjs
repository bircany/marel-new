export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    const source = `
      const statement = () => ({
        bind() { return this; },
        async run() { return { success: true }; },
        async first() { return { count: 1 }; },
        async all() { return { results: [] }; }
      });
      export const env = {
        DB: {
          prepare() { return statement(); },
          async batch(items) { return items.map(() => ({ success: true })); }
        }
      };
    `;
    return {
      url: `data:text/javascript,${encodeURIComponent(source)}`,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
