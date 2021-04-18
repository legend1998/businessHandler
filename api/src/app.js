const express = require("express");
require("express-async-errors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");
const path = require("path");

const logger = require("./helpers/logger.js");
const errorHandler = require("./helpers/error.js");

const index = require("./routes/index.js");
const tables = require("./routes/tables.js");
const users = require("./routes/users.js");
const accounts = require("./routes/accounts.js");
const items = require("./routes/items.js");
const locations = require("./routes/locations.js");
const customers = require("./routes/customers.js");
const orders = require("./routes/orders.js");
const currencies = require("./routes/currencies.js");
const shipments = require("./routes/shipments.js");
const logs = require("./routes/logs.js");
const productionrate = require("./routes/production-rates.js");
const rules = require("./routes/rules.js");

const app = express();
const port = process.env.PORT || 3001;

require("./helpers/constants.js");
require("./helpers/passport-jwt.js");
require("./helpers/email.js");
const { isLive, isLocal } = require("../config/environment.js");

app.use(cors());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(passport.initialize());

if (isLocal()) {
  app.use(logger);
}

const router = express();
router.use("/", index);
router.use("/tables", tables);
router.use("/users", users);
router.use("/accounts", accounts);
router.use("/items", items);
router.use("/rules", rules);
router.use("/productionRate", productionrate);
router.use("/locations", locations);
router.use("/customers", customers);
router.use("/orders", orders);
router.use("/currencies", currencies);
router.use("/shipments", shipments);
router.use("/logs", logs);
router.use(errorHandler);

if (isLive()) {
  const reactRouter = express();
  reactRouter.use(express.static(path.join(__dirname, `../../app/build`)));
  reactRouter.use(/\/[^.]*$/, (req, res) => {
    res.sendFile(path.join(__dirname, `../../app/build/index.html`));
  });

  app.enable("trust proxy");
  app.use((req, res, next) => {
    if (!req.secure)
      return res.redirect(`https://${req.headers.host}${req.originalUrl}`);
    if (
      req.headers.host === "erp.soen.solutions" ||
      req.headers.host === "soen390-erp.herokuapp.com"
    )
      reactRouter(req, res, next);
    else if (req.headers.host === "api.soen.solutions") router(req, res, next);
  });
} else if (isLocal()) {
  app.use("/", router);
}

app.listen(port, () => console.log(`Server started on port ${port}\n`));
