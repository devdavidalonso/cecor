-- Clean up obsolete columns after schema migration
ALTER TABLE users DROP COLUMN IF EXISTS address;
ALTER TABLE students DROP COLUMN IF EXISTS emergency_contact;
ALTER TABLE students DROP COLUMN IF EXISTS additional_phone1;
ALTER TABLE students DROP COLUMN IF EXISTS additional_phone2;
