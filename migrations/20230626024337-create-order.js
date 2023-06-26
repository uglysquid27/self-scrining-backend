"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      driverId: {
        type: Sequelize.INTEGER,
        references: {
          model: "DriverDetails",
          key: "id",
        },
      },
      setOffLocation: {
        type: Sequelize.STRING,
      },
      setOffDate: {
        type: Sequelize.DATE,
      },
      destinationLocation: {
        type: Sequelize.STRING,
      },
      numberOfPassenger: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["open", "booked", "done"],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
  },
};
