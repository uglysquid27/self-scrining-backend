module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", { timestamps: false });
  const DriverDetails = sequelize.define("DriverDetails", {
    timestamps: false,
  });
  const User = sequelize.define(
    "User",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      gender: {
        type: DataTypes.ENUM,
        values: ["Male", "Female"],
      },
      telephone: {
        type: DataTypes.STRING,
        defaultValue: "-",
      },
      age: {
        type: DataTypes.INTEGER,
      },
      password: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "customer",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "Users",
    }
  );
  User.hasMany(Order, { foreignKey: "userId" });
  User.hasMany(DriverDetails, { foreignKey: "userId" });
  return User;
};
