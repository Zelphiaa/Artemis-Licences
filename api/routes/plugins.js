const express = require("express");
const router = express.Router();
const fs = require("fs");

//IMPORT MODELS
const Plugin = require("../models/plugin");
const Category = require("../models/category");

//IMPORT MIDDLEWARE
const { checkAuth, checkAdm } = require("../middlewares/authentication");

router.post("/plugin", [checkAuth, checkAdm], async (req, res) => {
  try {
    var imageRoute = "";
    imageRoute = "static/";

    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded"
      });
    } else if (
      req.files.file.mimetype != "image/png" && req.files.file.mimetype != "image/jpeg") {
      res.send({
        status: false,
        message: "Solo png o jpg"
      });
      return;
    } else if (parseInt(req.files.file.size) > 2000000) {
      res.send({
        status: false,
        message: "El archivo debe ser menor a 2 Mb"
      });
      return;
    } else {
      var uploadedFile = req.files.file;
      var uploadPluginFile = req.files.pluginFile

      var extencion = getExtension(uploadedFile.name);
      var extencionPlugin = getExtension(uploadPluginFile.name);

      var filename = makeid(10) + extencion;
      var fileNamePlugin = makeid(10) + extencionPlugin

      uploadedFile.mv(imageRoute + "plugin-images/" + filename);
      uploadedFile.mv(imageRoute + "plugin_down/"+ fileNamePlugin);

      const category = req.body.category;
      const title = req.body.title;
      const description = req.body.description;
      const photo = "plugin-images/" + filename;
      const price = req.body.price;
      const pluginFile = "plugin_down/" + fileNamePlugin

      const toSend = {
        title: title,
        description: description,
        photo: photo,
        price: price,
        category: category,
        pluginFile: pluginFile,
      };
      const createPlugin = await Plugin.create(toSend);

      if (createPlugin) {
        return res.json({
          status: "success",
          data: createPlugin
        });
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

router.get("/plugins", async (req, res) => {
  try {
    const plugins = await Plugin.find().populate("category").populate("reviews", "rating").exec();
    return res.json({
      status: "success",
      data: plugins
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

router.get("/plugin/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const plugin = await Plugin.findOne({ _id: id }).populate("reviews rating").exec();

    if (plugin) {
      return res.json({
        status: "success",
        data: plugin
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

router.get('/plugin-download',checkAuth, async(req,res) => {
  try {
    const name = req.query.pluginName
    console.log(name);
    const findPlugin = await Plugin.findOne({title: name})
    if (findPlugin) {
      return res.status(200).json({
        status: "success",
        data: findPlugin.pluginFile
      })
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      error: error
    })
  }
})


router.put("/plugin/:id", [checkAuth, checkAdm], async (req, res) => {
  try {
    if (req.files == null) {
      const id = req.params.id;
      const title = req.body.title;
      const photo = req.body.photo;
      const description = req.body.description;
      const price = req.body.price;
      const oldPrice = req.body.oldPrice;

      const editPlugin = await Plugin.updateOne(
        { _id: id },
        {
          title: title,
          description: description,
          price: price,
          oldPrice: oldPrice,
          photo: photo
        }
      )

      if (editPlugin) {
        return res.json({
          status: "success"
        });
      }
    } else {
      var imageRoute = "";
      imageRoute = "static/";
      var uploadedFile = req.files.file;
      var extencion = getExtension(uploadedFile.name);
      var filename = makeid(10) + extencion;
      uploadedFile.mv(imageRoute + "plugin-images/" + filename);

      console.log(filename);
      const id = req.params.id;
      const photo = req.body.photo;
      const title = req.body.title;
      const description = req.body.description;
      const price = req.body.price;
      const file = "plugin-images/" + filename;
      const oldPrice = req.body.oldPrice;
      const editPlugin = await Plugin.updateOne(
        { _id: id },
        {
          title: title,
          description: description,
          price: price,
          oldPrice: oldPrice,
          photo: file
        }
      );

      if (editPlugin) {
        try {
          fs.unlinkSync("./static/" + photo);
          console.log("File removed");
          return res.json({
            status: "success"
          });
        } catch (error) {
          return console.log(error);
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


router.put("/pluginFile", [checkAuth, checkAdm], async(req,res) => {
  try {
    var imageRoute = ""
    imageRoute = 'static/'
    var uploadPluginFile = req.files.pluginFile
    var extencion = getExtension(uploadPluginFile.name);
    var fileName = makeid(10) + extencion
    uploadPluginFile.mv(imageRoute + 'plugin_down/' + fileName)

    const pluginFile = "plugin_down/"+fileName
    const findPlugin = await Plugin.findOne({_id: req.query.pluginId})
    const changeFile = await Plugin.findOneAndUpdate({_id: req.query.pluginId}, {pluginFile: pluginFile})
    if (changeFile) {
      try {
        fs.unlinkSync("./static/" + findPlugin.pluginFile);
        console.log("File removed");
        return res.json({
          status: "success"
        });
      } catch (error) {
        return console.log(error);
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error
    })
  }
})



router.get("/plugins-pagination", async (req, res) => {
  const queryLimit = Number(req.query.limit) || 5;
  const querySkip = Number(req.query.skip) || 0;

  try {
    const plugins = await Plugin.find()
      .skip(querySkip)
      .limit(queryLimit).populate("reviews rating").exec();

    //contar plugins
    const pluginsTotal = await Plugin.find().countDocuments();

    return res.json({
      status: "success",
      plugins: plugins,
      pluginsTotal: pluginsTotal
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      mensaje: "Ocurrio un error",
      error: error.message
    });
  }
});

router.delete("/plugin", [checkAuth, checkAdm], async (req, res) => {
  try {
    const pluginId = req.query.id;
    const findPlugin = await Plugin.findOne({_id: pluginId})
    if (findPlugin) {
      const pluginDelete = await Plugin.deleteOne({ _id: pluginId });
      if (pluginDelete) {
        try {
          fs.unlinkSync('./static/'+ findPlugin.photo)
          fs.unlinkSync('./static/'+findPlugin.pluginFile)
          console.log('Files removed');
          return res.json({
            status:"success",
          })
        } catch (error) {
          return console.log('error to delete files');
        }
      }
    }

    if (pluginDelete) {
      return res.json({
        status: "success"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

function getExtension(filename) {
  var i = filename.lastIndexOf(".");
  return i < 0 ? "" : filename.substr(i);
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;
