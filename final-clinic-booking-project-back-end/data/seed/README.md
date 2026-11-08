# Clinic booking backend

## Import reference data with MongoDB Database Tools

The `data/seed` directory contains JSON arrays for the clinic's specialties and
services. `mongoimport` does not read `.env` automatically, so from this
directory set the PowerShell variable to the same URI as `MONGODB_URI` in `.env`
(replace the example if your URI is different), then run:

```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/clinic_booking"
mongoimport --uri="$env:MONGODB_URI" --collection=specialties --file=data/seed/specialties.json --jsonArray --mode=upsert --upsertFields=name
mongoimport --uri="$env:MONGODB_URI" --collection=services --file=data/seed/services.json --jsonArray --mode=upsert --upsertFields=name
```

`mongoimport` is included with MongoDB Database Tools. `--mode=upsert` updates a
matching document by its unique `name` rather than inserting duplicates.

Alternatively, in MongoDB Compass, connect with the URI in `.env`, open the
database named by that URI, and import each file as a JSON array into its
matching `specialties` or `services` collection.

These files contain catalog data only, not accounts. To create the administrator
account, configure `ADMIN_PHONE` and `ADMIN_PASSWORD` in `.env` and run:

```powershell
npm run seed
```

The seed command also creates any missing specialty and service records.
