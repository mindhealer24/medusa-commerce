import { Module } from "@medusajs/framework/utils";
import DbConnectionService from "./service";

export const DB_CONNECTION_MODULE = "dbConnectionService";

export default Module(DB_CONNECTION_MODULE, {
  service: DbConnectionService,
}); 