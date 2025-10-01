# 📌 Invoice Tracker API

A backend service for tracking **invoices, transactions, and clients**.  
Built with **NestJS (Fastify)**, **PostgreSQL**, **Redis (cache)**, **TypeORM**, and **Swagger** for API documentation.

---

## Features

- **NestJS (Fastify)** — modern and fast backend framework.
- **PostgreSQL** — relational database for storing invoices, clients, transactions, etc.
- **Redis** — caching layer for performance (clients, bank names, payment methods).
- **TypeORM** — ORM for database entities and migrations.
- **Swagger** — interactive API documentation.
- **Docker & Docker Compose** — containerized development and production setup.
- **Environment-based configs** — separate `.env.development` and `.env.production`.

---

## How To Run:
**N.B.: Docker compose will bring in redis for caching, Postgress DB, and bring both frontend and backend services up.**

#### Development mode
```docker-compose --env-file ./backend/.env.development up --build -d```
<br/>
The above points docker to the dev environment file.

Alternatively, one can bring down all servies with the below command:
```docker-compose --env-file ./backend/.env.development down -v```



#### Production mode
Additionally for productions: <br/>
```docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file ./backend/.env.production up --build -d```
<br/>
- The above, is telling ```Docker``` to first loads docker-compose.yml, then overrides or merges anything defined in docker-compose.prod.yml.
- This allows you to have a base config (dev) and a production override.
###
Stop & clean (production):
```docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file ./backend/.env.production down -v```
<br/>```

#### Local Run
If you want to run this locally and debug through the code, then stop a service call ```invoice-tracker-backend```, and run this command:
<br/>
```NODE_ENV=development pnpm start:dev```
<br/>
This will run the app locally with development ```env``` file.


### Generating Tables
#### Step 1:
Creates a new migration file based on changes in your entities.
<br/>
```NODE_ENV=development pnpm migration:generate```
<br/>
**or**
<br/> 
```NODE_ENV=production pnpm migration:generate```
<br/>
***This creates a .ts migration file in your migrations folder.***


#### Step 2:
Applies migrations to your database.
<br/>
```NODE_ENV=development pnpm migration:run```
<br/>
**or**
<br/> 
```NODE_ENV=production pnpm migration:run```
<br/>
***Anytime you want to update your database schema according to existing migrations.***

### Step 3: Bonus
Reverts the last migration that was run.
<br/>
```NODE_ENV=development pnpm migration:revert```
<br/>
***Run this if there is a migration failiure or you want to undo the last applied migration.***
