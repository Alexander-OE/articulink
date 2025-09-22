import Joi from 'joi';


export const createArticleSchema = Joi.object({
title: Joi.string().max(500).required(),
content: Joi.string().required(),
author: Joi.string().max(200).required(),
summary: Joi.string().allow(null, '').optional(),
tags: Joi.array().items(Joi.string()).optional(),
});


export const getArticlesQuerySchema = Joi.object({
limit: Joi.number().integer().min(1).max(100).default(10),
offset: Joi.number().integer().min(0).default(0),
});