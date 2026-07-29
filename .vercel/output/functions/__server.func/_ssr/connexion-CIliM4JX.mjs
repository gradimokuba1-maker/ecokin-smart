import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connexion-CIliM4JX.js
var $$splitComponentImporter = () => import("./connexion-CrvcPuRI.mjs");
var Route = createFileRoute("/autorite/connexion")({
	validateSearch: (search) => {
		const role = search.role;
		return { role: [
			"gouverneur",
			"bourgmestre",
			"admin",
			"agent"
		].includes(role) ? role : "agent" };
	},
	head: () => ({ meta: [
		{ title: "Connexion autorité — EcoKin Smart" },
		{
			name: "description",
			content: "Connexion sécurisée aux tableaux de bord EcoKin Smart."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
