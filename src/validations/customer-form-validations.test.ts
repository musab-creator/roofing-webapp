import { describe, expect, it } from 'vitest';
import {
  addCustomerFormSchema,
  updateCustomerFormSchema
} from './customer-form-validations';

const validCustomer = {
  first_name: 'Jane',
  last_name: 'Doe',
  customer_type: '1',
  email: 'jane@example.com',
  phone_number: '5551234567',
  street_address: '123 Main St',
  city: 'Houston',
  state: 'TX',
  zipcode: '77076'
};

describe('addCustomerFormSchema', () => {
  it('accepts a well-formed customer payload', () => {
    const result = addCustomerFormSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = addCustomerFormSchema.safeParse({
      ...validCustomer,
      email: 'not-an-email'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'email')).toBe(true);
    }
  });

  it('rejects a phone number shorter than 10 digits when provided', () => {
    const result = addCustomerFormSchema.safeParse({
      ...validCustomer,
      phone_number: '555'
    });
    expect(result.success).toBe(false);
  });

  it('rejects a state that is not exactly 2 characters', () => {
    const texas = addCustomerFormSchema.safeParse({ ...validCustomer, state: 'Texas' });
    expect(texas.success).toBe(false);

    const single = addCustomerFormSchema.safeParse({ ...validCustomer, state: 'T' });
    expect(single.success).toBe(false);
  });

  it('rejects a city shorter than 3 characters', () => {
    const result = addCustomerFormSchema.safeParse({ ...validCustomer, city: 'NY' });
    expect(result.success).toBe(false);
  });

  it('allows phone_number and street_address to be omitted on create', () => {
    const { phone_number, street_address, ...rest } = validCustomer;
    const result = addCustomerFormSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });
});

describe('updateCustomerFormSchema', () => {
  it('requires an id for updates', () => {
    const result = updateCustomerFormSchema.safeParse(validCustomer);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'id')).toBe(true);
    }
  });

  it('requires a phone number on update (unlike create)', () => {
    const { phone_number, ...rest } = validCustomer;
    const result = updateCustomerFormSchema.safeParse({ ...rest, id: 'cust-1' });
    expect(result.success).toBe(false);
  });

  it('accepts a complete update payload', () => {
    const result = updateCustomerFormSchema.safeParse({ ...validCustomer, id: 'cust-1' });
    expect(result.success).toBe(true);
  });
});
