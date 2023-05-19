module.exports = (sequelize, DataTypes) => {
    const Poll_option = sequelize.define("poll_option", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    });
    return Poll_option;
  };
  