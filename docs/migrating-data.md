# Migrating Data

## Schema Changes Queuing up new Server Worker Tasks!!!

when a recipe schema is updated, we may need to queue up a new server worker task to gather new data

- (whatever we use to queue up server tasks after offline could work here too)

## Actions that DON'T require a migration

- if you add a new field to the schema, you need to migrate the data
- if you change a schema field, you need to migrate the data

## Actions that DO require a migration

- if you remove a field from the schema, you need to migrate the data
- if you change the type of a field, you need to migrate the data
- if you change the name of a field, you need to migrate the data
- if you change the order of fields, you need to migrate the data
- if you change the default value of a field, you need to migrate the data

## Follow these rules to avoid migrations

- never change a field type, add a new field instead
- never remove a field
- all fields should be optional

## Want to avoid spamming the database with a billion fields?

- set schema version numbers on the schema
- maybe delete data that doesn't match the schema?

- either way, we might need to have run time zod validations...

## Save yourself from crashing -> create a useSafeCoState hook

- create a useSafeCoState hook - this will only return data that matches the schema
  - this will force any bad data to never reach the client code
