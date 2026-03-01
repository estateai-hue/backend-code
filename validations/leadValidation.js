import Joi from "joi";

export const createLeadSchema = Joi.object({
    clientName: Joi.string().min(2).required(),
    clientEmail: Joi.string().email().required(),
    clientPhone: Joi.string().allow("").optional(),
    requirement: Joi.string().allow("").optional(),
    assignedTo: Joi.string().optional(),
    companyId: Joi.string().optional(),
})