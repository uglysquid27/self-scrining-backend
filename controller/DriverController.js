const { DriverDetails, User } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const moment = require("moment");
const validator = require("fastest-validator");
const v = new validator();

module.exports = {
  index: async (req, res) => {
    try {
      const drivers = await DriverDetails.findAll({
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      res.status(200).json(drivers);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  store: async (req, res) => {
    try {
      const { userId, carPlateNumber, drivingLicenseNumber, passengerTotal } =
        req.body;
      const schema = {
        userId: { type: "string", optional: false },
        carPlateNumber: { type: "string", optional: false, max: 100 },
        drivingLicenseNumber: { type: "string", optional: false, max: 100 },
        passengerTotal: { type: "string", optional: false },
      };
      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(validate);
      }
      const user = await User.findOne({ where: { id: userId } });

      // Validation user
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      if (user.role !== "driver") {
        return res.status(400).json({ message: "Sorry, you are not a driver" });
      }
      const driver = await DriverDetails.findOne({ where: { userId } });

      // Validation driver
      if (driver) {
        return res.status(400).json({ message: "Driver already registered" });
      }
      if (req.file) {
        const uniqueName =
          moment().format("YYYYMMDDHHmm") + "-" + req.file.originalname;
        req.body.carPicture = `/uploads/${uniqueName}`;
      }
      const newDriver = await DriverDetails.create(req.body);
      res.status(200).json({ message: "Driver registered" });
    } catch (error) {
      console.log(error);
    }
  },
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const driver = await DriverDetails.findOne({
        where: { id },
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      if (!driver) {
        return res.status(400).json({ message: "Driver not found" });
      }
      res.status(200).json(driver);
    } catch (error) {
      console.log(error);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const driver = await DriverDetails.findOne({ where: { id } });
      if (!driver) {
        return res.status(400).json({ message: "Driver not found" });
      }
      const schema = {
        carPlateNumber: { type: "string", optional: false, max: 100 },
        drivingLicenseNumber: { type: "string", optional: false, max: 100 },
        passengerTotal: { type: "string", optional: false },
      };
      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(validate);
      }
      if (req.file) {
        const uniqueName =
          moment().format("YYYYMMDDHHmm") + "-" + req.file.originalname;
        req.body.carPicture = `/uploads/${uniqueName}`;
        if (driver.carPicture) {
          fs.unlinkSync(`public${driver.carPicture}`);
        }
      }
      const updateDriver = await DriverDetails.update(req.body, {
        where: { id },
      });
      res.status(200).json({ message: "Driver updated" });
    } catch (error) {
      console.log(error);
    }
  },
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const driver = await DriverDetails.findOne({ where: { id } });
      if (!driver) {
        return res.status(400).json({ message: "Driver not found" });
      }
      if (driver.carPicture) {
        fs.unlinkSync(`public${driver.carPicture}`);
      }
      const deleteDriver = await DriverDetails.destroy({ where: { id } });
      res.status(200).json({ message: "Driver deleted" });
    } catch (error) {
      console.log(error);
    }
  },
};
