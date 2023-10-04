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
      namaLengkap: {
        type: DataTypes.STRING,
      },
      alamat: {
        type: DataTypes.DATE,
      },
      phone: {
        type: DataTypes.STRING,
      },
      nik: {
        type: DataTypes.INTEGER,
      },
      work: {
        type: DataTypes.INTEGER,
      },
      born: {
        type: DataTypes.INTEGER,
      },
      gender: {
        type: DataTypes.INTEGER,
      },
      batuk: {
        type: DataTypes.INTEGER,
      },
      bb: {
        type: DataTypes.INTEGER,
      },
      demam: {
        type: DataTypes.INTEGER,
      },
      lemas: {
        type: DataTypes.INTEGER,
      },
      keringat: {
        type: DataTypes.INTEGER,
      },
      sesak: {
        type: DataTypes.INTEGER,
      },
      getah: {
        type: DataTypes.INTEGER,
      },
      lainnya: {
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
      tableName: "Orders",
    }
  );
  // Order.belongsTo(User, { foreignKey: "userId" });
  // Order.belongsTo(DriverDetails, { foreignKey: "driverId" });
  return Order;
};
