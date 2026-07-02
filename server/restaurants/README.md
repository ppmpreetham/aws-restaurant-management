# restaurant-service (Sarthak's part)

Express + TypeScript API for restaurants, menus, inventory/capacity, and the
restaurant's side of order status (accept/reject). Backed by Postgres —
works with plain RDS Postgres today, portable to Aurora Postgres later with
zero code changes (just swap `DATABASE_URL`).

## API contract (share this with your team)

| Method | Path | Who calls it | What it does |
|---|---|---|---|
| GET | `/api/restaurants` | Frontend, Sahil's search | List all restaurants |
| GET | `/api/restaurants/:id` | Frontend | Single restaurant |
| POST | `/api/restaurants` | Admin/seeding | Create a restaurant |
| GET | `/api/restaurants/:id/menu` | Frontend | Menu items |
| POST | `/api/restaurants/:id/menu` | Admin/seeding | Add a menu item |
| PATCH | `/api/restaurants/:id/menu/:itemId` | Admin | Update a menu item |
| GET | `/api/restaurants/:id/inventory` | Arnav's Order MS, frontend | Capacity: `{ maxConcurrentOrders, activeOrders, canAcceptOrders }` |
| POST | `/api/restaurants/:id/orders` | Arnav's Order MS | New order coming in. Body: `{ externalOrderId, items }`. Returns 409 if restaurant is closed/at capacity. |
| GET | `/api/restaurants/:id/orders` | Frontend (owner dashboard) | List orders for a restaurant |
| PATCH | `/api/restaurants/:id/orders/:orderId` | Frontend (owner dashboard) | Restaurant decision. Body: `{ "status": "accepted" \| "rejected" \| "completed" }` |

There's also a `POST /api/restaurants/:id/orders/:orderId?status=accept|reject`
alias matching the original whiteboard's naming, in case a teammate already
coded against that exact shape.

## Run it locally (5 minutes)

You need Node 18+ and a Postgres database (local, Docker, or even a free
[Neon](https://neon.tech)/[Supabase](https://supabase.com) instance — anything
that gives you a `postgresql://...` connection string works for local dev).

```bash
npm install
cp .env.example .env        # edit DATABASE_URL to point at your Postgres
psql "$DATABASE_URL" -f src/schema.sql   # or run schema.sql in any GUI (pgAdmin/DBeaver)
npm run seed                 # loads 3 sample restaurants + menus
npm run dev                  # starts on http://localhost:4000
```

Check it's alive: `curl http://localhost:4000/health`

## Deploying on AWS Academy Learner Lab

Learner Lab only lets you use the pre-made **LabRole** — you can't create new
IAM roles/policies, so every step below sticks to that.

### 1. Start the lab & get into the console

Click **Start Lab** in your course page, wait for the green dot, then click
**AWS** to open the console. Everything below happens in **us-east-1**
(N. Virginia) unless your lab says otherwise.

### 2. Create the database (RDS Postgres)

1. Console → **RDS** → **Create database**
2. Choose **Standard create** → Engine: **PostgreSQL**
3. Templates: **Free tier**
4. Settings: DB instance identifier `restaurant-db`, master username `postgres`, set a password (write it down)
5. Instance: `db.t3.micro` (should be pre-selected under Free tier)
6. Storage: leave defaults
7. Connectivity: **Public access → Yes** (simplest for a course project — teammates and your EC2 all need to reach it). VPC security group: **Create new**, name it `restaurant-db-sg`
8. Create database — takes ~5–10 minutes

Once it's "Available", click into it and copy the **Endpoint** (looks like
`restaurant-db.xxxxx.us-east-1.rds.amazonaws.com`).

**Open the DB to your EC2 instances:** RDS → your DB → **Connectivity & security** →
click the VPC security group → **Edit inbound rules** → Add rule: Type
`PostgreSQL`, Port `5432`, Source `0.0.0.0/0` (fine for a course sandbox demo;
tighten to your VPC's CIDR if you want to be stricter).

### 3. Launch the server (EC2)

1. Console → **EC2** → **Launch instance**
2. Name: `restaurant-service`
3. AMI: **Amazon Linux 2023**
4. Instance type: `t2.micro`
5. Key pair: create one, download the `.pem` file (you need it to SSH in)
6. Network settings → **Edit** → security group: allow SSH (22) from your IP,
   and add a **Custom TCP** rule for port **4000** from `0.0.0.0/0` (so
   teammates + the frontend can reach your API)
7. **IAM instance profile**: select **LabInstanceProfile** (this is the
   Learner Lab's stand-in for a custom role)
8. Launch

SSH in once it's running:
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
```

Install Node and get your code onto the box:
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git
```

Upload your project (from your **local machine**, not the EC2 box):
```bash
scp -i your-key.pem -r restaurant-service ec2-user@<EC2-PUBLIC-IP>:~
```

Back on the EC2 box:
```bash
cd restaurant-service
npm install
cp .env.example .env
nano .env
```
Set:
```
PORT=4000
DATABASE_URL=postgresql://postgres:<password>@<RDS-ENDPOINT>:5432/postgres
ALLOWED_ORIGINS=*
```
(Use database name `postgres`, the default RDS creates — or create one
matching `restaurant_service` in pgAdmin/psql first, your call.)

Load the schema and sample data, then run it:
```bash
psql "$DATABASE_URL" -f src/schema.sql
npm run seed
npm run build
npx pm2 start dist/server.js --name restaurant-service
npx pm2 save
```
`pm2` keeps it running after you disconnect SSH. Test from your own laptop:
```
curl http://<EC2-PUBLIC-IP>:4000/health
```

**Learner Lab reminder:** the lab session resets when it ends — if your EC2/RDS
disappear after a break, that's expected; you'll redo steps 2–3 (keep this
README + your `.env` values handy so it's a 10-minute redo, not a rebuild).

## Deploying the frontend

Simplest path for a course demo: build it and serve the static files from
the same EC2 box, or from an S3 bucket with static website hosting turned on.
On the EC2 box:
```bash
cd restaurant-frontend
echo "VITE_API_URL=http://<EC2-PUBLIC-IP>:4000/api" > .env
npm install
npm run build
npx pm2 serve dist 5173 --name restaurant-frontend --spa
```
Open `http://<EC2-PUBLIC-IP>:5173` in a browser.

## Handing this off to your team

Give Arnav, Preetham, and Sahil the **API contract table** above plus your
EC2 IP once deployed. Arnav's Order service should call your
`POST /api/restaurants/:id/orders` when a customer places an order, and read
`GET /api/restaurants/:id/inventory` before letting the user checkout.
