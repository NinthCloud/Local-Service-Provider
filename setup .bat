@echo off
echo ------------------------------------------
echo  🚀 Setting up Project for Windows Users
echo ------------------------------------------

REM Backend setup
echo 🔧 Installing backend dependencies...
cd api
call yarn

IF NOT EXIST .env (
    echo 📄 Creating .env file...
    (
        echo JWT_KEY = your_key
        echo DB_NAME=your_db
        echo DB_USER=your_user
        echo DB_PASS=uour_password
        echo DB_HOST=localhost
        echo STRIPE = your_private_key
    ) > .env
) ELSE (
    echo ✅ .env already exists. Skipping .env creation.
)
cd..

REM Frontend setup
echo 🎨 Installing frontend dependencies...
cd client
call yarn
cd..

echo ------------------------------------------
echo ✅ Setup complete!
echo 👉 Next steps:
echo    1. Edit the .env file in /server with your credentials
echo    2. Run the app using:
echo       - Backend: cd server && npm start
echo       - Frontend: cd client && npm start
echo ------------------------------------------

pause
