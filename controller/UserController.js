const { User } = require("../models");
const bcrypt = require("bcryptjs");
const validator = require("fastest-validator");
const v = new validator();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
dotenv.config();

module.exports = {
  register: async (req, res) => {
    try {
      const schema = {
        name: { type: "string", optional: false, max: 100 },
        email: { type: "email", optional: false, max: 100 },
        password: { type: "string", optional: false, max: 100, min: 6 },
        confirmPassword: { type: "equal", field: "password" },
      };
      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(validate);
      }
      const { name, email, password, confirmPassword, role } = req.body;
      const checkEmail = await User.findOne({ where: { email } });
      if (checkEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const nameFound = await User.findOne({ where: { name } });
      if (nameFound) {
        return res.status(400).json({ message: "Name already exists" });
      }
      const passwordHashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: passwordHashed,
        role,
      });
      return res.status(201).json({ message: "User created" });
    } catch (error) {
      console.log(error);
    }
  },
  login: async (req, res) => {
    try {
      const schema = {
        email: { type: "email", optional: false, max: 100 },
        password: { type: "string", optional: false, max: 100, min: 6 },
      };
      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(validate);
      }
      const { email, password } = req.body;
      const user = await User.findOne({
        where: { email, isActive: 1 },
      });
      if (!user) {
        return res.status(400).json({ message: "Email not found" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password or email" });
      }
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
        process.env.SECRET_KEY
      );
      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
    }
  },
  getAll: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      const admin = await User.findAll({
        where: { role: "admin" },
        attributes: { exclude: ["password"] },
      });
      const driver = await User.findAll({
        where: { role: "driver" },
        attributes: { exclude: ["password"] },
      });
      const customer = await User.findAll({
        where: { role: "customer" },
        attributes: { exclude: ["password"] },
      });
      return res.status(200).json({ users, admin, driver, customer });
    } catch (error) {
      console.log(error);
    }
  },
  showUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ["password"] },
      });
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
    }
  },
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const schema = {
        name: { type: "string", optional: false, max: 100 },
        email: { type: "email", optional: false, max: 100 },
        telephone: { type: "string", optional: true, max: 100 },
        gender: { type: "enum", values: ["M", "F"], optional: true },
        age: { type: "number", optional: true, max: 100 },
      };
      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(validate);
      }
      const updateUser = await User.update(req.body, { where: { id } });
      res.status(200).json({ message: "User updated" });
    } catch (error) {
      console.log(error);
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      await User.destroy({ where: { id } });
      return res.status(200).json({ message: "User deleted" });
    } catch (error) {
      console.log(error);
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const updateUser = await User.update(req.body, { where: { id } });
      res.status(200).json({ message: "User updated" });
    } catch (error) {
      console.log(error);
    }
  },
};
