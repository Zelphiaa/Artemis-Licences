const express = require('express');
const router = express.Router()

//IMPORT MODEL
const Review = require('../models/review')
const Plugin = require('../models/plugin')
const Key = require('../models/key')

//IMPORT MIDDLEWARE
const { checkAuth, checkAdm } = require('../middlewares/authentication')



//POST request - create review
router.post('/review', checkAuth, async (req, res) => {
    try {
        const headline = req.body.headline
        const body = req.body.body
        const rating = req.body.rating
        const userId = req.userData._id
        const keyId = req.query.keyId
        const pluginId = req.query.pluginId
        const userName = req.body.userName
        const time = Date.now()

        const toCreate = {
            headline: headline,
            body: body,
            rating: rating,
            userId: userId,
            pluginId: pluginId,
            userName: userName,
            time: time
        }

        const createReview = await Review.create(toCreate)
        const updateKey = await Key.findOneAndUpdate({_id: keyId}, {$set: {review: true}})
        if (createReview) {
            const saveReviewPlugin = await Plugin.updateOne({_id: pluginId}, {$push: {reviews: createReview._id}})
            if (saveReviewPlugin) {
                return res.json({
                    status: 'success',
                })
            }
        }
    } catch (error) {
        const toReturn = {
            status: 'error',
            error: error
        }
        return res.status(500).json(toReturn)
    }
})


//GET request - get all Revies product
router.get('/reviews', async (req, res) => {
    try {
        const productReviews = await Review.find({pluginId: req.query.pluginId})
        if (productReviews) {
            return res.json({
                status: 'success',
                data: productReviews
            })
        }
    } catch (error) {
        const toReturn = {
            status: 'error',
            error: error
        }
        return res.status(500).json(toReturn)
    }
})

//GET request - single review
router.get('/review', checkAuth, async (req, res) => {
    try {
        const userId = req.userData._id
        const pluginId = req.query.pluginId
        console.log(req.query);
        const findReview = await Review.findOne({pluginId: pluginId, userId: userId}).populate("userId")
        return res.json({
            status: 'success',
            data: findReview
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "error",
            error: error
        })
    }
})



//PUT request - edit review
router.put("/review", checkAuth, async (req, res) => {
    try {
        const pluginId = req.query.pluginId
        const userId = req.userData._id
        const headLine = req.body.headline
        const body = req.body.body
        const rating = req.body.rating

        const findReview = await Review.findOne({pluginId: pluginId, userId: userId})
        if (findReview) {
            const editReview = await Review.findOneAndUpdate({_id: findReview._id}, {headline: headLine, body: body, rating: rating, time: Date.now()}, {runValidators: true, new: true})
            if (editReview) {
                return res.json({
                    status: "success",
                    message: "Review has edited"
                })
            }
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error
        })
    }
})
module.exports = router