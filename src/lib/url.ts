// Prefix internal paths with the deploy base (e.g. "/gridflow.tech/" on github.io).
export const u = (path: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
};
