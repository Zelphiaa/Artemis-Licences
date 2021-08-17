const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//MODEL import
const Key = require("../models/key");
const User = require("../models/user");
const Sell = require("../models/sell");
const KeyUse = require("../models/usekey");
const Cart = require("../models/cart");
const Money = require("../models/moneyrecauded");

var KEY
//Middleware import
const { checkAuth, checkAdm } = require("../middlewares/authentication");
let checkExistKey = {};
let checkUseKey = {};
module.exports = function(io) {
  var currentConnections = [];
  let uniqueConnection = [];
  io.on("connection", socket => {
    console.log("new Connection " + socket.id);
    currentConnections[socket.id] = { socket: socket };
    socket.on("usekey", async data => {
      console.log("key=> " + data);
      await useKey(data);
      console.log(useKey.status);
      if (useKey.status == true) {
        socket.broadcast.to(socket.id).emit("fromBack", {
          message: "Key Valid"
        });
        currentConnections[socket.id].data = data;
        console.log(currentConnections[socket.id]);
        return;
      } else {
        socket.broadcast.to(socket.id).emit("fromBack", {
          message: "Key inalid"
        });
        console.log("invalid");
      }

      console.log("socket data => " + currentConnections[socket.id].data);
    });
    socket.on("disconnect", async () => {
      console.log("disconnecting... " + socket.id);
      await leftKey(currentConnections[socket.id].data);
    });
  });

  /* API REQUEST */
  //POST request - create key
  router.post("/admin/save-key", [checkAuth, checkAdm], async (req, res) => {
    if (!req.body.keyRandom || !req.body.IPs) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter key and IPs" });
    }

    try {
      const userId = req.body.userId;
      const key = req.body.keyRandom;
      const IPs = req.body.IPs;
      const pluginId = req.body.pluginId;

      const newKey = {
        key: key,
        userId: userId,
        IPs: IPs,
        pluginId: pluginId
      };
      const keyDB = await Key.create(newKey);
      const giveKey = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { keys: keyDB._id } }
      );

      return res.json({
        status: "success",
        message: "You has created a new key"
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: "error",
        error: error
      });
    }
  });
  router.post("/admin/use-key", async (req, res) => {
    if (!req.body.licence) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter licence" });
    }
      await useKey(req.body.licence)
      if (useKey.status == true) {
      return res.json({
        status: true,
        message: "SUCCESS"
      })
}
if (useKey.status == false) {
return res.json({
  status: "invalid",
  message: "UNSUCCESS"
})
}
    })
  router.put("/admin/key", [checkAuth, checkAdm], async (req, res) => {
    try {
      const id = req.query.id;
      const key = req.body.key;
      const IPs = req.body.IPs;

      const editKey = await Key.updateOne({ _id: id }, { key: key, IPs: IPs });
      if (editKey.n == 1 && editKey.ok == 1) {
        console.log(editKey);

        return res.json({
          status: "success"
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "error",
        error: error
      });
    }
  });

  //DELETE request - delete key
  router.delete("/admin/key", [checkAuth, checkAdm], async (req, res) => {
    try {
      const id = req.query.keyId;
      const userId = req.query.userId;
      //WE DELETE THE KEY
      const deletedKey = await Key.deleteOne({ _id: id });
      if (deletedKey) {
        //delete key from user
        const userDeleteKey = await User.findOneAndUpdate(
          { _id: userId },
          { $pull: { keys: { $in: id } } }
        );
        console.log(userDeleteKey);
        if (userDeleteKey) {
          return res.json({
            status: "success"
          });
        }
      }
      return res.status(400).json({
        status: "error"
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        error: error
      });
    }
  });

  router.get("/key", checkAuth, async (req, res) => {
    try {
      const userId = req.userData._id;
      const keys = await Key.find({ userId: userId });
      return res.json({
        status: "success",
        data: keys
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        error: error
      });
    }
  });

  router.put("/selectplugin", checkAuth, async (req, res) => {
    try {
      const userId = req.userData._id;
      const keyId = req.body.keyId;
      if (await selectedPlugin(userId, keyId)) {
        const toSend = {
          status: "success"
        };
        return res.json(toSend);
      } else {
        const toSend = {
          status: "error"
        };
        return res.json(toSend);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "error",
        error: error.message
      });
    }
  });

  router.get("/get-use-keys", checkAuth, async (req, res) => {
    try {
      const keyId = req.query.keyId;
      const findStatusKey = await KeyUse.find({ keyId: keyId });
      console.log(findStatusKey);
      if (findStatusKey) {
        return res.json({
          status: "success",
          data: findStatusKey
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: "error",
        error: error
      });
    }
  });

  //buy key
  router.post("/buykey", checkAuth, async (req, res) => {
    try {
      const pluginName = req.body.pluginName;
      const IPs = req.body.IPs;
      const userId = req.userData._id;
      const totalPrice = 0;
      const pluginId = req.body.pluginId;
      const key = req.body.keyRandom;

      const searchIfExistKey = await User.findOne({ _id: userId }).populate(
        "keys"
      );
      const setAllFalse = await User.updateMany({userId: userId}, {selected: false})
      if (searchIfExistKey) {
        let keysUser = searchIfExistKey.keys;
        const searchKey = keysUser.find(key => key.pluginName == pluginName);
        if (!searchKey) {
          const toCreate = {
            IPs: IPs,
            pluginName: pluginName,
            userId: userId,
            key: key.toUpperCase(),
            pluginId: pluginId,
            selected: true
          };
          const newKey = await Key.create(toCreate);
          if (newKey) {
            const setKeyUser = await User.findByIdAndUpdate(
              { _id: userId },
              { $push: { keys: newKey._id } },
              { runValidators: true, new: true }
            );
            let toReturnKey = {
              userId: userId,
              keyId: newKey._id,
              IPs: IPs,
              time: Date.now()
            };
            const sellKey = await Sell.create(toReturnKey);
            if (setKeyUser) {
              const createMoneyRecauded = {
                userId: userId,
                money: totalPrice,
                time: Date.now()
              };
              const saveMoney = await Money.create(createMoneyRecauded);
              return res.json({
                status: "success",
                message: "New key added"
              });
            }
            return res.status(500).json({
              status: "error",
              message: "error to create a key"
            });
          }
        } else {
          const _id = searchKey._id;
          const findKey = await Key.findOne({
            userId: userId,
            pluginName: pluginName
          });
          console.log(findKey);
          console.log(IPs);
          if (findKey) {
            const updateKey = await Key.findOneAndUpdate(
              { userId: userId, pluginName: pluginName },
              { $set: { IPs: findKey.IPs + Number(IPs) } },
              { runValidators: true, new: true }
            );
            console.log(updateKey);
            if (updateKey) {
              let toReturnKey = {
                userId: userId,
                keyId: _id,
                IPs: IPs,
                time: Date.now()
              };
              const sellKey = await Sell.create(toReturnKey);
              const createMoneyRecauded = {
                userId: userId,
                money: totalPrice,
                time: Date.now()
              };
              const saveMoney = await Money.create(createMoneyRecauded);
              return res.json({
                status: "success",
                message: "Key updated"
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "error",
        error: error
      });
    }
  });


  router.post("/pay-cart", checkAuth, async (req, res) => {
    try {
      createKey()
      let pluginData = req.body;
      const userId = req.userData._id;
      let key =     KEY

      const totalPrice = req.query.totalPrice;
      const searchIfExistKey = await User.findOne({ _id: userId }).populate(
        "keys"
      );
      let keysUser = searchIfExistKey.keys;
      if (searchIfExistKey) {
        const createMoneyRecauded = {
          userId: userId,
          money: totalPrice,
          time: Date.now()
        };
        const saveMoney = await Money.create(createMoneyRecauded);
        console.log(pluginData);
        pluginData.forEach(async element => {
          console.log(element.totalPrice);

          const searchKey = keysUser.find(
            key => key.pluginName == element.pluginName
          );
          if (!searchKey) {
            const toCreate = {
              IPs: element.IPs,
              pluginName: element.pluginName,
              userId: userId,
              pluginId: element.pluginId
            };
            const newKey = await Key.create(toCreate);
            if (newKey) {
              const setKeyUser = await User.findByIdAndUpdate(
                { _id: userId },
                { $push: { keys: newKey._id } },
                { runValidators: true, new: true }
              );
              if (setKeyUser) {
                const deleteCart = await Cart.findOneAndUpdate(
                  { userId: userId },
                  { $set: { plugins: [] } }
                );
                if (deleteCart) {
                  let toReturnKey = {
                    userId: userId,
                    keyId: newKey._id,
                    IPs: element.IPs,
                    time: Date.now()
                  };
                  const sellKey = await Sell.create(toReturnKey);

                  return res.json({
                    status: "success",
                    message: "New key added"
                  });
                }
              }
            }
          } else {
            const _id = searchKey._id;
            const findKey = await Key.findOne({
              userId: userId,
              pluginName: element.pluginName
            });
            if (findKey) {
              const updateKey = await Key.findOneAndUpdate(
                { userId: userId, pluginName: element.pluginName },
                { $set: { IPs: findKey.IPs + Number(element.IPs) } },
                { runValidators: true, new: true }
              );
              console.log(updateKey);
              if (updateKey) {
                const deleteCart = await Cart.findOneAndUpdate(
                  { userId: userId },
                  { $set: { plugins: [] } }
                );
                if (deleteCart) {
                  let toReturnKey = {
                    userId: userId,
                    keyId: _id,
                    IPs: element.IPs,
                    time: Date.now()
                  };
                  const sellKey = await Sell.create(toReturnKey);
                  console.log("updated");
                  return res.json({
                    status: "success",
                    message: "Key updated"
                  });
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "error",
        message: "error to create a key"
      });
    }
  });
  /* FUNCTIONS */
  async function selectedPlugin(userId, keyId) {
    try {
      const result = await Key.updateMany(
        { userId: userId },
        { selected: false }
      );
      const result2 = await Key.updateOne(
        { _id: keyId, userId: userId },
        { selected: true }
      );
      return true;
    } catch (error) {
      console.log("ERROR TO SELECT PLUGIN");
      console.log(error);
      return false;
    }
  }
  async function useKey(key, res) {
    try {
      console.log(key);
      if (key) {
        //verif if exist the key
        const keyDB = await Key.findOne({ key: key });
        if (keyDB) {
          //cap keyid
          const keyId = keyDB._id;
          const keyIPs = keyDB.IPs;
          const keyUseIps = keyDB.useIPs;

          //IF keyIP is higher than useIps
          if (keyIPs > keyUseIps) {
            const keyUpdate = await Key.findByIdAndUpdate(
              { _id: keyId },
              { useIPs: keyUseIps + 1 },
              { new: true, runValidators: true }
            );
            //Create historial use key
            const createUseKey = {
              keyId: keyId,
              useIPs: keyUpdate.useIPs,
              totalIPs: keyUpdate.IPs,
              time: Date.now()
            };
            const keyUseStatus = await KeyUse.create(createUseKey);
            console.log(keyUseStatus);
            if (keyUpdate.useIPs === keyUpdate.IPs) {
              console.log("change");
              const updateStatusKey = await Key.findByIdAndUpdate(
                { _id: keyId },
                { $set: { active: false } },
                { new: true, runValidators: true }
              );
              useKey.status = {};
              return (useKey.status = true);
            }
            useKey.status = {};
            return (useKey.status = true);
          }

          //IF keyIPs and usekey are same, return error
          if (keyIPs == keyUseIps) {
            useKey.status = {};
            return (useKey.status = false);
          }
        }
        useKey.status = {};
        return (useKey.status = false);
      }
      useKey.status = {};
      return (useKey.status = false);
    } catch (error) {
      console.log(error);
      return (useKey.status = false);
    }
  }
  async function leftKey(key) {
    try {
      const keyDB = await Key.findOne({ key: key });
      console.log(keyDB);
      if (keyDB) {
        if (keyDB.useIPs == 0) {
          return false;
        }
        const keyId = keyDB._id;

        const updateKeyUse = await Key.findByIdAndUpdate(
          { _id: keyId },
          { $set: { useIPs: keyDB.useIPs - 1, active: true } },
          { new: true, runValidators: true }
        );
        console.log(updateKeyUse);

        //Create historial use key
        const createUseKey = {
          keyId: keyId,
          useIPs: updateKeyUse.useIPs,
          totalIPs: updateKeyUse.IPs,
          time: Date.now()
        };
        const keyUseStatus = await KeyUse.create(createUseKey);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  function createKey() {
    KEY =  Math.random()
    .toString(36)
    .substr(3, 4) +
    "-" +
    Math.random()
      .toString(36)
      .substr(3, 4) +
    "-" +
    Math.random()
      .toString(36)
      .substr(3, 4) +
    "-" +
    Math.random()
      .toString(36)
      .substr(3, 4)
      .toUpperCase();
    setTimeout(() => {
      createKey;
    }, 1);
  }

  return router;
};
