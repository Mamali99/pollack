// module.exports = (sequelize, DataTypes) => {
//     const User = sequelize.define("user", {
//       name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//     });  
//     return User;
//   };
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    hooks: {
      beforeCreate: async (user, options) => {
        const maxId = await User.max('id') || 0;
        user.id = maxId + 1;
      },
    }
  });

  return User;
};
