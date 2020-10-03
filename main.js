const express = require("express");
const passport = require("passport");

// importing keys from local file
const keys = require("./config/keys");

// middlewares
const expressMongoDb = require('express-mongo-db');

const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');

const cors = require("cors");
const csrf = require('csurf');
const procexss = require('node-procexss')
const helmet = require("helmet");

const flash = require('connect-flash');
const compression = require("compression");
const bodyParser = require("body-parser");
const requestIp = require('request-ip');

// inicializa aplicação express
const app = express();
app.set('env', 'production');

app.use(expressMongoDb(keys.MONGODB_URL));
app.use(express.static('./src/assets'));

// Define handlebars como engine principal
app.set("views", "src/views");
app.set("view engine", ".hbs");
app.engine(".hbs", require("./config/handlebars"));

// Inicializa middlewares.
const csrfProtection = csrf({ cookie: true })

app.use(cors({
    origin: 'http://localhost:8002',
    optionsSuccessStatus: 200
}));

// app.use(helmet());
// app.use(procexss({}));
// app.use(compression());
app.use(flash());
app.use(cookieParser());
app.use(requestIp.mw());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({}));

// Define uso dos cookies
app.use(
    cookieSession({
        maxAge: 4 * 60 * 60 * 1000, // o tempo de expiração dos cookies é de 4 horas
        keys: [keys.cookieKey] // a chave está localizada no arquivo keys.js em ./config
    })
);

// Inicializa serviço de autenticação passport
require("./src/services/passport");
app.use(passport.initialize());
app.use(passport.session());

/* Define rotas */
app.use("/auth", require("./src/controllers/authController")(csrfProtection));
app.use("/admin", require("./src/controllers/adminController"));
app.use("/game", require("./src/controllers/gameController"));
app.use("/kendy", require("./src/controllers/kendyController"));

app.get('/', async(req, res) => {
    if (!req.user) {
        res.redirect(`/auth/login`);
    } else {
        res.redirect(`/game`);
    }
});

// Define porta do servidor HTTP
const PORT = process.env.PORT || 8002;
// Inicia escuta na porta predefinida
app.listen(PORT, () => { console.log(`[!] Servidor web iniciado na porta ${PORT}`); })