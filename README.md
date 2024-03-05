setup:
sudo apt update
sudo apt install nodejs
sudo apt install npm
sudo apt install mongo OR install mongodb some other way

npm init -y

npm install express leaflet
npm install passport passport-local express-session body-parser
npm install mongoose bcrypt
npm install express-session connect-flash

To run:
mongod (for database in seperate terminal)
node server.js (then goto http://localhost:3000)
