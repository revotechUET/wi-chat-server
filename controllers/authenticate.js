"use strict";
const User = require('../database/db-connect').User;
const jwt = require('jsonwebtoken');
let responseJSON = require('./response');
let randomColor = require('./randomColor');
module.exports = function authenticate() {
    return function (req, res, next) {
        if (req.originalUrl == '/login') {
            next();
        } else {
            let token = req.body.token || req.query.token || req.headers.authorization;
            if (token) {
                // console.log('auth', token);
                jwt.verify(token, 'secretKey', function (err, decoded) {
                    // console.log('decoded: ', decoded);
                    req.decode = decoded;
                    if (err) {
                        console.error(err);
                        return res.status(401).send(responseJSON(401, 'Failed to authenticate' + err));
                    } else {
                        // console.log(decoded);
                        User.findOne({
                            where: {
                                username: decoded.username
                            }
                        }).then((user) => {
                            if (user) {
                                req.decoded = user.toJSON();
                                next();
                            } else {
                                User.create({
                                    username: decoded.username,
                                    password: '=========================',
                                    role: decoded.role,
                                    color: randomColor()
                                    // idCompany: 1
                                }).then(user => {
                                    req.decoded = user.toJSON();
                                    next();
                                }).catch(err => {
                                    return res.status(401).send(responseJSON(401, 'Failed to authenticate' + err));
                                });
                            }
                        });
                    }
                });
            } else {
                return res.status(401).send(responseJSON(401, 'No token provided'));
            }
        }
    }
}
