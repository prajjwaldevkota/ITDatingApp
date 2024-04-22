import { config } from "dotenv";
config();
export const collection = process.env.AUTH;
export const PORT = process.env.PORT || 3045;
export const graphql = process.env.GRAPHQLURL;
export const appdb = process.env.DB;
export const userAuth = process.env.DBURL;
export const jwtSecret = 'z7#4fH9!QpA3L$b@2cE&dR1sT*mGITDATINGAPP121221@@@!321djfbsajbgfas@@hsjdggsjhdgfeHv#####'
