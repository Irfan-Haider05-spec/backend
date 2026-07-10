import { z } from 'zod';
import { DisclaimerTypes } from './disclaimer.constants';

// create validation schema for disclaimer
const createUpdateDisclaimerZodSchema = z.object({
  body: z
    .object({
      type: z.nativeEnum(DisclaimerTypes, {
        required_error: 'Type is required',
      }),
      content: z
        .string({ required_error: 'Content is required' })
        .nonempty('Content cannot be empty'),
    })
    .strict(),
});

// get disclaimer by type validation schema
const getDisclaimerByTypeZodSchema = z.object({
  params: z.object({
    type: z.nativeEnum(DisclaimerTypes, {
      required_error: 'Type is required',
    }),
  }),
});

export const DisclaimerValidations = {
  createUpdateDisclaimerZodSchema,
  getDisclaimerByTypeZodSchema,
};
