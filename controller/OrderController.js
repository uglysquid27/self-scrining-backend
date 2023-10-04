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
        namaLengkap,
        alamat,
        phone,
        nik,
        work,
        born,
        gender,
        batuk,
        bb,
        demam,
        lemas,
        keringat,
        sesak,
        getah,
        lainnya
      } = req.body;
      const schema = {
        namaLengkap: { type: "string", optional: false },
        alamat: { type: "string", optional: false },
        phone: { type: "string", optional: false },
        nik: { type: "string", optional: false },
        work: { type: "string", optional: false },
        born: { type: "string", optional: false },
        gender: { type: "string", optional: false },
        batuk: { type: "string", optional: false },
        bb: { type: "string", optional: false },
        demam: { type: "string", optional: false },
        lemas: { type: "string", optional: false },
        keringat: { type: "string", optional: false },
        sesak: { type: "string", optional: false },
        getah: { type: "string", optional: false },
        lainnya: { type: "string", optional: false },
      };
      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(validate);
      }
      const order = await Order.create({
        namaLengkap,
        alamat,
        phone,
        nik,
        work,
        born,
        gender,
        batuk,
        bb,
        demam,
        lemas,
        keringat,
        sesak,
        getah,
        lainnya
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
  },
  getOrderByStatus: async (req, res) => { 
    try {
      const { driverId } = req.params;
      const orderInstantPicked = await Order.findAll({
        where: {
          driverId,
          status: "picked",
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
      const orderScheduledPicked = await Order.findAll({
        where: {
          driverId,
          status: "picked",
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
      const orderInstantDone = await Order.findAll({
        where: {
          driverId,
          status: "done",
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
      })
      const orderScheduledDone = await Order.findAll({
        where: {
          driverId,
          status: "done",
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
      })
      // if (!order) {
      //   return res.status(400).json({ message: "Order not found" });
      // }
      res.status(200).json({ orderInstantPicked, orderScheduledPicked, orderInstantDone, orderScheduledDone });
    } catch (error) {
      console.log(error);
    }
  }
};
