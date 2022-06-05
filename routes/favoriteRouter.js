const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { response } = require('express');
const favorite = require('../models/favorite');

const favoriteRouter = express.Router();


//favorite
favoriteRouter.route('/')
.options(cors.corsWithOptions, (res,req) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user:req.user._id})
    .populate('user')
    .populate('campsites')
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if(favorite) {
            req.body.forEach(favrt => {
                if (!favorite.campsites.includes(favrt._id)) {
                    favorite.campsites.push(favrt._id);
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
               
        } else {
            Favorite.create({user:req.user._id})
            .then(favorite => {
                req.body.forEach(favrt => {
                    favorite.campsites.push(favrt._id);
                })
            
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }

    })
    .catch(err => next(err));
})
    
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        res.statusCode = 200;
        if (favorite) {
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete');
        }
    })
    .catch(err => next(err));
});


//single favorite

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (res,req) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteID');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if (favorite) {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('That campsite is already a favorite!');
            }
        } else {
            Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteID');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({user: req.user._id})
    .then (favorite => {
        if (favorite) {
            favorite.campsites = favorite.campsites.filter(favrt => favrt.toString() !== req.params.campsiteId );
            favorite.save()
            .then(favorite => {
                console.log('Campsite Deleted from your favorites!', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete');
        }
    })
    .catch(err => next(err));
});


module.exports = favoriteRouter;