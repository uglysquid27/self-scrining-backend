module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", { timestamps: false });
  const DriverDetails = sequelize.define(
    "DriverDetails",
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
      carPlateNumber: {
        type: DataTypes.STRING,
      },
      drivingLicenseNumber: {
        type: DataTypes.STRING,
      },
      carPicture: {
        type: DataTypes.STRING,
      },
      passengerTotal: {
        type: DataTypes.INTEGER,
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
      tableName: "DriverDetails",
    }
  );
  DriverDetails.belongsTo(User, { foreignKey: "userId" });
  return DriverDetails;
};
