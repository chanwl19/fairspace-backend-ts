"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const refreshRoute_1 = __importDefault(require("./routes/refreshRoute"));
const roleRoute_1 = __importDefault(require("./routes/roleRoute"));
const facilityRoute_1 = __importDefault(require("./routes/facilityRoute"));
const reservationRoute_1 = __importDefault(require("./routes/reservationRoute"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const authMiddleware = __importStar(require("./middlewares/authorize"));
dotenv_1.default.config();
const allowedOrigins = process.env.ALLOW_ORIGINS || ["https://fairspace.netlify.app"];
const env = process.env.ENV || 'dev';
const app = (0, express_1.default)();
// Cross Origin Resource Sharing
app.use((0, cors_1.default)(({
    origin: (origin, callback) => {
        if (env === 'dev') {
            callback(null, true);
        }
        else {
            if (allowedOrigins.indexOf(origin || "") !== -1 || !origin) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
})));
// built-in middleware to handle urlencoded form data
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
//middleware for cookies
app.use((0, cookie_parser_1.default)());
//Use helmet
app.use((0, helmet_1.default)());
//Route login to authRoute
app.use('/auth', authRoute_1.default);
//Route refresh to refreshRoute
app.use('/refresh', refreshRoute_1.default);
//Route user to userRoute
//app.use('/user', authMiddleware.isAuthorized, userRoute);
app.use('/user', authMiddleware.isAuthorized, userRoute_1.default);
//Route role to roleRoute
app.use('/role', authMiddleware.isAuthorized, roleRoute_1.default);
//Route role to facilityRoute
app.use('/facility', authMiddleware.isAuthorized, facilityRoute_1.default);
//Route role to reservationRoute
app.use('/reservation', authMiddleware.isAuthorized, reservationRoute_1.default);
//Catch error
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});
const port = parseInt(process.env.PORT || '3000');
mongoose_1.default
    .connect(process.env.MONGO_URI || '')
    .then(result => {
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})
    .catch(err => console.log(err));
