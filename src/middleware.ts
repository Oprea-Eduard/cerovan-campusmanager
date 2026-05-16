import { withAuth } from "next-auth/middleware";

const roleRoutes: Record<string, string[]> = {
  "/dashboard/plati": ["CONDUCERE", "CONTABILITATE"],
  "/dashboard/rapoarte": ["CONDUCERE", "CONTABILITATE"],
  "/dashboard/cursuri": ["CONDUCERE", "PROGRAMARE"],
  "/dashboard/cereri": ["CONDUCERE", "ADMINISTRATIV", "PROGRAMARE"],
  "/dashboard/cursanti": ["CONDUCERE", "ADMINISTRATIV", "PROGRAMARE"],
  "/dashboard/documente": ["PROGRAMARE", "ADMINISTRATIV"],
  "/dashboard/camere": ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"],
  "/dashboard/checkinout": ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"],
  "/dashboard/housekeeping": ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE", "CAMERISTA"],
  "/dashboard/calendar": ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"],
  "/dashboard/night-audit": ["CONDUCERE", "ADMINISTRATIV"],
  "/dashboard/parcare": ["CONDUCERE", "ADMINISTRATIV"],
  "/dashboard/obiecte-pierdute": ["CONDUCERE", "ADMINISTRATIV"],
  "/dashboard/rezervari": ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE", "PROGRAMARE"],
};

export default withAuth({
  callbacks: {
    async authorized({ req, token }) {
      const path = req.nextUrl.pathname;
      if (path === "/login") return true;
      if (!token) return false;

      const role = token.role as string;
      const allowedRoutes = Object.entries(roleRoutes).filter(([route]) => path.startsWith(route));

      if (allowedRoutes.length === 0) return true; // route not in role config → allow if authed
      for (const [, roles] of allowedRoutes) {
        if (roles.includes(role)) return true;
      }

      // Try exact match
      if (roleRoutes[path] && !roleRoutes[path].includes(role)) return false;

      return true;
    },
  },
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
