const express = require('express');
const router = express.Router()

//import model
const Category = require('../models/category')
const Plugin = require('../models/plugin')

//IMPORT MIDDLEWARE
const { checkAuth, checkAdm } = require('../middlewares/authentication')

//POST request - create category
router.post('/category', [checkAuth, checkAdm], async (req, res) => {
    try {
        const category = req.body.category
        const createCategory = await Category.create({type:category})
        
        if (createCategory) {
            return res.json({
                status: 'success'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error:error
        })
    }
})

//GET request - get all categories
router.get('/categories', async (req, res) => {
    try {
        let categories = await Category.find()
        res.json({
            success: true,
            data: categories
        })
        return
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'error',
            error: error
        })
    }
})

//DELETE request - delete category
router.delete('/category', [checkAuth, checkAdm], async(req,res) => {
    try {
        const categoryId = req.query.categoryId
        const plugins = await Plugin.find({category: categoryId})
        if (plugins.length > 0) {
            const response = {
                status: "fail",
                error: "Category in use. Please delete the plugins"
            }
            return res.json(response)
        }
        const r = await Category.deleteOne({_id:categoryId})
        if (r) {
            const toSend = {
                status: "success"
            }
            return res.json(toSend)
        }
        return
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: error
        })
    }
})

module.exports = router