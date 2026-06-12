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
  "*": ["isAuthenticated"],
  "/runner/replicator/:nodeId": {
    "post": ["isAdmin"]
  },
  "/runner/control-row-generator/:nodeId": {
    "post": ["isAdmin"]
  },
  "/runner/node-setup/:nodeId": {
    "post": ["isAdminOrManager"]
  },
  "/webhooks/pms": {
  //  "post": ["isExternal"]
  },
  "/webhooks/odoo": {
    "post": ["isExternal"]
  },
  "/webhooks/pms/:webhookId": {
    "put": ["isAdmin"]
  },
  "/guests/:room": {
    "get": ["isExternal"]
  },
  "/cron/:name/status": {
    "get": ["isAdmin"]
  },
  "/cron/:name/start": {
    "post": ["isAdmin"]
  },
  "/cron/:name/stop": {
    "post": ["isAdmin"]
  },
  "/cron/:name": {
    "delete": ["isAdmin"]
  },
  "/cron": {
    "get": ["isAdmin"]
  },
  "/cron/:id": {
    "get": ["isAdmin"]
  },
  "/queue/tasks": {
    "get": ["isAdmin"]
  },
}
