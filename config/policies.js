// Este archivo declara las policies que deben ser aplicadas para cada 
// ruta.
// El objeto tiene la forma 
// {
//   "ruta": {
//     "metodo1": ["policie1", "policie2"],
//     "metodo2": ["policie1", "policie2"],
//     ...
//   }
// }
// Las rutas que no estén declaradas quedarán sin cubrir

// Primero se aplicarán las policies generales (declaradas en '*'), luego se
// intentarán aplicar las policies declaradas en METHOD_HTTP, y si estas últimas 
// no estuvieran definidas, se intentará aplicar las declaradas en '*' dentro de
// la ruta

module.exports = {
  // Apply isAuthenticated to every route by default.
  // Remove or adjust this if your app has public endpoints.
  "*": ["isAuthenticated"],

  // Per-route overrides — uncomment and adapt as needed:
  // "/products": {
  //   "post":   ["isAdmin"],
  //   "delete": ["isAdmin"],
  // },
  // "/products/:id": {
  //   "patch":  ["isAdmin"],
  // },
};
