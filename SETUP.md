# Инструкции по установке и запуску

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
# Установка всех зависимостей (корневой проект, сервер и клиент)
npm run install-all
```

### 2. Настройка базы данных
Убедитесь, что у вас установлена и запущена MongoDB:
```bash
# Запуск MongoDB (если установлена локально)
mongod
```

### 3. Настройка переменных окружения
Создайте файл `.env` в папке `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/friendly-camp-blog
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Запуск приложения
```bash
# Запуск сервера и клиента одновременно
npm run dev
```

### 5. Открытие в браузере
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Подробные инструкции

### Предварительные требования

1. **Node.js** (версия 16 или выше)
   ```bash
   node --version
   npm --version
   ```

2. **MongoDB** (локально или MongoDB Atlas)
   - Локальная установка: https://docs.mongodb.com/manual/installation/
   - Или используйте MongoDB Atlas: https://www.mongodb.com/atlas

3. **Git** (для клонирования репозитория)

### Пошаговая установка

#### Шаг 1: Клонирование репозитория
```bash
git clone <repository-url>
cd friendly-camp
```

#### Шаг 2: Установка зависимостей
```bash
# Установка зависимостей корневого проекта
npm install

# Установка зависимостей сервера
cd server
npm install

# Установка зависимостей клиента
cd ../client
npm install

# Возврат в корневую папку
cd ..
```

#### Шаг 3: Настройка базы данных

**Вариант A: Локальная MongoDB**
```bash
# Запуск MongoDB сервера
mongod

# В новом терминале проверка подключения
mongo
# или
mongosh
```

**Вариант B: MongoDB Atlas**
1. Создайте аккаунт на https://www.mongodb.com/atlas
2. Создайте новый кластер
3. Получите строку подключения
4. Обновите `MONGODB_URI` в файле `.env`

#### Шаг 4: Настройка переменных окружения

Создайте файл `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/friendly-camp-blog
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Важно:** Измените `JWT_SECRET` на уникальный секретный ключ для продакшена!

#### Шаг 5: Запуск приложения

**Вариант A: Запуск всего приложения**
```bash
npm run dev
```

**Вариант B: Запуск по отдельности**
```bash
# Терминал 1: Запуск сервера
npm run server

# Терминал 2: Запуск клиента
npm run client
```

#### Шаг 6: Проверка работы

1. Откройте http://localhost:3000 в браузере
2. Зарегистрируйтесь как новый пользователь
3. Создайте первый пост
4. Проверьте все функции

## 🔧 Возможные проблемы и решения

### Проблема: MongoDB не подключается
**Решение:**
```bash
# Проверьте, что MongoDB запущена
sudo systemctl status mongod

# Или запустите вручную
mongod
```

### Проблема: Порт 3000 занят
**Решение:**
```bash
# Найдите процесс, использующий порт 3000
lsof -i :3000

# Убейте процесс
kill -9 <PID>
```

### Проблема: Порт 5000 занят
**Решение:**
```bash
# Найдите процесс, использующий порт 5000
lsof -i :5000

# Убейте процесс
kill -9 <PID>
```

### Проблема: Ошибки при установке зависимостей
**Решение:**
```bash
# Очистите кэш npm
npm cache clean --force

# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json
rm -rf client/node_modules client/package-lock.json

# Переустановите зависимости
npm run install-all
```

## 🧪 Тестирование

### Проверка API
```bash
# Проверка здоровья сервера
curl http://localhost:5000/api/health

# Должен вернуть:
# {"status":"OK","message":"Friendly Camp Blog API is running"}
```

### Проверка базы данных
```bash
# Подключение к MongoDB
mongo
# или
mongosh

# Переключение на базу данных
use friendly-camp-blog

# Просмотр коллекций
show collections

# Просмотр пользователей
db.users.find()
```

## 📁 Структура проекта

```
friendly-camp/
├── server/                 # Backend
│   ├── models/            # Mongoose модели
│   │   ├── User.js       # Модель пользователя
│   │   ├── Post.js       # Модель поста
│   │   └── Comment.js    # Модель комментария
│   ├── routes/            # API маршруты
│   │   ├── auth.js       # Аутентификация
│   │   ├── posts.js      # Посты
│   │   ├── users.js      # Пользователи
│   │   └── comments.js   # Комментарии
│   ├── middleware/        # Middleware функции
│   │   └── auth.js       # JWT аутентификация
│   ├── index.js           # Основной файл сервера
│   ├── package.json       # Зависимости сервера
│   └── .env              # Переменные окружения
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── contexts/      # React контексты
│   │   ├── services/      # API сервисы
│   │   ├── types/         # TypeScript типы
│   │   └── App.tsx        # Основной компонент
│   ├── public/            # Статические файлы
│   └── package.json       # Зависимости клиента
├── package.json           # Корневой package.json
├── README.md             # Документация проекта
└── SETUP.md              # Инструкции по установке
```

## 🚀 Развертывание в продакшене

### 1. Подготовка к продакшену
```bash
# Сборка клиента
cd client
npm run build

# Настройка переменных окружения для продакшена
# Создайте server/.env.production
```

### 2. Использование PM2
```bash
# Установка PM2
npm install -g pm2

# Запуск сервера с PM2
cd server
pm2 start index.js --name "friendly-camp-api"

# Мониторинг
pm2 status
pm2 logs
```

### 3. Настройка Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи сервера и клиента
2. Убедитесь, что все зависимости установлены
3. Проверьте подключение к базе данных
4. Убедитесь, что порты не заняты другими процессами

Для получения помощи создайте issue в репозитории проекта.
