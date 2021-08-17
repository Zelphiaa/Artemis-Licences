const express = require("express");
const router = express.Router();
const colors = require("colors");

//MODEL IMPORT
const Cart = require("../models/cart");
const User = require("../models/user");

//middleware
const { checkAuth } = require("../middlewares/authentication");

router.post("/new-cart", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const checkUserCart = await User.findOne({ _id: userId });
    if (!checkUserCart.cart) {
      const IPs = req.body.IPs;
      const pluginName = req.body.pluginName;
      const pluginId = req.body.pluginId;
      const totalPrice = req.body.totalPrice;
      const pluginImage = req.body.pluginImage;
      const price = req.body.price;
      console.log(price);

      let cart = new Cart();
      cart.userId = userId;
      cart.plugins.push({
        pluginName: pluginName,
        IPs: IPs,
        pluginId: pluginId,
        totalPrice: totalPrice,
        price: price,
        pluginImage: pluginImage
      });

      const createCart = await cart.save();
      console.log(createCart);

      if (createCart) {
        const setCartUser = await User.findOneAndUpdate(
          { _id: userId },
          { $set: { cart: createCart._id } }
        );

        if (setCartUser) {
          return res.json({
            status: "success"
          });
        }
      }
    }
    const IPs = req.body.IPs;
    const pluginName = req.body.pluginName;
    const pluginImage = req.body.pluginImage;
    var pluginId = req.body.pluginId;
    const price = req.body.price;
    const totalPrice = req.body.totalPrice;
    //console.log("lol " + pluginId);
    const findCart = await Cart.findOne({ userId: userId });

    if (findCart) {
      const plugins = findCart.plugins;

      const searchPlugin = plugins.find(plugin => plugin.pluginId === pluginId);
      if (!searchPlugin) {
        const toPush = {
          IPs: IPs,
          pluginId: pluginId,
          pluginName: pluginName,
          pluginImage: pluginImage,
          price: price,
          totalPrice: totalPrice
        };
        const newPlugin = await Cart.findOneAndUpdate(
          { _id: findCart._id },
          { $push: { plugins: toPush } },
          { new: true, runValidators: true }
        );
        console.log(newPlugin);
        if (newPlugin) {
          return res.json({
            message: "Updated cart lol"
          });
        }
      } else {
        const _id = searchPlugin._id;
        const act = await Cart.findOneAndUpdate(
          { _id: findCart._id, "plugins._id": _id },
          {
            $set: {
              "plugins.$.IPs": searchPlugin.IPs + IPs,
              "plugins.$.totalPrice": searchPlugin.totalPrice + totalPrice
            }
          },
          { new: true, runValidators: true }
        );
        if (act) {
          return res.json({
            message: "Updated cart"
          });
        }
        return;
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

router.get("/cart", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const findCart = await Cart.findOne({ userId: userId }).populate("userId");

    return res.json({
      status: "success",
      data: findCart
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

router.put("/cart", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const pluginId = req.query.pluginId;
    const number = req.body.number;

    const findCart = await Cart.findOne({ userId: userId });
    if (findCart) {
      const plugins = findCart.plugins;
      const searchPlugin = plugins.find(plugin => plugin._id == pluginId);
      if (searchPlugin) {
        if (number > 0) {
          const findPluginInCart = await Cart.findOneAndUpdate(
            { _id: findCart._id, "plugins._id": pluginId },
            { $set: { "plugins.$.IPs": searchPlugin.IPs + 1, "plugins.$.totalPrice": searchPlugin.totalPrice + searchPlugin.price  } },
            { new: true, runValidators: true }
          );
          return res.json({
            status: "success",
            message: "You has added quantity"
          });
        }

        if (number < 1) {
          const findPluginInCart = await Cart.findOneAndUpdate(
            { _id: findCart._id, "plugins._id": pluginId },
            { $set: { "plugins.$.IPs": searchPlugin.IPs - 1, "plugins.$.totalPrice": searchPlugin.totalPrice - searchPlugin.price } },
            { new: true, runValidators: true }
          );
          if (findPluginInCart) {
            let newPlugins = findPluginInCart.plugins
            const verifIPs0 = newPlugins.find(plugin => plugin.IPs === 0)
            if (verifIPs0) {
              console.log(verifIPs0);
              const deleteFromCart = await Cart.findOneAndUpdate({_id: findPluginInCart._id, "plugins._id":pluginId},{$pull: {plugins: {_id: pluginId}}})
              if (deleteFromCart) {
                return res.json({
                  status: "success",
                  message: "deleted"
                })
              }
            }
            return res.json({
              status: "success"
            })
          }
        }
      }
      return res.status(400).json({
        status: "error",
        message: "error"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

function incrementQuantity(plugins, plugin, IPs) {
  plugin.IPs = IPs;
  let indexOfPlugin = plugins.indexOf(plugin);
  plugins.splice(indexOfPlugin, 1, plugin);
}
module.exports = router;
