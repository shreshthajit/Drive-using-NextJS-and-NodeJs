const Joi = require('joi');

const UserValidator = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  phone: Joi.string(),
  address: Joi.string().required(),
  state: Joi.string(),
  description: Joi.string(),
  organization: Joi.string(),
  age: Joi.string().required(),
  island: Joi.string().required(),

  user_type: Joi.string().required(),
  notes: Joi.array(),
  attachments: Joi.array(),
});

const SignUpValidator = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  user_type: Joi.string().required(),
});

const FolderValidator = Joi.object({
  name: Joi.string().required(),
  parent: Joi.string().allow(null),
});

const CustomerValidator = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string(),
  address: Joi.string().required(),
  state: Joi.string(),
  description: Joi.string(),
  island: Joi.string(),

  customer_id: Joi.string().required(),
  organization: Joi.string().required(),
  added_by: Joi.string(),
  is_active: Joi.boolean().required(),
  attachments: Joi.array(),
});

const ContactValidator = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string(),
  address: Joi.string().required(),
  state: Joi.string(),
  description: Joi.string(),
  // island: Joi.string(),
  country: Joi.string(),
  contact_id: Joi.string().required(),
  organization: Joi.string().required(),
  added_by: Joi.string(),
  is_active: Joi.boolean().required(),
  attachments: Joi.array(),
});

const OrganizationValidator = Joi.object({
  name: Joi.string().required(),
  owner: Joi.string().required(),
  email: Joi.string().required(),
  island: Joi.string().required(),

  password: Joi.string().required(),
  description: Joi.string().required(),
  user_type: Joi.string().required(),
  established: Joi.string(),
});

const LogsValidator = Joi.object({
  reason: Joi.string().required(),
  visit_by: Joi.string().required(),
  user: Joi.string().required(),
  added_by: Joi.string(),
  is_deleted: Joi.boolean().required(),
});

const TicketsValidator = Joi.object({
  reason: Joi.string().required(),
  raised_by: Joi.string().required(),
  associated_to: Joi.string().required(),
  description: Joi.string().required(),
  organization: Joi.string().allow(''),
  status: Joi.string().required(),
  is_deleted: Joi.boolean().required(),
});

const NotesValidator = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  user: Joi.string(),
  added_by: Joi.string(),
  is_deleted: Joi.boolean().required(),
});

module.exports = {
  UserValidator,
  OrganizationValidator,
  LogsValidator,
  NotesValidator,
  TicketsValidator,
  CustomerValidator,
  ContactValidator,
  SignUpValidator,
  FolderValidator,
};
