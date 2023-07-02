const { Order, DriverDetails, User } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");
const validator = require("fastest-validator");
const v = new validator();

module.exports = {
  index: async (req, res) => {
    try {
      const orderScheduled = await Order.findAll({
        where: {
          type: "scheduled",
        },
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      const orderInstant = await Order.findAll({
        where: {
          type: "instant",
        },
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      const order = await Order.findAll({
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      res.status(200).json({ orderScheduled, orderInstant, order });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  show: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  store: async (req, res) => {
    try {
      const {
        userId,
        destinationLocation,
        setOffLocation,
        status,
        type,
        numberOfPassenger,
        setOffDate,
      } = req.body;
      const schema = {
        userId: { type: "number", optional: false },
        destinationLocation: { type: "string", optional: false, max: 100 },
        status: { type: "string", optional: false },
        type: { type: "string", optional: false },
        numberOfPassenger: { type: "number", optional: false },
      };
      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(validate);
      }
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      if (user.role !== "customer") {
        return res
          .status(400)
          .json({ message: "Sorry, you are not a customer" });
      }
      const order = await Order.create({
        userId,
        destinationLocation,
        setOffLocation,
        status,
        type,
        numberOfPassenger,
        setOffDate,
      });
      res.status(200).json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  pickUp: async (req, res) => {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
      const driver = await DriverDetails.findOne({
        where: { userId: driverId },
      });

      // Validation
      if (order.status !== "open") {
        return res.status(400).json({ message: "Order is not available" });
      }
      if (!driver) {
        return res.status(400).json({ message: "Driver not found" });
      }
      if (driver.passengerTotal < order.numberOfPassenger) {
        return res
          .status(404)
          .json({ message: "Sorry, your passenger capacity not enough" });
      }
      if (driver.userId === order.userId) {
        return res
          .status(404)
          .json({ message: "You cannot pick up your own order" });
      }

      await order.update({
        status: "picked",
        driverId: driver.id,
      });
      res.status(200).json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  finishOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
      if (order.status !== "picked") {
        return res.status(400).json({ message: "Order is not picked" });
      }
      await order.update({
        status: "done",
      });
      res.status(200).json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  filterOrderBydate: async (req, res) => {
    try {
      const { date } = req.body;
      const order = await Order.findAll({
        where: {
          setOffDate: {
            [Op.between]: [
              moment(date).startOf("day"),
              moment(date).endOf("day"),
            ],
          },
          status: "open",
        },
      });
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  destroy: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
      await order.destroy();
      res.status(200).json({ message: "Order deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getOrderByUserId: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findAll({
        where: { userId: id },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      const scheduled = await Order.findAll({
        where: {
          userId: id,
          type: "scheduled",
          // status not equal open
          status: {
            [Op.ne]: "canceled",
          },
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      const instant = await Order.findAll({
        where: {
          userId: id,
          type: "instant",
          status: {
            [Op.ne]: "canceled",
          },
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });

      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
      res.status(200).json({ order, scheduled, instant });
    } catch (error) {
      console.log(error);
    }
  },

  cancelingOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
      if (order.status !== "open") {
        return res.status(400).json({ message: "Order is not available" });
      }
      await order.update({
        status: "canceled",
      });
      res.status(200).json(order);
    } catch (error) {
      console.log(error);
    }
  },

  getOrderOpen: async (req, res) => { 
    try {
      const orderInstant = await Order.findAll({
        where: {
          status: "open",
          type: "instant",
        },
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      const orderScheduled = await Order.findAll({
        where: {
          status: "open",
          type: "scheduled",
        },
        include: [
          {
            model: DriverDetails,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["password", "createdAt", "updatedAt"],
                },
              },
            ],
          },
          {
            model: User,
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });
      // if (!order) {
      //   return res.status(400).json({ message: "Order not found" });
      // }
      res.status(200).json({ orderInstant, orderScheduled });
    } catch (error) {
      console.log(error);
    }
  }
};
