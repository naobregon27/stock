require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DB_USER, DB_PASSWORD, DB_HOST, DB_RENDER } = process.env;

const sequelize = new Sequelize("controlstock", DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  logging: false,
  native: false,
  ssl: true,
});

// // //! este sequelize es para RENDERIZADO... DEPLOY DB en render.s.

// const sequelize = new Sequelize("postgresql://postgress:pBjYQoFc3mcW6lv4HbKrSOd57KdJlLY0@dpg-cqqj5sl6l47c73avhvqg-a/stock_0h8m", {
//   logging: false,
//   native: false,
//   dialectOptions: {
//     ssl: {
//       require: true, // Asegura que SSL está habilitado
//       rejectUnauthorized: false // Permite aceptar certificados autofirmados
//     }
//   },
// });

const basename = path.basename(__filename);
const modelDefiners = [];

fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

modelDefiners.forEach((model) => model(sequelize, DataTypes));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

const { Producto, User, Role, Ventas } = sequelize.models;


//establecer la relacion entre user y role
User.belongsToMany(Role, { through: 'user_roles' });
Role.belongsToMany(User, { through: 'user_roles' });

// Establecer relaciones entre Producto y Ventas
Producto.hasMany(Ventas, { foreignKey: 'productoId', as: 'ventas' });
Ventas.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};