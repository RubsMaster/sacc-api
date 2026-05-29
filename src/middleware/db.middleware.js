import { getPools } from '../config/db.js';

export const dbMiddleware = (req, res, next) => {
  const { production, sandbox } = getPools();
  const isProduction = req.headers['x-environment'] === 'production';
  req.db = isProduction ? production : sandbox;
  next();
};
