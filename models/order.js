module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", { timestamps: false });
  const DriverDetails = sequelize.define("DriverDetails", {
    timestamps: false,
  });
  const Order = sequelize.define(
    "Order",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      driverId: {
        type: DataTypes.INTEGER,
        references: {
          model: "DriverDetails",
          key: "id",
        },
      },
      setOffLocation: {
        type: DataTypes.STRING,
      },
      setOffDate: {
        type: DataTypes.DATE,
      },
      destinationLocation: {
        type: DataTypes.STRING,
      },
      numberOfPassenger: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["open", "booked", "done"],
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
      tableName: "Orders",
    }
  );
  Order.belongsTo(User, { foreignKey: "userId" });
  Order.belongsTo(DriverDetails, { foreignKey: "driverId" });
  return Order;
};
