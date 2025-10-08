const Joi = require('joi');

const listingSchema = Joi.object({
  title      : Joi.string().required(),
  description: Joi.string().required(),
  price      : Joi.number().min(0).required(),
  location   : Joi.string().required(),
  country    : Joi.string().required(),

  
  image      : Joi.any().optional()
});

module.exports = { listingSchema };

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(), 
});