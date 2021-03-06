import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
// node-config package
import config from 'config';
import cors from 'cors';
import helmet from 'helmet';
import breeScheduler from './lib/utils/breeScheduler';

// Libs
import mongooseConnection from './lib/connection/mongooseConnectionHandler';
import winstonLogger from './lib/logger/winston';

// Routes
// eslint-disable-next-line import/no-named-as-default-member
import index from './routes/index';
import users from './routes/users';
import patients from './routes/patients';

const db = config.get('application.db');

const app = express();
const port = process.env.PORT || 3001;

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());
app.use(morgan('combined', { stream: winstonLogger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Enable cors
const corsOptions = {
  allowedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Content-Type',
    'token',
  ],
  credentials: true,
  origin: (_origin, callback) => {
    callback(null, true);
  },
};
app.use(cors(corsOptions));
app.use(helmet());

// Apply Defined routes
app.use('/', index);
app.use('/users', users);
app.use('/patients', patients);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  winstonLogger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  next();
});

const dbOptions = {
  authSource: db.authSource,
  user: db.user || process.env.mongoUser,
  pass: db.password || process.env.mongoPassword,
  poolSize: db.poolSize,
  ssl: db.ssl || true,
  useNewUrlParser: true,
};

// MongoDB connection
mongooseConnection(db.uri, dbOptions);

breeScheduler();

app.listen(port, () =>
  // eslint-disable-next-line no-console
  winstonLogger.info(`Node application is listening on port ${port}!`),
);

export default app;
