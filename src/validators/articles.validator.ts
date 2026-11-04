import Joi from 'joi';


export const createArticleSchema = Joi.object({
title: Joi.string().max(500).required(),
content: Joi.string().required(),
summary: Joi.string().allow(null, '').optional(),
tags: Joi.array().items(Joi.string()).optional(),
});


export const getArticlesQuerySchema = Joi.object({
limit: Joi.number().integer().min(1).max(100).default(10),
offset: Joi.number().integer().min(0).default(0),
tag: Joi.string().optional(),
});


export const searchArticlesQuerySchema = Joi.object({
q: Joi.string().min(1).max(200).required(),
limit: Joi.number().integer().min(1).max(100).default(10),
offset: Joi.number().integer().min(0).default(0),
});


export const trendingQuerySchema = Joi.object({
limit: Joi.number().integer().min(1).max(50).default(10),
days: Joi.number().integer().min(1).max(365).default(7),
});
